package controllers

import (
	"log"
	"net/http"
	"os"
	"path"
	"strconv"
	"strings"

	"github.com/astaxie/beego"

	"../../util"
	"../../util/parser"
)

// DocPreviewController 处理文档预览的请求 docx 和 xlsx
type DocPreviewController struct {
	beego.Controller
}

// Get 处理 GET 请求
func (controller *DocPreviewController) Get() {
	controller.Post()
}

// Post 处理 POST 请求
func (controller *DocPreviewController) Post() {
	// 根据 uidl 和 file 就可以计算出文件的路径
	var uidl = controller.GetString("uidl")
	var file = controller.GetString("file")

	// 参数不正确
	if uidl == "" || file == "" {
		controller.Abort(strconv.Itoa(http.StatusBadRequest))
	}

	var abs = path.Join(gSrvConfig.BaseDir, "downloads", uidl, "att", file)

	// 判断一下文件是否存在
	if _, err := os.Stat(abs); err != nil {
		controller.Abort(strconv.Itoa(http.StatusBadRequest))
	}

	if strings.HasSuffix(file, ".xlsx") {
		sheets, err := parser.XLSX2Html(abs)
		if err != nil {
			log.Println(err)
			controller.Abort(strconv.Itoa(http.StatusInternalServerError))
		}
		controller.Data["json"] = util.SimpleResponse(sheets)
		controller.ServeJson()
	} else if strings.HasSuffix(file, ".docx") {
		html, err := parser.DOCX2Html(abs)
		if err != nil {
			log.Println(err)
			controller.Abort(strconv.Itoa(http.StatusInternalServerError))
		}
		controller.Data["json"] = util.SimpleResponse(html)
		controller.ServeJson()
	} else {
		log.Printf("Unsupported doc format: %s\n", file)
		controller.Abort(strconv.Itoa(http.StatusBadRequest))
	}
}
