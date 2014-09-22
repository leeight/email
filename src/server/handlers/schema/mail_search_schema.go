package schema

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/gorilla/schema"
)

type MailSearchSchema struct {
	PageSize int    `schema:"pageSize"`
	PageNo   int    `schema:"pageNo"`
	Keyword  string `schema:"keyword"`
}

func (this *MailSearchSchema) BuildSearcherUrl() string {
	var host = "http://localhost:9200/baidu/mails/_search"

	return fmt.Sprintf("%s?q=subject:%s&pretty&from=%d&size=%d&track_scores=true&sort=date:desc&&sort=_score",
		host, url.QueryEscape(this.Keyword), (this.PageNo-1)*this.PageSize, this.PageSize)
}

func (this *MailSearchSchema) BuildListSql(ids []string) string {
	sql := fmt.Sprintf("SELECT "+
		"`id`, `uidl`, `from`, `to`, `cc`, `bcc`, "+
		"`reply_to`, `subject`, `date`, `is_read` "+
		"FROM mails WHERE `is_delete` != 1 AND `id` IN (%s)",
		strings.Join(ids, ","))
	return sql
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
}
