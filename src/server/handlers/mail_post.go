package handlers

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/textproto"
	"os"
	"path"
	"regexp"
	"strings"
	"time"

	"../RFC2047"
	"../base"
	"../net/mail"
	"../web"
)

type RawResourceReader struct {
	config *base.ServerConfig
}

// name的格式可能是这样子的
// 123456/cid/a.gif
// abcdef/att/b.doc
// tmpdir/cid/aaa.gif
// tmpdir/att/aaa.gif
func (rrr RawResourceReader) Read(name string) ([]byte, error) {
	return ioutil.ReadFile(path.Join(rrr.config.DownloadDir(), name))
}

type MailPostHandler struct {
	Context web.Context
}

func (h MailPostHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := h.Context
	log := ctx.GetLogger()
	config := ctx.GetConfig()

	// 准备参数
	from, err := mail.ParseAddress(RFC2047.Encode(config.Frontend.Name) +
		" <" + config.Frontend.From + ">")
	if err != nil || from == nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	to := getAddressList(r.FormValue("to"))
	cc := getAddressList(r.FormValue("cc"))

	subject := r.FormValue("subject")
	message := r.FormValue("message")

	// 准备Header
	headers := textproto.MIMEHeader{}
	headers.Set("From", from.String())
	headers.Set("To", base.AddressToString(to))
	headers.Set("Cc", base.AddressToString(cc))
	headers.Set("Subject", RFC2047.Encode(subject))
	headers.Set("Date", time.Now().Format("Mon, 2 Jan 2006 15:04:05 -0700"))

	uidl := r.FormValue("uidl")
	if uidl != "" {
		attachOriginalHeaders(uidl, &headers, ctx)
	} else {
		headers.Set("Thread-Topic", RFC2047.Encode(subject))
		// TODO(user) 如何生成 Thread-Topic 和 Thread-Index 呢？
		// https://searchcode.com/codesearch/view/34697166/#l-495
		// http://managing.blue/2007/12/11/trying-to-make-use-of-outlooks-thread-index-header/
		// https://developer.gnome.org/evolution-exchange/stable/ximian-connector-mail-threading.html
	}

	var attachments []string
	var contentIds []string
	var body []byte

	if r.FormValue("attachments") != "" {
		// TODO(user) 校验合法性
		attachments = strings.Split(r.FormValue("attachments"), ",")
	}

	// 查找HTML邮件内容中是否存在Content-Id的引用
	re := regexp.MustCompile(`src="downloads/([^/]+)/cid/([^"]+)"`)
	sm := re.FindAllSubmatch([]byte(message), -1)
	for _, match := range sm {
		src := path.Join(string(match[1]), "cid", string(match[2]))
		if _, err := os.Stat(path.Join(config.DownloadDir(), src)); err == nil {
			contentIds = append(contentIds, src)
		}
	}
	if len(contentIds) > 0 {
		// 如果存在的话，替换HTML内容中的资源引用方式
		// 参考：https://www.ietf.org/rfc/rfc2392.txt
		message = re.ReplaceAllString(message, `src="cid:$2"`)
	}

	rrr := RawResourceReader{config}
	if len(contentIds) > 0 && len(attachments) <= 0 {
		re := base.RelatedEnvelope{
			Message:    message,
			ContentIds: contentIds,
		}
		body, err = re.Enclose(rrr)
		for k, v := range re.Headers() {
			headers.Set(k, v[0])
		}
	} else if len(attachments) > 0 {
		me := base.MixedEnvelope{
			Message:     message,
			ContentIds:  contentIds,
			Attachments: attachments,
		}
		body, err = me.Enclose(rrr)
		for k, v := range me.Headers() {
			headers.Set(k, v[0])
		}
	} else {
		se := base.SimpleEnvelope{message}
		body, err = se.Enclose(rrr)
		for k, v := range se.Headers() {
			headers.Set(k, v[0])
		}
	}

	if err != nil {
		log.Warning("%v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 构造整个邮件的内容
	raw := &bytes.Buffer{}
	for k, v := range headers {
		raw.WriteString(fmt.Sprintf("%s: %s\r\n", k, v[0]))
	}
	raw.WriteString("\r\n")
	raw.Write(body)

	// 已发送邮件的uidl
	uidl = fmt.Sprintf("%d", time.Now().UnixNano())

	// 开始发送邮件
	go sendMail(ctx, from, to, cc, uidl, raw.Bytes())

	// 保存邮件到数据库
	go saveMail(ctx, uidl, raw.Bytes())

	s, _ := json.MarshalIndent(
		base.NewSimpleResponse("true"), "", "    ")
	w.Write(s)
}

func saveMail(ctx web.Context, uidl string, raw []byte) {
	log := ctx.GetLogger()
	config := ctx.GetConfig()
	db := ctx.GetDb()

	email, err := base.SaveMail(raw, uidl, config)
	if err != nil {
		log.Warning("%s", err)
		return
	}

	// 保存到数据库
	email.Uidl = uidl
	email.IsSent = 1
	email.IsRead = 1
	// email.Date = time.Now()
	email.Id, err = email.Store(db)
	if err != nil {
		log.Warning("%s", err)
	}
}

// goroutine delivery email
func sendMail(
	ctx web.Context,
	from *mail.Address,
	to []*mail.Address,
	cc []*mail.Address,
	uidl string,
	raw []byte) {

	log := ctx.GetLogger()
	config := ctx.GetConfig()

	smtpserver := config.Smtp.GetHostName()
	tls := config.Smtp.Tls
	auth := base.LoginAuth(config.Smtp.Username, config.Smtp.Password)

	err := base.SendMail(from, to, cc, raw, smtpserver, tls, auth)
	if err != nil {
		log.Warning(err.Error())
		return
	}

	// 保存发送之后的邮件到本地
	name := uidl + ".txt"
	os.MkdirAll(path.Join(config.RawDir(), "sent"), 0755)
	err = ioutil.WriteFile(path.Join(config.RawDir(), "sent", name), raw, 0644)
	if err != nil {
		log.Warning(err.Error())
		return
	}
	log.Info("Saved Sent mail = %s", name)
}

// 附加原始文件的头信息
func attachOriginalHeaders(
	uidl string,
	headers *textproto.MIMEHeader,
	ctx web.Context) {

	log := ctx.GetLogger()
	config := ctx.GetConfig()

	fi, err := os.Open(path.Join(config.RawDir(), uidl+".txt"))
	if err != nil {
		log.Warning(err.Error())
		return
	}
	defer fi.Close()

	reader := bufio.NewReader(fi)
	msg, err := mail.ReadMessage(reader)
	if err != nil {
		log.Warning(err.Error())
		return
	}

	messageId := msg.Header.Get("Message-ID")
	if messageId != "" {
		headers.Set("In-Reply-To", "\n "+messageId)
		references := msg.Header.Get("References")
		if references != "" {
			// By RFC 2822, the most immediate parent should appear last
			// in the "References" header, so this order is intentional.
			// TODO(user) 所以这个逻辑可能是不太对的
			headers.Set("References", references+"\n "+messageId)
		} else {
			headers.Set("References", "\n "+messageId)
		}
	}

	threadTopic := msg.Header.Get("Thread-Topic")
	if threadTopic != "" {
		headers.Set("Thread-Topic", threadTopic)
	}
	threadIndex := msg.Header.Get("Thread-Index")
	if threadIndex != "" {
		headers.Set("Thread-Index", threadIndex)
	}
}

func getAddressList(value string) []*mail.Address {
	var list []*mail.Address
	for _, item := range strings.Split(value, "; ") {
		v, err := mail.ParseAddress(item)
		if err == nil {
			list = append(list, v)
		}
	}
	return list
}
