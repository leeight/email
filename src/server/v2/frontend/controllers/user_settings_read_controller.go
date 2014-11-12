package controllers

import (
	"github.com/astaxie/beego"

	"../../util"
)

// UserSettingsReadController 读取用户的配置信息
type UserSettingsReadController struct {
	beego.Controller
}

// Get 处理 GET 请求
func (controller *UserSettingsReadController) Get() {
	controller.Post()
}

// Post 处理 POST 请求
func (controller *UserSettingsReadController) Post() {
	controller.Data["json"] = util.SimpleResponse(gSrvConfig)
	controller.ServeJson()
}
