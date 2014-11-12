package controllers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/astaxie/beego"

	"../../models"
	"../../util"
)

// ContactsController 处理联系人列表的请求
type ContactsController struct {
	beego.Controller
}

// Get 处理 GET 请求
func (controller *ContactsController) Get() {
	controller.Post()
}

// Post 处理 POST 请求
func (controller *ContactsController) Post() {
	var o = gSrvConfig.Ormer
	var qs = o.QueryTable("contact").
		Filter("Address__icontains", controller.GetString("keyword")).
		OrderBy("-Count").
		Offset(0).
		Limit(6)

	var contacts []*models.Contact
	_, err := qs.All(&contacts)
	if err != nil {
		log.Println(err)
		controller.Abort(strconv.Itoa(http.StatusInternalServerError))
	}

	controller.Data["json"] = util.ListResponse(6, 1, 6, contacts)
	controller.ServeJson()
}
