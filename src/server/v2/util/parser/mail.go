package parser

import (
	"bufio"
	"bytes"
	"encoding/base64"
	"fmt"
	"html"
	"io"
	"io/ioutil"
	"log"
	"mime"
	"mime/multipart"
	"net/textproto"
	"regexp"
	"strings"
	"time"

	"github.com/alexcesaro/mail/quotedprintable"
	"github.com/saintfish/chardet"

	".."
	"../../../net/mail"
	"../../models"
	"../RFC2047"
)

// NewEmailFallback 只解析邮件头，得到一个简单的邮件信息
func NewEmailFallback(raw []byte) (*models.Email, error) {
	var idx = bytes.Index(raw, []byte("\n\n"))

	if idx == -1 {
		idx = len(raw)
	}

	var reader = textproto.NewReader(bufio.NewReader(bytes.NewReader(raw[0:idx])))
	var header, err = reader.ReadMIMEHeader()
	if header == nil || len(header) <= 0 {
		// 这里不判断err，而是判断header，只要header可以用，就继续往下面执行
		return nil, err
	}

	date, err := util.ParseDate(header.Get("Date"))
	if err != nil {
		log.Println(header.Get("Date"), err)
		date = time.Now()
	}

	return &models.Email{
		Subject: FixSubject(RFC2047.Decode(header.Get("Subject"))),
		Date:    date,
		From:    header.Get("From"),
		Cc:      header.Get("Cc"),
		Bcc:     header.Get("Bcc"),
		To:      header.Get("To"),
		ReplyTo: header.Get("Reply-To"),
		Status:  3,
		IsRead:  1,
	}, nil
}

// NewEmail 用来解析邮件，创建一个新的 models.Email 对象
func NewEmail(raw []byte) (*models.Email, error) {
	msg, err := mail.ReadMessage(bytes.NewBuffer(raw))
	if err != nil {
		return nil, err
	}

	// 解析文档的类型
	contentType := msg.Header.Get("Content-Type")

	// 如果没有文档类型的话，默认以text/plain来处理
	if contentType == "" {
		contentType = "text/plain; charset=\"utf-8\""
	}

	mediaType, params, err := mime.ParseMediaType(contentType)
	if err != nil {
		return nil, err
	}

	email := new(models.Email)

	date, err := msg.Header.Date()
	if err != nil {
		return nil, err
	}

	email.Date = date
	email.From = msg.Header.Get("From")
	email.To = msg.Header.Get("To")
	email.Cc = msg.Header.Get("Cc")
	email.Bcc = msg.Header.Get("Bcc")
	email.ReplyTo = msg.Header.Get("Reply-To")
	email.Subject = FixSubject(RFC2047.Decode(msg.Header.Get("Subject")))
	email.MsgId = regexp.MustCompile("[<>]").ReplaceAllString(
		msg.Header.Get("Message-ID"), "")
	email.Refs = getReferences(msg)
	email.MessageBundle = make(map[string][]byte)
	email.ResourceBundle = make(map[string]*models.Resource)
	email.RawMessage = msg

	// 普通的邮件，没有附件，没有截图之类的东东
	if strings.HasPrefix(mediaType, "text/") {
		cte := msg.Header.Get("Content-Transfer-Encoding")
		bodyReader := getBodyReader(msg.Body, cte, false)
		body, _ := util.CharsetDecode(bodyReader, contentType)
		if mediaType == "text/plain" {
			body = []byte(fmt.Sprintf("<pre class=\"ct-text-plain\">%s</pre>",
				html.EscapeString(string(body))))
		}
		email.MessageBundle[mediaType] = body
	} else if strings.HasPrefix(mediaType, "multipart/") {
		// 邮件里面可能有附件或者截图之类的东东
		mr := multipart.NewReader(msg.Body, params["boundary"])
		for {
			part, err := mr.NextPart()
			if err == io.EOF {
				break
			}
			if err != nil {
				return nil, err
			}
			err = decodeMultipartMessage(email, part)
			if err != nil {
				return nil, err
			}
		}
	}

	// 检查一下是否是日历相关类型的邮件
	if email.HasMessage("text/calendar") {
		email.IsCalendar = 1
		email.IcalMessage = string(email.MessageBundle["text/calendar"])
	}

	if email.HasMessage("text/html") {
		email.Message = string(email.MessageBundle["text/html"])
	} else if email.HasMessage("text/plain") {
		email.Message = string(email.MessageBundle["text/plain"])
	} else {
		for _, v := range email.MessageBundle {
			if len(v) > len(email.Message) {
				email.Message = string(v)
			}
		}
	}

	return email, nil
}

