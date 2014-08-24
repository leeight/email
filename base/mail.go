package base

import (
	"bytes"
	"database/sql"
	"encoding/base64"
	"io"
	"io/ioutil"
	// "log"
	"mime"
	"mime/multipart"
	"path"
	"regexp"
	"strings"
	"time"

	"../RFC2047"
	"../net/mail"

	"github.com/alexcesaro/mail/quotedprintable"
	"github.com/qiniu/iconv"
)

// 定义邮件类型
type EMail struct {
	Id      int       `json:"id"`
	Uidl    string    `json:"uidl"`
	From    string    `json:"from"`
	To      string    `json:"to"`
	Cc      string    `json:"cc"`
	Bcc     string    `json:"bcc"`
	ReplyTo string    `json:"reply_to"`
	Date    time.Time `json:"date"`
	Subject string    `json:"subject"`
	Message string    `json:"message"`
	Status  int       `json:"status"`
}

// 一些常量定义
var (
	kSubject                 = "Subject"
	kFrom                    = "From"
	kTo                      = "To"
	kCc                      = "CC"
	kBcc                     = "BCC"
	kReplyTo                 = "Reply-To"
	kDate                    = "Date"
	kContentType             = "Content-Type"
	kQuotedPrintable         = "quoted-printable"
	kBase64                  = "base64"
	kContentId               = "Content-ID"
	kContentDisposition      = "Content-Disposition"
	kContentTransferEncoding = "Content-Transfer-Encoding"
)

// 从邮件的正文中创建一个邮件对象 EMail 然后存储到
// sqlite里面去
func CreateMail(raw []byte, downloadDir string) (*EMail, error) {
	var email EMail

	// 编码转化函数
	cd, _ := iconv.Open("utf-8", "gb2312")
	defer cd.Close()

	msg, _ := mail.ReadMessage(bytes.NewBuffer(raw))

	// 解析文档的类型
	mediaType, params, err := mime.ParseMediaType(
		msg.Header.Get(kContentType))
	if err != nil {
		return nil, err
	}

	// 普通的邮件，没有附件，没有截图之类的东东
	if strings.HasPrefix(mediaType, "text/") {
		var reader io.Reader

		cte := msg.Header.Get(kContentTransferEncoding)
		if cte == kQuotedPrintable {
			reader = quotedprintable.NewDecoder(msg.Body)
		} else if cte == kBase64 {
			reader = base64.NewDecoder(base64.StdEncoding, msg.Body)
		} else {
			// 啥也没有，就是普通的文本而已
			reader = msg.Body
		}

		body, _ := decodeMesssageBody(reader, msg.Header.Get(kContentType))
		email.Message = string(body)
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
			decodeMessageMultipart(part, &email, downloadDir)
		}
	}

	date, _ := time.Parse("Mon, 2 Jan 2006 15:04:05 -0700",
		msg.Header.Get(kDate))

	email.From = msg.Header.Get(kFrom)
	email.To = msg.Header.Get(kTo)
	email.Cc = msg.Header.Get(kCc)
	email.Bcc = msg.Header.Get(kBcc)
	email.ReplyTo = msg.Header.Get(kReplyTo)
	email.Date = date
	email.Subject = RFC2047.Decode(msg.Header.Get(kSubject))
	email.Status = 0

	return &email, nil
}

func decodeMessageMultipart(part *multipart.Part, email *EMail, downloadDir string) error {
	contentType := part.Header.Get(kContentType)
	contentTransferEncoding := part.Header.Get(kContentTransferEncoding)

	var reader io.Reader
	if contentTransferEncoding == kBase64 {
		reader = base64.NewDecoder(base64.StdEncoding, part)
		// 内部已经处理过 kQuotedPrintable 编码类型了
		// } else if contentTransferEncoding == kQuotedPrintable {
		// reader = quotedprintable.NewDecoder(part)
	} else {
		reader = part
	}

	if strings.HasPrefix(contentType, "text/") {
		// XXX(user) quoted-printable 类型的内部已经处理过了
		body, _ := decodeMesssageBody(reader, contentType)

		// XXX(user) src="cid:d3b11fe4b395a6995fcdb51988247200.png"
		var r = regexp.MustCompile(`src="cid:([^"]+)"`)
		body = r.ReplaceAll(body, []byte("src=\""+downloadDir+"/$1\""))

		email.Message = string(body)
	} else if strings.HasPrefix(contentType, "image/") {
		// 邮件中内嵌的内容（比如图片）
		body, _ := ioutil.ReadAll(reader)

		// TODO(user) 文件名的确定方案
		filename := part.Header.Get(kContentId)
		filename = strings.Replace(filename, "<", "", 1)
		filename = strings.Replace(filename, ">", "", 1)

		ioutil.WriteFile(path.Join(downloadDir, filename), body, 0644)
	} else if part.Header.Get(kContentDisposition) != "" {
		// 附件
		body, _ := ioutil.ReadAll(reader)

		// TODO(user) 文件名的确定方案
		filename := RFC2047.Decode(part.FileName())
		ioutil.WriteFile(path.Join(downloadDir, filename), body, 0644)
	} else if strings.HasPrefix(contentType, "multipart/") {
		// TODO(user) 需要注意递归的处理流程，例如：
		// multipart/mixed
		//  multipart/related
		//   text/html
		//   image/jpeg
		//   image/jpeg
		// application/pdf
		_, params, err := mime.ParseMediaType(contentType)
		if err != nil {
			return err
		}

		mr := multipart.NewReader(part, params["boundary"])
		for {
			subpart, err := mr.NextPart()
			if err == io.EOF {
				break
			}
			if err != nil {
				return err
			}
			decodeMessageMultipart(subpart, email, downloadDir)
		}
	}

	return nil
}

// 解码邮件的正文，主要是处理编码转化的工作
func decodeMesssageBody(r io.Reader, c string) ([]byte, error) {
	body, err := ioutil.ReadAll(r)
	if err != nil {
		return []byte(""), err
	}

	_, params, err := mime.ParseMediaType(c)
	if err != nil {
		return []byte(""), err
	}

	if charset, ok := params["charset"]; ok {
		charset = strings.Replace(charset, "\"", "", -1)
		if strings.ToLower(charset) == "gb2312" {
			charset = "gb18030"
		}
		cd, _ := iconv.Open("utf-8", charset)
		defer cd.Close()

		body = stripUnnecessaryTags(body)

		var outbuf [512]byte
		html, inleft, err := cd.Conv(body, outbuf[:])
		if err != nil || inleft > 0 {
			return body, nil
		}

		return html, nil
	} else {
		return body, nil
	}
}

// 删除邮件正文中不必要的内容，只保留<body>和</body>之间的内容
func stripUnnecessaryTags(html []byte) []byte {
	pattern := regexp.MustCompile(`</?body[^>]*>`)
	indexs := pattern.FindAllIndex(html, 2)
	if indexs != nil && len(indexs) == 2 {
		start := indexs[0][1]
		end := indexs[1][0]
		return html[start:end]
	}
	return html
}

func (email *EMail) Store(db *sql.DB) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}

	stmt, err := tx.Prepare(
		"INSERT INTO mails " +
			"(`uidl`, `from`, `to`, `cc`, `bcc`, `reply_to`, `date`, `subject`, `message`) " +
			"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")

	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(email.Uidl, email.From, email.To, email.Cc,
		email.Bcc, email.ReplyTo, email.Date, email.Subject, email.Message)
	if err != nil {
		return err
	}

	return tx.Commit()
}
