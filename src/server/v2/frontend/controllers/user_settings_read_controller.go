package controllers

import (
	"github.com/astaxie/beego"

	"../../util"
)

type UserSettingsReadController struct {
	beego.Controller
}

func (this *UserSettingsReadController) Get() {
	this.Post()
}

func (this *UserSettingsReadController) Post() {
	this.Data["json"] = util.SimpleResponse(gSrvConfig)
	this.ServeJson()
}
