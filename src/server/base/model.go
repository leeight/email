package base

import (
	"bytes"
	"io/ioutil"
	"path"
	"time"

	_ "github.com/mattn/go-sqlite3"

	"../net/mail"
)

// ER所需要的数据格式
type ListResponse struct {
	Success string `json:"success"`
	Page    struct {
		TotalCount int               `json:"totalCount"`
		PageNo     int               `json:"pageNo"`
		PageSize   int               `json:"pageSize"`
		OrderBy    string            `json:"orderBy"`
		Order      string            `json:"order"`
		Result     []*EMailViewModel `json:"result"`
	} `json:"page"`
}

type SimpleResponse struct {
	Success string            `json:"success"`
	Message map[string]string `json:"message"`
	Result  *EMailViewModel   `json:"result"`
}

// 定义邮件类型，Database Model
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

// 定义邮件类型，View Model
type EMailViewModel struct {
	Id          int             `json:"id"`
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
	Attachments []string        `json:"attachments"`
	Status      int             `json:"status"`
}

func ToSimpleResponse(this *EMailViewModel) *SimpleResponse {
	var res SimpleResponse
	res.Success = "true"
	res.Result = this
	return &res
}

func ToListPageResponse(
	this []*EMailViewModel,
	totalCount int,
	pageNo int,
	pageSize int,
) *ListResponse {
	var res ListResponse
	res.Success = "true"
	res.Page.TotalCount = totalCount
	res.Page.PageNo = pageNo
	res.Page.PageSize = pageSize
	res.Page.OrderBy = "id"
	res.Page.Order = "desc"
	res.Page.Result = this

	return &res
}

func setAttachments(downloadDir, uidl string) []string {
	attachments := make([]string, 0)
	fileInfos, err := ioutil.ReadDir(path.Join(downloadDir, uidl))
	if err != nil {
		return attachments
	}

	for _, item := range fileInfos {
		if item.IsDir() {
			continue
		}
		attachments = append(attachments, item.Name())
	}
	return attachments
}

func (this *EMail) ToViewModel(downloadDir string) *EMailViewModel {
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
	evm.Message = this.Message
	evm.From, _ = mail.ParseAddress(this.From)
	evm.To, _ = mail.ParseAddressList(this.To)
	evm.Cc, _ = mail.ParseAddressList(this.Cc)
	evm.Bcc, _ = mail.ParseAddressList(this.Bcc)
	evm.ReplyTo, _ = mail.ParseAddressList(this.ReplyTo)
	evm.Attachments = setAttachments(downloadDir, this.Uidl)

	if msg != nil {
		evm.Importance = msg.Header.Get("Importance")
	}

	return &evm
}
