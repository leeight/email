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

type UserSettingsUpdateController struct {
	beego.Controller
}

func (this *UserSettingsUpdateController) Get() {
	this.Post()
}

func (this *UserSettingsUpdateController) Post() {
	var pop3Hostname = strings.Split(this.GetString("pop3.hostname"), ":")
	var pop3Host = pop3Hostname[0]
	var pop3Port, _ = strconv.Atoi(pop3Hostname[1])
	var pop3Interval, _ = this.GetInt("pop3.interval")
	var pop3Kmos, _ = this.GetInt("pop3.keep_mail_on_server")
	var pop3Rms, _ = this.GetInt("pop3.recent_mails")

	gSrvConfig.Pop3.Email = this.GetString("email")
	gSrvConfig.Pop3.Username = this.GetString("pop3.username")
	gSrvConfig.Pop3.Password = this.GetString("pop3.password")
	gSrvConfig.Pop3.Host = pop3Host
	gSrvConfig.Pop3.Port = pop3Port
	gSrvConfig.Pop3.Interval = time.Duration(pop3Interval)
	gSrvConfig.Pop3.RecentMails = int(pop3Rms)
	gSrvConfig.Pop3.KeepMailOnServer = int(pop3Kmos)
	gSrvConfig.Pop3.Tls = this.GetString("pop3.tls") == "on"

	// ---
	var smtpHostname = strings.Split(this.GetString("smtp.hostname"), ":")
	var smtpHost = smtpHostname[0]
	var smtpPort, _ = strconv.Atoi(smtpHostname[1])

	gSrvConfig.Smtp.Username = this.GetString("smtp.username")
	gSrvConfig.Smtp.Password = this.GetString("smtp.password")
	gSrvConfig.Smtp.Host = smtpHost
	gSrvConfig.Smtp.Port = smtpPort
	gSrvConfig.Smtp.Tls = this.GetString("smtp.tls") == "on"

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

	this.Data["json"] = util.SimpleResponse()
	this.ServeJson()
}
