package builder

import (
	"bufio"
	"bytes"
	"fmt"
	"io/ioutil"
	"log"
	"net/textproto"
	"os"
	"path"
	"regexp"
	"strings"
	"time"

	"../../../net/mail"
	"../../models"
	"../../util"
	"../RFC2047"
)

// MailBuilder 发送邮件的时候，构造邮件的报文
type MailBuilder struct {
	Subject                    string
	Message, Uidl, Attachments string
	From                       *mail.Address
	To, Cc, Bcc                []*mail.Address
	SrvConfig                  *models.ServerConfig
	headers                    textproto.MIMEHeader
	body                       []byte
}

// 构造邮件头部的信息
func (m *MailBuilder) encloseHead() error {
	m.headers = textproto.MIMEHeader{}

	m.headers.Set("From", m.From.String())
	m.headers.Set("To", util.AddressToString(m.To))
	m.headers.Set("Subject", RFC2047.Encode(m.Subject))
	m.headers.Set("Date", time.Now().Format("Mon, 2 Jan 2006 15:04:05 -0700"))

	var cc = util.AddressToString(m.Cc)
	if cc != "" {
		m.headers.Set("Cc", cc)
	}

	if m.Uidl != "" {
		m.appendOriginalHeaders()
	} else {
		// TODO(user) 如何生成 Thread-Topic 和 Thread-Index 呢？
		// https://searchcode.com/codesearch/view/34697166/#l-495
		// http://managing.blue/2007/12/11/trying-to-make-use-of-outlooks-thread-index-header/
		// https://developer.gnome.org/evolution-exchange/stable/ximian-connector-mail-threading.html
		m.headers.Set("Thread-Topic", RFC2047.Encode(m.Subject))
	}

	return nil
}

// 构造邮件的正文信息
func (m *MailBuilder) encloseBody() error {
	// 查找HTML邮件内容中是否存在Content-Id的引用
	var inlineResources []string // 邮件中内联的资源
	var re = regexp.MustCompile(`src="downloads/([^/]+)/cid/([^"]+)"`)
	var sm = re.FindAllSubmatch([]byte(m.Message), -1)
	for _, match := range sm {
		var src = path.Join(string(match[1]), "cid", string(match[2]))
		if _, err := os.Stat(path.Join(m.SrvConfig.BaseDir, "downloads", src)); err == nil {
			// 如果存在的话，那么就追加上
			inlineResources = append(inlineResources, src)
		} else {
			log.Printf("No such Content-Id: %s\n", src)
		}
	}
	if len(inlineResources) > 0 {
		// 如果存在的话，替换HTML内容中的资源引用方式
		// 参考：https://www.ietf.org/rfc/rfc2392.txt
		m.Message = re.ReplaceAllString(m.Message, `src="cid:$2"`)
	}

	var attachments []string // 邮件的附件
	if m.Attachments != "" {
		attachments = strings.Split(m.Attachments, ",")
	}

	var err error
	var ref = make([]Envelope, 1)

	if len(inlineResources) > 0 && len(attachments) <= 0 {
		ref[0] = &RelatedEnvelope{
			Message:    m.Message,
			ContentIds: inlineResources,
		}
	} else if len(attachments) > 0 {
		ref[0] = &MixedEnvelope{
			Message:     m.Message,
			ContentIds:  inlineResources,
			Attachments: attachments,
		}
	} else {
		ref[0] = &SimpleEnvelope{m.Message}
	}

	m.body, err = ref[0].Enclose(m)
	for k, v := range ref[0].Headers() {
		m.headers.Set(k, v[0])
	}

	return err
}

// 回复或者转发邮件的时候，把关联邮件的邮件头里面的信息加上
func (m *MailBuilder) appendOriginalHeaders() {
	// 相关邮件的原始文本信息
	var abs = path.Join(m.SrvConfig.BaseDir, "raw", m.Uidl+".txt")

	fi, err := os.Open(abs)
	if err != nil {
		abs = path.Join(m.SrvConfig.BaseDir, "raw", "sent", m.Uidl+".txt")
		fi, err = os.Open(abs)
		if err != nil {
			log.Println(err)
			return
		}
	}
	defer fi.Close()

	reader := bufio.NewReader(fi)
	msg, err := mail.ReadMessage(reader)
	if err != nil {
		log.Println(err)
		return
	}

	msgID := msg.Header.Get("Message-ID")
	if msgID != "" {
		m.headers.Set("In-Reply-To", "\n "+msgID)
		references := msg.Header.Get("References")
		if references != "" {
			// By RFC 2822, the most immediate parent should appear last
			// in the "References" header, so this order is intentional.
			// TODO(user) 所以这个逻辑可能是不太对的
			m.headers.Set("References", references+"\n "+msgID)
		} else {
			m.headers.Set("References", "\n "+msgID)
		}
	}

	threadTopic := msg.Header.Get("Thread-Topic")
	if threadTopic != "" {
		m.headers.Set("Thread-Topic", threadTopic)
	}
	threadIndex := msg.Header.Get("Thread-Index")
	if threadIndex != "" {
		m.headers.Set("Thread-Index", threadIndex)
	}
}

// name的格式可能是这样子的
// 123456/cid/a.gif
// abcdef/att/b.doc
// tmpdir/cid/aaa.gif
// tmpdir/att/aaa.gif
// 这是一个接口的实现
func (m *MailBuilder) Read(name string) ([]byte, error) {
	return ioutil.ReadFile(path.Join(m.SrvConfig.BaseDir, "downloads", name))
}

// Enclose 构造邮件的报文，如果成功了，发送出去，否则就是失败了呗
func (m *MailBuilder) Enclose() (*bytes.Buffer, error) {
	var err error

	err = m.encloseHead()
	if err != nil {
		return nil, err
	}

	err = m.encloseBody()
	if err != nil {
		return nil, err
	}

	var raw = new(bytes.Buffer)
	for k, v := range m.headers {
		raw.WriteString(fmt.Sprintf("%s: %s\r\n", k, v[0]))
	}
	raw.WriteString("\r\n")
	raw.Write(m.body)

	return raw, nil
}
