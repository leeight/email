package models

import (
	"time"

	"github.com/astaxie/beego/orm"

	"../../net/mail"
)

type Email struct {
	Id          int64     `orm:"pk;auto" json:"id"`
	Uidl        string    `orm:"size(512)" json:"uidl"`
	From        string    `orm:"size(512)" json:"-"`
	To          string    `orm:"size(2048);null" json:"-"`
	Cc          string    `orm:"size(2048);null" json:"-"`
	Bcc         string    `orm:"size(2048);null" json:"-"`
	ReplyTo     string    `orm:"size(512);null" json:"-"`
	Date        time.Time `orm:"type(datetime)" json:"date"`
	Subject     string    `orm:"size(1024)" json:"subject"`
	Message     string    `orm:"type(text)" json:"message"`
	MsgId       string    `orm:"size(512);null" json:"msg_id"`
	Refs        string    `orm:"type(text);null" json:"refs"`
	IsCalendar  byte      `orm:"default(0)" json:"is_calendar"`
	IcalMessage string    `orm:"type(text);null" json:"ical_message"`
	Status      int       `orm:"default(0)" json:"status"`
	IsRead      byte      `orm:"default(0)" json:"is_read"`
	IsSent      byte      `orm:"default(0)" json:"is_sent"`
	IsStar      byte      `orm:"default(0)" json:"is_star"`
	IsDelete    byte      `orm:"default(0)" json:"is_delete"`
	IsArchive   byte      `orm:"default(0)" json:"is_archive"`
	Tags        []*Tag    `orm:"rel(m2m)" json:"tags"`

	// 下面这些是不需要存储到数据库的，只是为了中间的处理过程而添加的字段

	// 这些字段需要在REST API中返回的
	Attachments  []*Attachment `orm:"-" json:"attachments"`
	FromField    *Contact      `orm:"-" json:"from"`
	ReplyToField []*Contact    `orm:"-" json:"reply_to"`
	ToField      []*Contact    `orm:"-" json:"to"`
	CcField      []*Contact    `orm:"-" json:"cc"`
	BccField     []*Contact    `orm:"-" json:"bcc"`

	// 一封邮件里面可能有不同类型的内容，比如 text/plain, text/html, text/calendar
	// MessageBundle就是在解析邮件的过程中用来存储这些不同类型的内容而用的
	MessageBundle map[string][]byte `orm:"-" json:"-"`

	// 邮件里面可能有附件或者内联的资源（图片），ResourceBundle是用来存储这些资源来用的
	// ResourceBundle的key是Content-Id或者Name，优先使用Content-Id
	ResourceBundle map[string]*Resource `orm:"-" json:"-"`

	// RawMessage是mail.Parser返回的原始结构体指针，在过滤器的时候可能会用到
	RawMessage *mail.Message `orm:"-" json:"-"`
}

type Thread struct {
	Id        int64     `orm:"pk;auto" json:"id"`
	From      string    `orm:"size(512)" json:"from"`
	Date      time.Time `orm:"type(datetime)" json:"date"`
	Subject   string    `orm:"size(1024)" json:"subject"`
	Mids      string    `orm:"type(text);null" json:"mids"`
	IsRead    byte      `orm:"default(0)" json:"is_read"`
	IsDelete  byte      `orm:"default(0)" json:"is_delete"`
	IsSpam    byte      `orm:"default(0)" json:"is_spam"`
	IsArchive byte      `orm:"default(0)" json:"is_archive"`
}

type Contact struct {
	Id    int64  `orm:"pk;auto" json:"-"`
	Name  string `orm:"size(512);null" json:"name"`
	Email string `orm:"size(511);" json:"email"`
	Count int    `orm:"default(0)" json:"-"`
}

type Attachment struct {
	Size string `orm:"-" json:"size"`
	Name string `orm:"-" json:"name"`
}

type Tag struct {
	Id          int64    `orm:"pk;auto" json:"id"`
	Name        string   `orm:"size(512)" json:"name"`
	Emails      []*Email `orm:"reverse(many)" json:"-"`
	UnreadCount int      `orm:"-" json:"unread_count"`
}

// 邮件内容的一些资源，比如inline image，附件等等
type Resource struct {
	MediaType, ContentId, Name string
	Body                       []byte
}

// Email的索引配置
func (e *Email) TableIndex() [][]string {
	return [][]string{
		[]string{"MsgId"},
		[]string{"Uidl"},
		[]string{"IsRead"},
		[]string{"IsCalendar"},
		[]string{"IsDelete"},
		[]string{"IsStar"},
		[]string{"IsSent"},
		[]string{"IsArchive"},
		[]string{"Subject"},
	}
}

func parseAddress(address string) (*Contact, error) {
	x, err := mail.ParseAddress(address)
	if err != nil {
		return nil, err
	}
	return &Contact{Name: x.Name, Email: x.Address}, nil
}

func parseAddressList(list string) ([]*Contact, error) {
	x, err := mail.ParseAddressList(list)
	if err != nil {
		return nil, err
	}

	y := make([]*Contact, len(x))
	for i, a := range x {
		y[i] = &Contact{Name: a.Name, Email: a.Address}
	}

	return y, nil
}

// 通过 REST API 返回数据的时候，处理一下
// FromField, ReplyToField, CcField, BccField, ToField 字段的值
func (e *Email) FixMailAddressFields() {
	e.FromField, _ = parseAddress(e.From)
	e.ReplyToField, _ = parseAddressList(e.ReplyTo)
	e.ToField, _ = parseAddressList(e.To)
	e.CcField, _ = parseAddressList(e.Cc)
	e.BccField, _ = parseAddressList(e.Bcc)
}

func (e *Email) HasResource(name string) bool {
	if _, ok := e.ResourceBundle[name]; ok {
		return true
	}
	return false
}

func (e *Email) HasMessage(msgType string) bool {
	if _, ok := e.MessageBundle[msgType]; ok {
		return true
	}
	return false
}

// Contact的索引配置
func (c *Contact) TableIndex() [][]string {
	return [][]string{
		[]string{"Name"},
		[]string{"Email"},
	}
}

// Tag的索引配置
func (t *Tag) TableIndex() [][]string {
	return [][]string{
		[]string{"Name"},
	}
}

// Thread的索引配置
func (t *Thread) TableIndex() [][]string {
	return [][]string{
		[]string{"Subject"},
		[]string{"IsRead"},
		[]string{"IsDelete"},
		[]string{"IsSpam"},
		[]string{"IsArchive"},
	}
}

func init() {
	orm.RegisterModel(new(Email), new(Contact), new(Thread), new(Tag))
}
