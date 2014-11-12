package controllers

import (
	"os"
	"path"
	"strconv"
	"strings"
	"time"

	"code.google.com/p/go.net/publicsuffix"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"

	"../../util"
)

// UserSettingsUpdateController 更新用户的配置信息
type UserSettingsUpdateController struct {
	beego.Controller
}

// Get 处理 GET 请求
func (controller *UserSettingsUpdateController) Get() {
	controller.Post()
}

// Post 处理 POST 请求
func (controller *UserSettingsUpdateController) Post() {
	var pop3Hostname = strings.Split(controller.GetString("pop3.hostname"), ":")
	var pop3Host = pop3Hostname[0]
	var pop3Port, _ = strconv.Atoi(pop3Hostname[1])
	var pop3Interval, _ = controller.GetInt("pop3.interval")
	var pop3Kmos, _ = controller.GetInt("pop3.keep_mail_on_server")
	var pop3Rms, _ = controller.GetInt("pop3.recent_mails")

	gSrvConfig.Pop3.Email = controller.GetString("email")
	gSrvConfig.Pop3.Username = controller.GetString("pop3.username")
	gSrvConfig.Pop3.Password = controller.GetString("pop3.password")
	gSrvConfig.Pop3.Host = pop3Host
	gSrvConfig.Pop3.Port = pop3Port
	gSrvConfig.Pop3.Interval = time.Duration(pop3Interval)
	gSrvConfig.Pop3.RecentMails = int(pop3Rms)
	gSrvConfig.Pop3.KeepMailOnServer = int(pop3Kmos)
	gSrvConfig.Pop3.TLS = controller.GetString("pop3.tls") == "on"

	// ---
	var smtpHostname = strings.Split(controller.GetString("smtp.hostname"), ":")
	var smtpHost = smtpHostname[0]
	var smtpPort, _ = strconv.Atoi(smtpHostname[1])

	gSrvConfig.SMTP.Username = controller.GetString("smtp.username")
	gSrvConfig.SMTP.Password = controller.GetString("smtp.password")
	gSrvConfig.SMTP.Host = smtpHost
	gSrvConfig.SMTP.Port = smtpPort
	gSrvConfig.SMTP.TLS = controller.GetString("smtp.tls") == "on"

	// --- 保存下来 ---
	gSrvConfig.Sync()

	if gSrvConfig.InitMode {
		// 重命名目录
		domain, _ := publicsuffix.EffectiveTLDPlusOne(
			gSrvConfig.Pop3.Host)

		gSrvConfig.BaseDir = path.Join("data", domain, gSrvConfig.Pop3.Username)

		os.MkdirAll(gSrvConfig.BaseDir, 0755)
		os.MkdirAll(path.Join(gSrvConfig.BaseDir, "raw"), 0755)
		os.MkdirAll(path.Join(gSrvConfig.BaseDir, "downloads"), 0755)
		os.MkdirAll(path.Join(gSrvConfig.BaseDir, "db"), 0755)

		orm.RegisterDataBase("default", "sqlite3",
			path.Join(gSrvConfig.BaseDir, "db", gSrvConfig.Service.Db.Name+".db"))

		// 初始化数据库
		orm.RunSyncdb("default", false, false)

		// 第一次设置成功了，启动收取邮件的工作
		gSrvConfig.Ormer = orm.NewOrm()
		gSrvConfig.Pop3.Domain = domain
		gSrvConfig.InitMode = false
	}

	controller.Data["json"] = util.SimpleResponse()
	controller.ServeJson()
}
