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
	beego.Router("/api/mail/delete", &controllers.MailDeleteController{})
	beego.Router("/api/mail/post", &controllers.MailPostController{})
	beego.Router("/ori/message/:uidl.html", &controllers.OriMessageController{})

	// 文件和图片上传的功能
	beego.Router("/api/upload/controller", &controllers.UploadController{})

	// pcs授权之后的的回掉函数
	beego.Router("/api/pcs/oauth_redirect", &controllers.PcsOAuthRedirectController{})
	beego.Router("/api/pcs/retry", &controllers.PcsRetryController{})

	// 联系人列表
	beego.Router("/api/contacts", &controllers.ContactsController{})

	beego.Run()

	return nil
}
