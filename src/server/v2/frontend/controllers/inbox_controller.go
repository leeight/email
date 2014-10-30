package controllers

import (
	"log"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"

	"../../models"
	"../../util"
)

// 邮件列表默认页面
type InboxController struct {
	beego.Controller
}

func (this *InboxController) Get() {
	this.Post()
}

func (this *InboxController) Post() {
	qs, schema, err := this.buildQuerySeter()
	if err != nil {
		log.Println(err)
		return
	}

	totalCount, err := qs.Count()
	if err != nil {
		log.Println(err)
		return
	}

	var emails []*models.Email
	_, err = qs.
		Offset(schema.Offset).
		Limit(schema.PageSize).
		All(&emails)
	if err != nil {
		log.Println(err)
		return
	}

	for _, email := range emails {
		patchEmailFields(email)

		// TODO(user) email.Tags 内容的修复
		// email.Tags = ?
	}

	this.Data["json"] = util.ListResponse(totalCount,
		schema.PageNo, schema.PageSize, emails)
	this.ServeJson()
}

// 根据请求参数，构造过滤条件
func (this *InboxController) buildQuerySeter() (
	orm.QuerySeter, *models.InboxControllerSchema, error) {

	var schema = new(models.InboxControllerSchema)
	if err := this.ParseForm(schema); err != nil {
		return nil, nil, err
	}
	schema.Init()

	var o = gSrvConfig.Ormer
	var qs = o.QueryTable("email")

	if schema.IsDelete == 1 {
		qs = qs.Filter("IsDelete", 1)
	} else if schema.IsStar == 1 {
		qs = qs.Filter("IsStar", 1)
	} else if schema.LabelId > 0 {
		if schema.LabelId != 2 && schema.LabelId != 9 {
			// TODO(user) 以后修复
			qs = qs.Filter("IsDelete", 0)
		}
		qs = qs.Filter("Tags__Tag__Id", schema.LabelId)
	} else {
		qs = qs.Filter("IsDelete", 0)
	}

	if schema.UnRead == 1 {
		// 如果有明确的说明要看UnRead的邮件，才加上这个条件，否则返回未读和已读的
		qs = qs.Filter("IsRead", 0)
	}

	if schema.IsStar != 1 {
		// 如果明确的说明看IsStar的邮件，那么就忽略IsSent和IsCalendar的条件
		qs = qs.Filter("IsSent", schema.IsSent)
		qs = qs.Filter("IsCalendar", schema.IsCalendar)
	}

	qs = qs.OrderBy("-Date", "-Id")

	return qs, schema, nil
}