// 解码 multipart/* 类型的内容
func decodeMultipartMessage(email *models.Email, part *multipart.Part) error {
	ct := part.Header.Get("Content-Type")
	cte := part.Header.Get("Content-Transfer-Encoding")

	mediaType, params, err := mime.ParseMediaType(ct)
	if err != nil {
		return err
	}

	bodyReader := getBodyReader(part, cte, true)
	if strings.HasPrefix(mediaType, "text/") && part.FileName() == "" {
		body, _ := util.CharsetDecode(bodyReader, ct)
		email.MessageBundle[mediaType] = body
	} else if strings.HasPrefix(mediaType, "multipart/") {
		// TODO(user) 需要注意递归的处理流程，例如：
		// multipart/mixed
		//  multipart/related
		//   text/html
		//   image/jpeg
		//   image/jpeg
		// application/pdf
		mr := multipart.NewReader(part, params["boundary"])
		for {
			subpart, err := mr.NextPart()
			if err == io.EOF {
				break
			}
			if err != nil {
				return err
			}
			err = decodeMultipartMessage(email, subpart)
			if err != nil {
				return err
			}
		}
	} else {
		var name string
		var key string

		cid := part.Header.Get("Content-ID")
		if cid != "" {
			// 优先考虑 Content-Id
			// 需要把前后的 < 和 > 去掉
			cid = regexp.MustCompile("[<>]").ReplaceAllString(cid, "")
		}

		cdv := part.Header.Get("Content-Disposition")
		if cdv != "" {
			// 其次考虑 Content-Disposition
			name = RFC2047.Decode(part.FileName())
		}

		if name == "" && params["name"] != "" {
			// 最后考虑 Content-Type: image/png; name="xxx.jpg"; boundary="--12313--"
			name = RFC2047.Decode(params["name"])
		}

		if cid != "" {
			key = cid
		} else if name != "" {
			key = name
		}

		if key != "" {
			body, _ := ioutil.ReadAll(bodyReader)
			email.ResourceBundle[key] = &models.Resource{
				MediaType: ct,
				ContentID: cid,
				Name:      name,
				Body:      body,
			}
		}
	}

	return nil
}

// 根据编码的不同返回对应解码之后的内容，主要是 quoted-printable 和 base64 两种
// 其它的类型直接返回，什么也不做
func getBodyReader(reader io.Reader, encoding string, ignoreQP bool) io.Reader {
	switch strings.ToLower(encoding) {
	case "quoted-printable":
		if ignoreQP {
			// 如果 ignoreQP 为 true，说明内部已经处理过 kQuotedPrintable 编码类型了
			return reader
		}
		return quotedprintable.NewDecoder(reader)
	case "base64":
		return base64.NewDecoder(base64.StdEncoding, reader)
	default:
		// 啥也没有，就是普通的文本而已
		// TODO(user) 8bit
		// TODO(user) 7bit
		return reader
	}
}

// 计算邮件的 References 字段的内容
func getReferences(msg *mail.Message) string {
	re := regexp.MustCompile("[<>]")
	var references []string
	for _, ref := range regexp.MustCompile(`[\s,]+`).Split(msg.Header.Get("References"), -1) {
		ref = re.ReplaceAllString(ref, "")
		if ref != "" {
			references = append(references, ref)
		}
	}

	// If both headers exist, take the first thing in the In-Reply-To header
	// that looks like a Message-ID, and append it to the References header.
	ss := regexp.MustCompile("<([^<>]+)>").FindStringSubmatch(msg.Header.Get("In-Reply-To"))
	if len(ss) > 0 {
		for _, ref := range references {
			if ref == ss[1] && ss[1] != "" {
				// 已经存在了，不需要加入新的了
				return strings.Join(references, ",")
			}
		}

		// 不存在，追加新的进去
		references = append(references, ss[1])
	}

	return strings.Join(references, ",")
}

// FixSubject 通过检测编码来修复邮件的标题
// 因为有些邮件的标题没有按照规范正确的Encode，这里只能人肉去处理一下
// 大部分都是写程序发送的邮件，比如一些报警之类的
func FixSubject(s string) string {
	if s != "" {
		detector := chardet.NewTextDetector()
		result, err := detector.DetectBest(
			// 重复几次，准确率更高一些
			append([]byte(s + s + s)),
		)
		if err == nil && result.Charset == "GB-18030" {
			j, err := util.CharsetDecode(
				bytes.NewBufferString(s),
				"text/html; charset=\"GB18030\"")
			if err == nil {
				return string(j)
			}
		}
	}

	return s
}
