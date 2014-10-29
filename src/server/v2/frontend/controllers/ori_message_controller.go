package controllers

import (
	"fmt"
	"log"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"

	"github.com/astaxie/beego"

	"../../models"
)

type OriMessageController struct {
	beego.Controller
}

func (this *OriMessageController) Get() {
	this.Post()
}

func (this *OriMessageController) Post() {
	var uidl = this.Ctx.Input.Param(":uidl")
	if uidl == "" {
		this.Abort(strconv.Itoa(http.StatusBadRequest))
	}

	var email models.Email
	err := gSrvConfig.Ormer.QueryTable("email").
		Filter("Uidl", uidl).
		One(&email, "Message", "Uidl")

	if err != nil {
		log.Println(err)
		this.Abort(strconv.Itoa(http.StatusInternalServerError))
	}

	// 替换src="cid:"的内容
	var re = regexp.MustCompile(`src="cid:([^"]+)"`)
	email.Message = re.ReplaceAllString(email.Message,
		fmt.Sprintf(`src="/downloads/%s/cid/$1"`, url.QueryEscape(email.Uidl)))

	// 从sqlite3导入数据到mysql之后，发生了转义的问题
	// 如果全部修复，貌似也没啥意义，就这里用到的时候再处理一下吧
	if strings.Index(email.Message, "`Content-Type`") != -1 {
		email.Message = strings.Replace(email.Message, "`", "'", -1)
	}

	this.Ctx.ResponseWriter.Header().Set("Content-Type", "text/html; charset=utf-8")
	this.Ctx.WriteString(email.Message)
}
