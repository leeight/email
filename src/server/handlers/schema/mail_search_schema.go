package schema

import (
	"fmt"
	"net/http"

	"github.com/gorilla/schema"
)

type MailSearchSchema struct {
	PageSize  int    `schema:"pageSize"`
	PageNo    int    `schema:"pageNo"`
	SkipCount int    `schema:"-"`
	Keyword   string `schema:"keyword"`
}

func (this *MailSearchSchema) BuildListSql() string {
	sql := fmt.Sprintf("SELECT " +
		"`id`, `uidl`, `from`, `to`, `cc`, `bcc`, " +
		"`reply_to`, `subject`, `date`, `is_read` " +
		"FROM `mails` WHERE `is_delete` != 1 AND `subject` LIKE ? " +
		"ORDER BY `date` DESC, `id` DESC LIMIT ?, ?")
	return sql
}

func (this *MailSearchSchema) BuildTotalSql() string {
	return "SELECT COUNT(*) FROM `mails` WHERE `is_delete` != 1 AND `subject` LIKE ?"
}

func (this *MailSearchSchema) Init(r *http.Request) {
	r.ParseForm()

	schema.NewDecoder().Decode(this, r.PostForm)
	this.setDefault()
}

func (this *MailSearchSchema) setDefault() {
	if this.PageSize == 0 {
		this.PageSize = kDefaultPageSize
	}

	if this.PageNo == 0 {
		this.PageNo = kDefaultPageNo
	}

	this.SkipCount = (this.PageNo - 1) * this.PageSize
	if this.SkipCount < 0 {
		this.SkipCount = 0
	}
}
