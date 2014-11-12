package controllers

import (
	"log"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"

	"../../models"
	"../../util"
)

// InboxController 邮件列表默认页面
type InboxController struct {
	beego.Controller
}

// Get 处理 GET 请求
func (controller *InboxController) Get() {
	controller.Post()
}

// Post 处理 POST 请求
func (controller *InboxController) Post() {
	qs, schema, err := controller.buildQuerySeter()
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
		All(&emails, "Id", "Uidl", "From", "Date", "Subject",
		"Status", "IsRead", "IsStar")
	if err != nil {
		log.Println(err)
		return
	}

	for _, email := range emails {
		patchEmailFields(email)

		// TODO(user) email.Tags 内容的修复
		// email.Tags = ?
	}

	controller.Data["json"] = util.ListResponse(totalCount,
		schema.PageNo, schema.PageSize, emails)
	controller.ServeJson()
}

// 根据请求参数，构造过滤条件
func (controller *InboxController) buildQuerySeter() (
	orm.QuerySeter, *models.InboxControllerSchema, error) {

	var schema = new(models.InboxControllerSchema)
	if err := controller.ParseForm(schema); err != nil {
		return nil, nil, err
	}
	schema.Init()

	var o = gSrvConfig.Ormer
	var qs = o.QueryTable("email")

	if schema.IsDelete == 1 {
		qs = qs.Filter("IsDelete", 1)
	} else if schema.IsStar == 1 {
		qs = qs.Filter("IsStar", 1)
	} else if schema.LabelID > 0 {
		if schema.LabelID != 2 && schema.LabelID != 9 {
			// TODO(user) 以后修复
			qs = qs.Filter("IsDelete", 0)
		}
		qs = qs.Filter("Tags__Tag__Id", schema.LabelID)
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
