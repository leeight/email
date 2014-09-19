package base

import (
	"bytes"
	"database/sql"
	"encoding/base64"
	"io"
	"io/ioutil"
	"mime"
	"mime/multipart"
	"os"
	"path"
	"regexp"
	"strings"
	"time"

	"github.com/alexcesaro/mail/quotedprintable"
	"github.com/qiniu/iconv"
	"github.com/saintfish/chardet"

	"../RFC2047"
	"../net/mail"
)

type kvType map[string][]byte

// Content-Type: application/octet-stream; name="540x400.jpg"
// Content-Description: 540x400.jpg
// Content-Disposition: attachment; filename="540x400.jpg"; size=455804;
// 	creation-date="Thu, 11 Sep 2014 10:11:53 GMT";
// 	modification-date="Thu, 11 Sep 2014 10:11:53 GMT"
// Content-ID: <AE4D977AA5EF3048AE33B21C57CEC669@internal.baidu.com>
// Content-Transfer-Encoding: base64
//
// 需要保存3种信息：
// 1. Content-Type
// 2. Content-Id
// 3. Name
//
// 发现了一种情况，即便有Content-Id，但是可能没有地方去引用它，此时就应该把它当做附件来处理了
// 存储的时候用 name 这个字段

// text/html影响了邮件的正文，需要识别出来
// Content-Type: text/html; name="ATT00002.htm"
// Content-Description: ATT00002.htm
// Content-Disposition: attachment; filename="ATT00002.htm"; size=232;
// 	creation-date="Fri, 19 Sep 2014 07:16:24 GMT";
// 	modification-date="Fri, 19 Sep 2014 07:16:24 GMT"
// Content-Transfer-Encoding: base64
type inlineResourceType struct {
	ct   string
	cid  string
	name string
	body []byte
}

// 从邮件的正文中创建一个邮件对象 EMail 然后存储到
// sqlite里面去
func NewMail(raw []byte, downloadDir, prefix string) (*EMail, error) {
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

	messages := make(kvType)

	// resouces的key是cid或者name
	resources := make(map[string]*inlineResourceType)

	// 普通的邮件，没有附件，没有截图之类的东东
	if strings.HasPrefix(mediaType, "text/") {
		cte := msg.Header.Get(kContentTransferEncoding)
		reader := getBodyReader(msg.Body, cte, false)
		body, _ := fixMessageEncoding(reader, contentType)
		messages[mediaType] = body
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
			err = decodeMultipartMessage(part, messages, resources)
			if err != nil {
				return nil, err
			}
		}
	}

	// Date: Wed, 17 Sep 2014 07:34:46 +0100
	// Date: Wed, 17 Sep 2014 14:31:06 +0800
	date, err := time.Parse(kTimeLayout, msg.Header.Get(kDate))
	if err != nil {
		return nil, err
	}

	email := EMail{}
	email.From = msg.Header.Get(kFrom)
	email.To = msg.Header.Get(kTo)
	email.Cc = msg.Header.Get(kCc)
	email.Bcc = msg.Header.Get(kBcc)
	email.ReplyTo = msg.Header.Get(kReplyTo)
	email.Date = date
	email.Subject = RFC2047.Decode(msg.Header.Get(kSubject))
	email.MsgId = regexp.MustCompile("[<>]").ReplaceAllString(
		msg.Header.Get(kMessageId), "")
	email.Refs = getReferences(msg)
	email.Status = 0
	email.IsSent = 0
	email.IsRead = 0
	email.IsDelete = 0

	// 有时候标题是有问题的，很奇怪的CASE
	// 例如：http://127.0.0.1:8848/index.html?ed=#/mail/view~id=2749&uidl=722275
	detector := chardet.NewTextDetector()
	if email.Subject != "" {
		result, err := detector.DetectBest([]byte(email.Subject))
		if err == nil && result.Charset == "GB-18030" {
			decodedSubject, err := fixMessageEncoding(
				bytes.NewBufferString(email.Subject),
				"text/html; charset=\"GB18030\"")
			if err == nil {
				email.Subject = string(decodedSubject)
			}
		}
	}

	if ical, ok := messages["text/calendar"]; ok {
		email.IsCalendar = 1
		email.IcalMessage = string(ical)
	} else {
		email.IsCalendar = 0
	}

	if _, ok := messages["text/html"]; ok {
		email.Message = string(messages["text/html"])
	} else if _, ok := messages["text/plain"]; ok {
		email.Message = string(messages["text/plain"])
	} else {
		for _, v := range messages {
			if len(v) > len(email.Message) {
				email.Message = string(v)
			}
		}
	}

	// 开始处理邮件中的资源
	// http://tools.ietf.org/html/rfc2392
	re := regexp.MustCompile(`src="cid:([^"]+)"`)
	sm := re.FindAllSubmatch([]byte(email.Message), -1)

	for _, match := range sm {
		fname := string(match[1])
		if _, ok := resources[fname]; ok {
			// 如果存在的话，那么这个文件需要写入cid目录
			os.MkdirAll(path.Join(downloadDir, "cid"), 0755)
			ioutil.WriteFile(path.Join(downloadDir, "cid", fname),
				resources[fname].body, 0644)

			// 写完之后删除，最后剩下的就放到att目录即可
			delete(resources, fname)
		}
	}

	if len(resources) > 0 {
		os.MkdirAll(path.Join(downloadDir, "att"), 0755)
		for _, value := range resources {
			var fname string
			if value.name != "" {
				fname = value.name
			} else if value.cid != "" {
				fname = value.cid
			} else {
				continue
			}

			ioutil.WriteFile(path.Join(downloadDir, "att", fname), value.body, 0644)
		}
	}

	if len(sm) > 0 {
		email.Message = re.ReplaceAllString(email.Message, "src=\""+prefix+"/cid/$1\"")
	}

	return &email, nil
}

