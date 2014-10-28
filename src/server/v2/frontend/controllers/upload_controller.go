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

type UploadController struct {
	beego.Controller
}

func (this *UploadController) Get() {
	this.Post()
}

func (this *UploadController) Post() {
	switch this.GetString("action") {
	case "image":
		this.processImageUpload()
	case "file":
		this.processFileUpload()
	default:
		this.Abort(strconv.Itoa(http.StatusBadRequest))
	}
}

func (this *UploadController) output(url string) {
	this.Ctx.Output.Header("Content-Type", "application/json; charset=utf-8")
	this.Ctx.WriteString(fmt.Sprintf(`{"state": "SUCCESS", "url": "%s"}`, url))
}

func (this *UploadController) processFileUpload() {
	file, hdr, err := this.GetFile("file")
	if err != nil {
		log.Println(err)
		this.Abort(strconv.Itoa(http.StatusInternalServerError))
	}
	defer file.Close()

	buf, err := ioutil.ReadAll(file)
	if err != nil {
		log.Println(err)
		this.Abort(strconv.Itoa(http.StatusInternalServerError))
	}

	var dst = path.Join(gSrvConfig.BaseDir,
		"downloads", "00000", "att", hdr.Filename)
	storage.NewDiskStorage(dst, buf, 0644).Save()
	this.output(fmt.Sprintf("downloads/00000/att/%s", path.Base(dst)))
}

func (this *UploadController) processImageUpload() {
	file, hdr, err := this.GetFile("image")
	if err != nil {
		log.Println(err)
		this.Abort(strconv.Itoa(http.StatusInternalServerError))
	}
	defer file.Close()

	buf, err := ioutil.ReadAll(file)
	if err != nil {
		log.Println(err)
		this.Abort(strconv.Itoa(http.StatusInternalServerError))
	}

	var dst = path.Join(gSrvConfig.BaseDir,
		"downloads", "00000", "cid",
		fmt.Sprintf("%x%s", md5.Sum(buf), path.Ext(hdr.Filename)))
	storage.NewDiskStorage(dst, buf, 0644).Save()
	this.output(fmt.Sprintf("downloads/00000/cid/%s", path.Base(dst)))
}
