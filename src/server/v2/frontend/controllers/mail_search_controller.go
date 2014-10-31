package controllers

import (
	"log"
	"strings"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"

	"../../models"
	"../../util"
)

// 邮件列表默认页面
type MailSearchController struct {
	beego.Controller
}

func (this *MailSearchController) Get() {
	this.Post()
}

func (this *MailSearchController) Post() {
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
	}

	this.Data["json"] = util.ListResponse(totalCount,
		schema.PageNo, schema.PageSize, emails)
	this.ServeJson()
}

// 根据请求参数，构造过滤条件
func (this *MailSearchController) buildQuerySeter() (
	orm.QuerySeter, *models.InboxControllerSchema, error) {

	var schema = new(models.InboxControllerSchema)
	if err := this.ParseForm(schema); err != nil {
		return nil, nil, err
	}
	schema.Init()

	var o = gSrvConfig.Ormer
	var qs = o.QueryTable("email").Filter("IsDelete", 0)

	var keyword = this.GetString("keyword")
	if strings.Index(keyword, "from:") == 0 {
		keyword = keyword[5:]

		var chunks = strings.Split(keyword, " ")
		qs = qs.Filter("From__icontains", chunks[0])
		if len(chunks) > 1 {
			qs = qs.Filter("Subject__icontains", chunks[1])
		}
	} else if strings.Index(keyword, "to:") == 0 {
		keyword = keyword[3:]

		var chunks = strings.Split(keyword, " ")
		qs = qs.Filter("To__icontains", chunks[0])
		if len(chunks) > 1 {
			qs = qs.Filter("Subject__icontains", chunks[1])
		}
	} else {
		qs = qs.Filter("Subject__icontains", keyword)
	}

	qs = qs.OrderBy("-Date", "-Id")

	return qs, schema, nil
}
