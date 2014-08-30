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
func NewMail(raw []byte, downloadDir, prefix string) (*EMail, error) {
	var email EMail

	// 编码转化函数
	cd, _ := iconv.Open("utf-8", "gb2312")
	defer cd.Close()

	msg, err := mail.ReadMessage(bytes.NewBuffer(raw))
	if err != nil {
		return nil, err
	}

	// 解析文档的类型
	contentType := msg.Header.Get(kContentType)

	// 如果没有文档类型的话，默认以text/plain来处理
	if contentType == "" {
		contentType = "text/plain; charset=\"utf-8\""
	}

	mediaType, params, err := mime.ParseMediaType(contentType)
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

		body, _ := decodeMesssageBody(reader, contentType)
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
			err = decodeMessageMultipart(part, &email, downloadDir, prefix)
			if err != nil {
				return nil, err
			}
		}
	}

	// TODO(user) 这个日期格式需要改成可以配置的，否则解析会不正确的
	date, _ := time.Parse("Mon, 2 Jan 2006 15:04:05 -0700",
		msg.Header.Get(kDate))

	email.From = msg.Header.Get(kFrom)
	email.To = msg.Header.Get(kTo)
	email.Cc = msg.Header.Get(kCc)
	email.Bcc = msg.Header.Get(kBcc)
	email.ReplyTo = msg.Header.Get(kReplyTo)
	email.Date = date
	// log.Printf("Subject = [%s]\n", msg.Header.Get(kSubject))
	email.Subject = RFC2047.Decode(msg.Header.Get(kSubject))
	email.Status = 0

	return &email, nil
}

func decodeMessageMultipart(part *multipart.Part, email *EMail, downloadDir, prefix string) error {
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
		body = r.ReplaceAll(body, []byte("src=\""+prefix+"/$1\""))

		email.Message = string(body)
	} else if strings.HasPrefix(contentType, "image/") {
		// 邮件中内嵌的内容（比如图片）
		body, _ := ioutil.ReadAll(reader)

		// TODO(user) 文件名的确定方案
		// "Content-ID"
		// "X-Attachment-Id"
		// Content-Disposition: attachment; filename="DSC_0541.JPG"
		filename := part.Header.Get(kContentId)
		filename = strings.Replace(filename, "<", "", 1)
		filename = strings.Replace(filename, ">", "", 1)
		if filename == "" {
			filename = part.FileName()
		}

		if filename != "" {
			// log.Println(path.Join(downloadDir, filename))
			ioutil.WriteFile(path.Join(downloadDir, filename), body, 0644)
		}
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
			err = decodeMessageMultipart(subpart, email, downloadDir, prefix)
			if err != nil {
				return err
			}
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

	ct, params, err := mime.ParseMediaType(c)
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

		body = StripUnnecessaryTags(body)

		var outbuf [512]byte
		html, _, err := cd.Conv(body, outbuf[:])
		if err == nil {
			body = html
		}
	}

	if ct == "text/plain" {
		body = bytes.Join([][]byte{
			[]byte("<pre>"),
			body,
			[]byte("</pre>"),
		}, []byte(""))
	}

	return body, nil
}

// 给邮件添加一个Tag，比如LabelAction可能会用到
func (this *EMail) AddLabel(label string, db *sql.DB) error {
	// 事先已经保证了 tags 和 mail_tags 这两个表从存在了，所以直接操作就好了
	// log.Println("Email AddLabel")

	// 先查询 tagId，如果没有的话，插入新的
	var tagId int64
	err := db.QueryRow("SELECT `id` FROM tags WHERE `name` = ?", label).Scan(&tagId)
	if err != nil && err != sql.ErrNoRows {
		return err
	}

	if tagId <= 0 {
		// 不存在，那么插入一条新的数据喽
		result, err := db.Exec("INSERT INTO tags (`name`) VALUES (?)", label)
		if err != nil {
			return err
		}

		tagId, err = result.LastInsertId()
		if err != nil {
			return err
		}
	}

	// 先检查有没有重复的记录，如果有的话，就不需要插入了
	var mailTagCount int
	err = db.QueryRow("SELECT COUNT(`id`) FROM mail_tags WHERE `mid` = ? AND `tid` = ?",
		this.Id, tagId).Scan(&mailTagCount)
	if err != nil && err != sql.ErrNoRows {
		return err
	}
	if mailTagCount > 0 {
		// 纳尼，数据已经存在了？
		return nil
	}

	// 给 mail_tags 插入一条记录即可
	_, err = db.Exec("INSERT INTO mail_tags (`mid`, `tid`) VALUES (?, ?)",
		this.Id, tagId)
	if err != nil {
		return err
	}

	return nil
}

func (email *EMail) Store(db *sql.DB) (int64, error) {
	var stmt *sql.Stmt
	var tx *sql.Tx
	var result sql.Result
	var err error

	tx, err = db.Begin()
	if err != nil {
		return 0, err
	}

	if email.Id > 0 {
		stmt, err = tx.Prepare(
			"UPDATE mails SET " +
				"`uidl` = ?, `from` = ?, `to` = ?, `cc` = ?, `bcc` = ?, " +
				"`reply_to` = ?, `date` = ?, `subject` = ?, `message` = ? " +
				"`is_read` = ?, `is_delete` = ? " +
				"WHERE `id` = ?")
	} else {
		stmt, err = tx.Prepare(
			"INSERT INTO mails " +
				"(`uidl`, `from`, `to`, `cc`, `bcc`, `reply_to`, `date`, `subject`, `message`, `is_read`, `is_delete`) " +
				"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)")
	}

	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	if email.Id > 0 {
		// 更新
		result, err = stmt.Exec(email.Uidl, email.From, email.To, email.Cc,
			email.Bcc, email.ReplyTo, email.Date, email.Subject, email.Message,
			email.IsRead, email.IsDelete, email.Id)
	} else {
		// 插入
		result, err = stmt.Exec(email.Uidl, email.From, email.To, email.Cc,
			email.Bcc, email.ReplyTo, email.Date, email.Subject, email.Message)
	}

	if err != nil {
		return 0, err
	}

	err = tx.Commit()
	if err != nil {
		return 0, err
	}

	if email.Id > 0 {
		return email.Id, nil
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}
