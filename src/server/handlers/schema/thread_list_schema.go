package schema

import (
	"net/http"

	"github.com/gorilla/schema"
)

type ThreadListSchema struct {
	PageSize  int `schema:"pageSize"`
	PageNo    int `schema:"pageNo"`
	LabelId   int `schema:"label"`
	IsDelete  int `schema:"is_delete"`
	IsSent    int `schema:"is_sent"`
	SkipCount int `schema:"-"`
}

func (this *ThreadListSchema) BuildListSql() string {
	// 准备sql
	sql := "SELECT " +
		"`threads`.`id`, " +
		"`threads`.`from`, " +
		"`threads`.`subject`, " +
		"`threads`.`date`, " +
		"COUNT(`mails`.`id`), " +
		"`threads`.`is_read` " +
		"FROM `threads` " +
		"LEFT JOIN `mails` ON `mails`.`thread_id` = `threads`.`id` AND `mails`.`is_delete` != 1 " +
		"GROUP BY `threads`.`id` " +
		"ORDER BY `threads`.`date` DESC " +
		"LIMIT ?, ?"
	return sql
}

func (this *ThreadListSchema) BuildTotalSql() string {
	sql := "SELECT COUNT(*) FROM threads "
	return sql
}

func (this *ThreadListSchema) Init(r *http.Request) {
	r.ParseForm()

	schema.NewDecoder().Decode(this, r.PostForm)
	this.setDefault()
}

func (this *ThreadListSchema) setDefault() {
	if this.PageSize == 0 {
		this.PageSize = 15
	}

	if this.PageNo == 0 {
		this.PageNo = 1
	}

	if this.LabelId == 0 {
		this.LabelId = -1
	}

	this.SkipCount = (this.PageNo - 1) * this.PageSize
	if this.SkipCount < 0 {
		this.SkipCount = 0
	}
}
