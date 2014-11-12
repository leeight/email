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

// AddStarController 处理添加星标的请求
type AddStarController struct {
	beego.Controller
}

// Get 处理 GET 请求
func (controller *AddStarController) Get() {
	controller.Post()
}

// Post 处理 POST 请求
func (controller *AddStarController) Post() {
	var ids = controller.GetString("ids")
	if ids == "" {
		controller.Abort(strconv.Itoa(http.StatusBadRequest))
	}

	_, err := gSrvConfig.Ormer.QueryTable("email").
		Filter("Id__in", strings.Split(ids, ",")).
		Update(orm.Params{"IsStar": 1})

	if err != nil {
		log.Println(err)
		controller.Abort(strconv.Itoa(http.StatusInternalServerError))
	}

	controller.Data["json"] = util.SimpleResponse()

	controller.ServeJson()
}
