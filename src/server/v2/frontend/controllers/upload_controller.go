package controllers

import (
	"crypto/md5"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"path"
	"strconv"

	"github.com/astaxie/beego"

	"../../util/storage"
)

// UploadController 处理用户的文件上传请求
type UploadController struct {
	beego.Controller
}

// Get 处理 GET 请求
func (controller *UploadController) Get() {
	controller.Post()
}

// Post 处理 POST 请求
func (controller *UploadController) Post() {
	switch controller.GetString("action") {
	case "image":
		controller.processImageUpload()
	case "file":
		controller.processFileUpload()
	default:
		controller.Abort(strconv.Itoa(http.StatusBadRequest))
	}
}

func (controller *UploadController) output(url string) {
	controller.Ctx.Output.Header("Content-Type", "application/json; charset=utf-8")
	controller.Ctx.WriteString(fmt.Sprintf(`{"state": "SUCCESS", "url": "%s"}`, url))
}

func (controller *UploadController) processFileUpload() {
	file, hdr, err := controller.GetFile("file")
	if err != nil {
		log.Println(err)
		controller.Abort(strconv.Itoa(http.StatusInternalServerError))
	}
	defer file.Close()

	buf, err := ioutil.ReadAll(file)
	if err != nil {
		log.Println(err)
		controller.Abort(strconv.Itoa(http.StatusInternalServerError))
	}

	var dst = path.Join(gSrvConfig.BaseDir,
		"downloads", "00000", "att", hdr.Filename)
	storage.NewDiskStorage(dst, buf, 0644).Save()
	controller.output(fmt.Sprintf("downloads/00000/att/%s", path.Base(dst)))
}

func (controller *UploadController) processImageUpload() {
	file, hdr, err := controller.GetFile("image")
	if err != nil {
		log.Println(err)
		controller.Abort(strconv.Itoa(http.StatusInternalServerError))
	}
	defer file.Close()

	buf, err := ioutil.ReadAll(file)
	if err != nil {
		log.Println(err)
		controller.Abort(strconv.Itoa(http.StatusInternalServerError))
	}

	var dst = path.Join(gSrvConfig.BaseDir,
		"downloads", "00000", "cid",
		fmt.Sprintf("%x%s", md5.Sum(buf), path.Ext(hdr.Filename)))
	storage.NewDiskStorage(dst, buf, 0644).Save()
	controller.output(fmt.Sprintf("downloads/00000/cid/%s", path.Base(dst)))
}
