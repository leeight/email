package frontend

import (
	"github.com/astaxie/beego"

	"../models"
	"./controllers"
)

// 启动 frontend 服务
func Run(config *models.ServerConfig) error {
	controllers.SetServerConfig(config)

	beego.Router("/api/inbox", &controllers.InboxController{})
	beego.Router("/api/labels", &controllers.LabelsController{})
	beego.Run()

	return nil
}
