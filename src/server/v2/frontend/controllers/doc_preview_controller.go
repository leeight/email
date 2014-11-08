package controllers

import (
	"log"
	"net/http"
	"os"
	"path"
	"strconv"

	"github.com/astaxie/beego"

	"../../util"
	"../../util/parser"
)

type DocPreviewController struct {
	beego.Controller
}

func (this *DocPreviewController) Get() {
	this.Post()
}

func (this *DocPreviewController) Post() {
	// 根据 uidl 和 file 就可以计算出文件的路径
	var uidl = this.GetString("uidl")
	var file = this.GetString("file")

	// 参数不正确
	if uidl == "" || file == "" {
		this.Abort(strconv.Itoa(http.StatusBadRequest))
	}

	var abs = path.Join(gSrvConfig.BaseDir, "downloads", uidl, "att", file)

	// 判断一下文件是否存在
	if _, err := os.Stat(abs); err != nil {
		this.Abort(strconv.Itoa(http.StatusBadRequest))
	}

	sheets, err := parser.XLSX2Html(abs)
	if err != nil {
		log.Println(err)
		this.Abort(strconv.Itoa(http.StatusInternalServerError))
	}

	this.Data["json"] = util.SimpleResponse(sheets)

	this.ServeJson()
}
