package schema

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/gorilla/schema"
)

type MailSearchSchema struct {
	PageSize int    `schema:"pageSize"`
	PageNo   int    `schema:"pageNo"`
	Keyword  string `schema:"keyword"`
}

type searchRequestType struct {
	Query struct {
		Match struct {
			Subject string `json:"subject"`
			// Analyzer string `json:"analyzer"`
		} `json:"match"`
	} `json:"query"`
	Highlight struct {
		Fields struct {
			Subject struct{} `json:"subject"`
		} `json:"fields"`
	} `json:"highlight"`
	Sort []interface{} `json:"sort"`
	From int           `json:"from"`
	Size int           `json:"size"`
}

type sortFieldType struct {
	Date struct {
		Order string `json:"order"`
	} `json:"date"`
}

func (this *MailSearchSchema) BuildSearcherUrl() string {
	var host = "http://localhost:9200/baidu/mails/_search"
	return host
}

func (this *MailSearchSchema) BuildSearcherBody() []byte {
	var params searchRequestType
	params.Query.Match.Subject = this.Keyword
	// params.Query.Match.Analyzer = "smartcn"
	params.From = (this.PageNo - 1) * this.PageSize
	params.Size = this.PageSize
	params.Sort = make([]interface{}, 0)

	var sortByDate sortFieldType
	sortByDate.Date.Order = "desc"
	params.Sort = append(params.Sort, "_score")
	params.Sort = append(params.Sort, sortByDate)

	raw, _ := json.Marshal(params)

	fmt.Printf("%s\n", string(raw))

	return raw
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
