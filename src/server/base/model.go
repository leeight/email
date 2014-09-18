package base

import (
	"bytes"
	"database/sql"
	"io/ioutil"
	"path"
	"time"

	"github.com/dustin/go-humanize"
	_ "github.com/mattn/go-sqlite3"

	"../net/mail"
)

type SearcherJsonRPCResponse struct {
	Ids    []string `json:"ids"`
	Tokens []string `json:"tokens"`
}

// 定义邮件类型，Database Model
type EMail struct {
	Id       uint64    `json:"id"`
	Uidl     string    `json:"uidl"`
	From     string    `json:"from"`
	To       string    `json:"to"`
	Cc       string    `json:"cc"`
	Bcc      string    `json:"bcc"`
	ReplyTo  string    `json:"reply_to"`
	Date     time.Time `json:"date"`
	Subject  string    `json:"subject"`
	Message  string    `json:"message"`
	MsgId    string    `json:"msg_id"` // Message-Id的值
	Refs     string    `json:"refs"`   // References和In-Reply-To的值,逗号分割
	Status   int       `json:"status"`
	IsRead   int       `json:"is_read"`
	IsSent   int       `json:"is_sent"`
	IsDelete int       `json:"is_delete"`
}

type Thread struct {
	Id        uint64        `json:"id"`
	From      *mail.Address `json:"from"`
	Date      time.Time     `json:"date"`
	Subject   string        `json:"subject"`
	MailCount int           `json:"mail_count"`
	Mids      string        `json:"mids"`
	IsRead    int           `json:"is_read"`
	IsDelete  int           `json:"is_delete"`
}

// 定义邮件类型，View Model
type EMailViewModel struct {
	Id          uint64          `json:"id"`
	Uidl        string          `json:"uidl"`
	From        *mail.Address   `json:"from"`
	To          []*mail.Address `json:"to"`
	Cc          []*mail.Address `json:"cc"`
	Bcc         []*mail.Address `json:"bcc"`
	ReplyTo     []*mail.Address `json:"reply_to"`
	Date        time.Time       `json:"date"`
	Subject     string          `json:"subject"`
	Message     string          `json:"message"`
	Importance  string          `json:"importance"`
	Attachments []*Attachment   `json:"attachments"`
	Labels      []*LabelType    `json:"labels"`
	Status      int             `json:"status"`
	IsRead      int             `json:"is_read"`
	IsSent      int             `json:"is_sent"`
	IsDelete    int             `json:"is_delete"`
}

// 联系人的信息
type Contact struct {
	Id    int64  `json:"id"`
	Name  string `json:"name"`
	EMail string `json:"email"`
	Count int    `json:"count"`
}

// 附件的信息
type Attachment struct {
	Size string `json:"size"`
	Name string `json:"name"`
}

type Response interface {
	Ok() bool
}

// ER所需要的数据格式
type SimpleResponse struct {
	Success string      `json:"success"`
	Message interface{} `json:"message"`
	Result  interface{} `json:"result"`
}

type LabelType struct {
	Id          int    `json:"id"`
	Name        string `json:"name"`
	UnreadCount int    `json:"unread_count"`
}

type PageType struct {
	TotalCount int         `json:"totalCount"`
	PageNo     int         `json:"pageNo"`
	PageSize   int         `json:"pageSize"`
	OrderBy    string      `json:"orderBy"`
	Order      string      `json:"order"`
	Result     interface{} `json:"result"`
}

type ListResponse struct {
	Success string      `json:"success"`
	Message interface{} `json:"message"`
	Page    PageType    `json:"page"`
}

func (this SimpleResponse) Ok() bool {
	return true
}

func (this ListResponse) Ok() bool {
	return true
}

func NewSimpleResponse(ok string, args ...interface{}) Response {
	if args == nil {
		type DefaultResult struct{}
		return &SimpleResponse{Success: ok, Result: DefaultResult{}}
	}

	if len(args) == 1 {
		// args = [ [A, B, C] ] -> args = [A, B, C]
		return &SimpleResponse{Success: ok, Result: args[0].(interface{})}
	} else {
		return &SimpleResponse{Success: ok, Result: args}
	}
}

func NewListResponse(ok string, totalCount int, pageNo int, pageSize int, args ...interface{}) Response {
	return &ListResponse{
		Success: ok,
		Page: PageType{
			TotalCount: totalCount,
			PageNo:     pageNo,
			PageSize:   pageSize,
			OrderBy:    "id",
			Order:      "desc",
			Result:     args[0].(interface{}),
		},
	}
}

func setAttachments(downloadDir, uidl string) []*Attachment {
	attachments := make([]*Attachment, 0)
	fileInfos, err := ioutil.ReadDir(path.Join(downloadDir, uidl, "att"))
	if err != nil {
		return attachments
	}

	for _, item := range fileInfos {
		if item.IsDir() {
			continue
		}
		att := Attachment{
			humanize.Bytes(uint64(item.Size())),
			item.Name(),
		}
		attachments = append(attachments, &att)
	}
	return attachments
}

func (this *EMail) ToViewModel(downloadDir string, db *sql.DB) *EMailViewModel {
	var evm EMailViewModel
	var msg *mail.Message

	raw, err := ioutil.ReadFile(path.Join("raw", this.Uidl+".txt"))
	if err == nil {
		msg, _ = mail.ReadMessage(bytes.NewBuffer(raw))
	}

	evm.Id = this.Id
	evm.Uidl = this.Uidl
	evm.Date = this.Date
	evm.Subject = this.Subject
	evm.Status = this.Status
	evm.Message = string(StripUnnecessaryTags([]byte(this.Message)))
	evm.IsRead = this.IsRead
	evm.IsDelete = this.IsDelete
	evm.IsSent = this.IsSent
	evm.From, _ = mail.ParseAddress(this.From)
	evm.To, _ = mail.ParseAddressList(this.To)
	evm.Cc, _ = mail.ParseAddressList(this.Cc)
	evm.Bcc, _ = mail.ParseAddressList(this.Bcc)
	evm.ReplyTo, _ = mail.ParseAddressList(this.ReplyTo)
	evm.Attachments = setAttachments(downloadDir, this.Uidl)

	rows, err := db.Query("SELECT `id`, `name` FROM tags WHERE `id` IN (SELECT `tid` FROM mail_tags WHERE `mid` = ?)", this.Id)
	if err == nil {
		evm.Labels = make([]*LabelType, 0)
		for rows.Next() {
			var label LabelType
			rows.Scan(&label.Id, &label.Name)
			evm.Labels = append(evm.Labels, &label)
		}
	}

	if msg != nil {
		evm.Importance = msg.Header.Get("Importance")
	}

	return &evm
}
