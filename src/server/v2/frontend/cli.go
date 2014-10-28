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
	beego.Router("/api/mail/read", &controllers.MailReadController{})
	beego.Router("/api/mail/search", &controllers.MailSearchController{})
	beego.Router("/api/mail/mark_as_read", &controllers.MarkAsReadController{})
	beego.Router("/api/mail/add_star", &controllers.AddStarController{})
	beego.Router("/api/mail/remove_star", &controllers.RemoveStarController{})

	beego.Run()

	return nil
}
