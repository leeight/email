package controllers

import (
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"

	"../../util"
)

type AddStarController struct {
	beego.Controller
}

func (this *AddStarController) Get() {
	this.Post()
}

func (this *AddStarController) Post() {
	var ids = this.GetString("ids")
	if ids == "" {
		this.Abort(strconv.Itoa(http.StatusBadRequest))
	}

	_, err := gSrvConfig.Ormer.QueryTable("email").
		Filter("Id__in", strings.Split(ids, ",")).
		Update(orm.Params{"IsStar": 1})

	if err != nil {
		log.Println(err)
		this.Abort(strconv.Itoa(http.StatusInternalServerError))
	}

	this.Data["json"] = util.SimpleResponse()

	this.ServeJson()
}