func SaveMail(raw []byte, uidl string, config *ServerConfig) (*EMail, error) {
	downloadDir := path.Join(config.DownloadDir(), uidl)
	prefix := path.Join(path.Base(config.DownloadDir()), uidl)
	os.MkdirAll(downloadDir, 0755)
	email, err := NewMail(raw, downloadDir, prefix)
	if err != nil {
		return nil, err
	}
	return email, nil
}

// 根据References和In-Reply-To的组合，返回合适的email.refs字段的值
func getReferences(msg *mail.Message) string {
	re := regexp.MustCompile("[<>]")
	references := make([]string, 0)
	for _, ref := range regexp.MustCompile(`[\s,]+`).Split(msg.Header.Get(kReferences), -1) {
		ref = re.ReplaceAllString(ref, "")
		if ref != "" {
			references = append(references, ref)
		}
	}

	// If both headers exist, take the first thing in the In-Reply-To header
	// that looks like a Message-ID, and append it to the References header.
	ss := regexp.MustCompile("<([^<>]+)>").FindStringSubmatch(msg.Header.Get(kInReplyTo))
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

// 根据不同的编码类型，得到对应的解码方式
// 如果 ignoreQP 为true，那么忽略对 kQuotedPrintable 的判断
func getBodyReader(reader io.Reader, encoding string, ignoreQP bool) io.Reader {
	switch encoding {
	case kQuotedPrintable:
		if ignoreQP {
			// 如果 ignoreQP 为 true，说明内部已经处理过 kQuotedPrintable 编码类型了
			return reader
		}
		return quotedprintable.NewDecoder(reader)
	case kBase64:
		return base64.NewDecoder(base64.StdEncoding, reader)
	default:
		// 啥也没有，就是普通的文本而已
		// TODO(user) 8bit
		// TODO(user) 7bit
		return reader
	}
}

func decodeMultipartMessage(part *multipart.Part, messages kvType,
	resources map[string]*inlineResourceType) error {

	ct := part.Header.Get(kContentType)
	cte := part.Header.Get(kContentTransferEncoding)

	mediaType, params, err := mime.ParseMediaType(ct)
	if err != nil {
		return err
	}

	reader := getBodyReader(part, cte, true)

	if strings.HasPrefix(mediaType, "text/") && part.FileName() == "" {
		body, _ := fixMessageEncoding(reader, ct)
		messages[mediaType] = body
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
			err = decodeMultipartMessage(subpart, messages, resources)
			if err != nil {
				return err
			}
		}
	} else {
		var name string
		var key string

		cid := part.Header.Get(kContentId)
		if cid != "" {
			// 优先考虑 Content-Id
			// 需要把前后的 < 和 > 去掉
			cid = regexp.MustCompile("[<>]").ReplaceAllString(cid, "")
		}

		cdv := part.Header.Get(kContentDisposition)
		if cdv != "" {
			// 其次考虑 Content-Disposition
			name = RFC2047.Decode(part.FileName())
		} else if params["name"] != "" {
			// 最后考虑 Content-Type: image/png; name="xxx.jpg"; boundary="--12313--"
			name = RFC2047.Decode(params["name"])
		}

		if cid != "" {
			key = cid
		} else if name != "" {
			key = name
		}

		if key != "" {
			body, _ := ioutil.ReadAll(reader)
			resources[key] = &inlineResourceType{
				ct:   mediaType,
				cid:  cid,
				name: name,
				body: body,
			}
		}
	}

	return nil
}

// 解码邮件的正文，主要是处理编码转化的工作
func fixMessageEncoding(r io.Reader, c string) ([]byte, error) {
	body, err := ioutil.ReadAll(r)
	if err != nil {
		return []byte(""), err
	}

	ct, params, err := mime.ParseMediaType(c)
	if err != nil {
		return []byte(""), err
	}

	if charset, ok := params["charset"]; ok {
		charset = strings.ToLower(strings.Replace(charset, "\"", "", -1))
		if charset == "gb2312" || charset == "gbk" {
			charset = "gb18030"
		}
		cd, _ := iconv.Open("utf-8", charset)
		defer cd.Close()

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

func (email *EMail) Store(db *sql.DB) (uint64, error) {
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
				"`reply_to` = ?, `date` = ?, `subject` = ?, `message` = ?, " +
				"`msg_id` = ?, `refs` = ?, " +
				"`is_calendar` = ?, `ical_message` = ?, " +
				"`is_read` = ?, `is_delete` = ? " +
				"WHERE `id` = ?")
	} else {
		stmt, err = tx.Prepare(
			"INSERT INTO mails " +
				"(`uidl`, `from`, `to`, `cc`, `bcc`, `reply_to`, `date`, " +
				"`subject`, `message`, `msg_id`, `refs`, " +
				"`is_calendar`, `ical_message`, " +
				"`is_sent`, `is_read`, `is_delete`) " +
				"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	}

	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	if email.Id > 0 {
		// 更新
		result, err = stmt.Exec(email.Uidl, email.From, email.To, email.Cc,
			email.Bcc, email.ReplyTo, email.Date, email.Subject, email.Message,
			email.MsgId, email.Refs, email.IsCalendar, email.IcalMessage, email.IsRead,
			email.IsDelete, email.Id)
	} else {
		// 插入
		result, err = stmt.Exec(email.Uidl, email.From, email.To, email.Cc,
			email.Bcc, email.ReplyTo, email.Date, email.Subject, email.Message,
			email.MsgId, email.Refs, email.IsCalendar, email.IcalMessage,
			email.IsSent, email.IsRead, email.IsDelete)
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

	return uint64(id), nil
}
