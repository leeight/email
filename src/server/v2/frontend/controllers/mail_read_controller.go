package controllers

import (
	"log"

	"github.com/astaxie/beego"

	"../../models"
	"../../util"
)

// MailReadController 处理查看邮件详情的请求
type MailReadController struct {
	beego.Controller
}

// Get 处理 GET 请求
func (controller *MailReadController) Get() {
	controller.Post()
}

// Post 处理 POST 请求
func (controller *MailReadController) Post() {
	id, err := controller.GetInt("id")
	if err != nil {
		log.Println(err)
		return
	}

	var email = &models.Email{Id: id}
	err = gSrvConfig.Ormer.Read(email)
	if err != nil {
		log.Println(err)
		return
	}

	email.IsRead = 1
	_, err = gSrvConfig.Ormer.Update(email, "IsRead")
	if err != nil {
		log.Println(err)
		return
	}

	patchEmailFields(email)

	controller.Data["json"] = util.SimpleResponse(email)

	controller.ServeJson()
}
