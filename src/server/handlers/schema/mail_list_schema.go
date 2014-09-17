package schema

import (
	"net/http"
	"strconv"

	"github.com/gorilla/schema"
)

type MailListSchema struct {
	PageSize  int `schema:"pageSize"`
	PageNo    int `schema:"pageNo"`
	LabelId   int `schema:"label"`
	IsDelete  int `schema:"is_delete"`
	IsSent    int `schema:"is_sent"`
	SkipCount int `schema:"-"`
}

func (this *MailListSchema) BuildListSql() string {
	// 准备sql
	sql := "SELECT " +
		"`id`, `uidl`, `from`, `to`, `cc`, `bcc`, " +
		"`reply_to`, `subject`, `date`, `is_read` " +
		"FROM mails "

	if this.IsDelete == 1 {
		sql += "WHERE `is_delete` = 1 "
	} else {
		if this.LabelId > 0 {
			sql += "WHERE `is_delete` != 1 AND `id` IN " +
				"(SELECT `mid` FROM `mail_tags` WHERE `tid` = " +
				strconv.Itoa(this.LabelId) + ") "
		} else {
			sql += "WHERE `is_delete` != 1 "
		}
	}

	if this.IsSent == 1 {
		sql += "AND `is_sent` = 1 "
	} else {
		sql += "AND `is_sent` != 1 "
	}

	sql += "ORDER BY `date` DESC, `id` DESC LIMIT ?, ?"

	return sql
}

func (this *MailListSchema) BuildTotalSql() string {
	sql := "SELECT COUNT(*) FROM mails "
	if this.IsDelete == 1 {
		sql += "WHERE `is_delete` = 1 "
	} else {
		if this.LabelId > 0 {
			sql += "WHERE `is_delete` != 1 AND `id` IN " +
				"(SELECT `mid` FROM `mail_tags` WHERE `tid` = " +
				strconv.Itoa(this.LabelId) + ")"
		} else {
			sql += "WHERE `is_delete` != 1 "
		}
	}

	return sql
}

func (this *MailListSchema) Init(r *http.Request) {
	r.ParseForm()

	schema.NewDecoder().Decode(this, r.PostForm)
	this.setDefault()
}

func (this *MailListSchema) setDefault() {
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
