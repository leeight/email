package controllers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/astaxie/beego"

	"../../models"
	"../../util"
)

type ContactsController struct {
	beego.Controller
}

func (this *ContactsController) Get() {
	this.Post()
}

func (this *ContactsController) Post() {
	var o = gSrvConfig.Ormer
	var qs = o.QueryTable("contact").
		Filter("Address__icontains", this.GetString("keyword")).
		OrderBy("-Count").
		Offset(0).
		Limit(6)

	var contacts []*models.Contact
	_, err := qs.All(&contacts)
	if err != nil {
		log.Println(err)
		this.Abort(strconv.Itoa(http.StatusInternalServerError))
	}

	this.Data["json"] = util.ListResponse(6, 1, 6, contacts)
	this.ServeJson()
}
