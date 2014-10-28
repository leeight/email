package controllers

import (
	"log"

	"github.com/astaxie/beego"

	"../../models"
	"../../util"
)

type LabelsController struct {
	beego.Controller
}

func (this *LabelsController) Get() {
	this.Post()
}

func (this *LabelsController) Post() {
	var qs = gSrvConfig.Ormer.QueryTable("tag")

	var tags []*models.Tag
	_, err := qs.OrderBy("Name").All(&tags)
	if err != nil {
		log.Println(err)
		return
	}

	for _, tag := range tags {
		var qs = gSrvConfig.Ormer.QueryTable("email")
		count, err := qs.
			Filter("Tags__Tag__Id", tag.Id).
			Filter("IsRead", 0).
			Count()
		if err != nil {
			continue
		}
		tag.UnreadCount = count
	}

	this.Data["json"] = util.SimpleResponse(tags)
	this.ServeJson()
}
