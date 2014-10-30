package controllers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"

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
		this.Abort(strconv.Itoa(http.StatusInternalServerError))
	}

	// 查询Tag下面未读的邮件数量
	// 貌似直接调用ORM的接口返回的数据不对，所以只好用原生的方法
	// TODO(user) gSrvConfig.Ormer.Raw(sql).QueryRows(&tagGroups)
	var sql = "SELECT T2.`id` AS Id, COUNT(T0.`id`) AS Count " +
		"FROM `email` T0 " +
		"INNER JOIN `email_tags` T1 ON T1.`email_id` = T0.`id` " +
		"INNER JOIN `tag` T2 ON T2.`id` = T1.`tag_id` " +
		"WHERE T0.`is_read` = 0 " +
		"GROUP BY T2.`id`"
	db, err := orm.GetDB()
	if err != nil {
		log.Println(err)
		this.Abort(strconv.Itoa(http.StatusInternalServerError))
	}

	rows, err := db.Query(sql)
	if err != nil {
		log.Println(err)
		this.Abort(strconv.Itoa(http.StatusInternalServerError))
	}
	defer rows.Close()

	var tagGroupMap = make(map[int64]int64)
	for rows.Next() {
		var i, c int64
		if err := rows.Scan(&i, &c); err != nil {
			log.Println(err)
		}
		tagGroupMap[i] = c
	}
	if err := rows.Err(); err != nil {
		log.Println(err)
		this.Abort(strconv.Itoa(http.StatusInternalServerError))
	}

	log.Println(sql)

	for _, tag := range tags {
		if count, ok := tagGroupMap[tag.Id]; ok {
			tag.UnreadCount = count
		}
	}

	this.Data["json"] = util.SimpleResponse(tags)
	this.ServeJson()
}
