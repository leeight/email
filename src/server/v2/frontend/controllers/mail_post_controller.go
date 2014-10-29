package controllers

import (
	"fmt"
	"log"
	"net/http"
	"path"
	"strconv"
	"time"

	"github.com/astaxie/beego"

	"../../../RFC2047"
	"../../../net/mail"
	"../../util"
	"../../util/builder"
	"../../util/parser"
	"../../util/saver"
	"../../util/sender"
	"../../util/storage"
)

// 邮件列表默认页面
type MailPostController struct {
	beego.Controller
}

func (this *MailPostController) Get() {
	this.Post()
}

func (this *MailPostController) Post() {
	var subject = this.GetString("subject")
	if subject == "" {
		this.Abort(strconv.Itoa(http.StatusBadRequest))
	}

	var to = util.ParseAddressList(this.GetString("to"))
	if to == nil || len(to) <= 0 {
		this.Abort(strconv.Itoa(http.StatusBadRequest))
	}

	var from, _ = mail.ParseAddress(fmt.Sprintf("%s <%s>",
		RFC2047.Encode(gSrvConfig.Pop3.Username),
		gSrvConfig.Pop3.Email))
	var cc = util.ParseAddressList(this.GetString("cc"))
	var bcc = util.ParseAddressList(this.GetString("bcc"))

	var mailer = &builder.MailBuilder{
		From:        from,
		Subject:     subject,
		To:          to,
		Cc:          cc,
		Bcc:         bcc,
		Message:     this.GetString("message"),
		Uidl:        this.GetString("uidl"),
		Attachments: this.GetString("attachments"),
		SrvConfig:   gSrvConfig,
	}
	var raw, err = mailer.Enclose()
	if err != nil {
		log.Println(err)
		this.Abort(strconv.Itoa(http.StatusServiceUnavailable))
	}

	// log.Println(string(raw.Bytes()))

	// 先保存，然后再发送邮件
	go this.saveAndSendMail(mailer, raw.Bytes())

	this.Data["json"] = util.SimpleResponse()
	this.ServeJson()
}

func (this *MailPostController) saveAndSendMail(
	mailer *builder.MailBuilder, raw []byte) {
	// 已发送邮件的uidl
	var uidl = fmt.Sprintf("%d", time.Now().UnixNano())

	// 把报文保存到本地，如果保存失败了，也不管，继续发送
	var dst = path.Join(gSrvConfig.BaseDir, "raw", "sent", uidl+".txt")
	var err = storage.NewDiskStorage(dst, raw, 0644).Save()
	if err != nil {
		log.Println(err)
	}

	// 解析邮件的正文，得到 Email 对象
	email, err := parser.NewEmail(raw)
	if err != nil {
		log.Println(uidl, err)
	} else {
		email.Uidl = uidl
		email.IsSent = 1
		email.IsRead = 1
		email.Status = 1 // 发送中

		saver.EmailSave(email, gSrvConfig)
		saver.EmailResourceSave(email, gSrvConfig)
	}

	// 开始发送邮件，即便上面失败了，也会走到这里的
	log.Println("Sending Mail...")
	var auth = sender.NewLoginAuth(gSrvConfig.Smtp.Username,
		gSrvConfig.Smtp.Password)
	var server = fmt.Sprintf("%s:%d", gSrvConfig.Smtp.Host, gSrvConfig.Smtp.Port)
	var tls = gSrvConfig.Smtp.Tls
	err = sender.SendMail(mailer, raw, server, tls, auth)
	if err != nil {
		log.Println("Failed Sent Mail", uidl+".txt", err)
	} else {
		log.Printf("Successfully Sent Mail %s\n", uidl+".txt")
	}

	// 成功之后把发送状态修改回来
	if email.Id > 0 {
		if err != nil {
			// 发送失败
			email.Status = 2
		} else {
			// 发送成功
			email.Status = 0
		}

		_, err = gSrvConfig.Ormer.Update(email, "Status")
		if err != nil {
			log.Println(err)
		}
	}
}
