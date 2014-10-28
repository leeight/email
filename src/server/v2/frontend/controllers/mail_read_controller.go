package controllers

import (
	"log"

	"github.com/astaxie/beego"

	"../../models"
	"../../util"
)

type MailReadController struct {
	beego.Controller
}

func (this *MailReadController) Get() {
	this.Post()
}

func (this *MailReadController) Post() {
	id, err := this.GetInt("id")
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

	this.Data["json"] = util.SimpleResponse(email)

	this.ServeJson()
}
