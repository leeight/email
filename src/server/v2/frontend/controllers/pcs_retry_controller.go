package controllers

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"
	"strconv"

	"github.com/astaxie/beego"

	"../../util"
	"../../util/storage"
)

type PcsRetryController struct {
	beego.Controller
}

func (this *PcsRetryController) Get() {
	this.Post()
}

func (this *PcsRetryController) Post() {
	var uidl = this.GetString("uidl")
	if uidl == "" {
		this.Abort(strconv.Itoa(http.StatusBadRequest))
	}

	var downloadDir = path.Join(gSrvConfig.BaseDir, "downloads", uidl, "att")
	if _, err := os.Stat(downloadDir); err != nil {
		log.Println(err)
		this.Abort(strconv.Itoa(http.StatusBadRequest))
	}

	fileInfos, err := ioutil.ReadDir(downloadDir)
	if err != nil {
		log.Println(err)
		this.Abort(strconv.Itoa(http.StatusInternalServerError))
	}

	var token = gSrvConfig.Service.Netdisk.AccessToken
	if token == "" {
		log.Println("AccessToken is not set.")
		this.Abort(strconv.Itoa(http.StatusInternalServerError))
	}

	for _, item := range fileInfos {
		if item.IsDir() {
			continue
		}

		go saveToNetdisk(downloadDir, item.Name(), uidl)
	}

	this.Data["json"] = util.SimpleResponse()
	this.ServeJson()
}

func saveToNetdisk(x, y, z string) {
	var token = gSrvConfig.Service.Netdisk.AccessToken
	var uidl = util.StripInvalidCharacter(z)
	var name = util.StripInvalidCharacter(y)
	data, err := ioutil.ReadFile(path.Join(x, y))

	if err != nil {
		log.Println(err)
		return
	}

	if uidl != "" && name != "" {
		// 一般不会超过1000个字节，所以不考虑超长的情况了
		var dst = fmt.Sprintf("/apps/dropbox/%s/%s/%s/%s",
			gSrvConfig.Pop3.Domain, gSrvConfig.Pop3.Username, uidl, name)
		if len([]byte(dst)) > 1000 {
			log.Println(dst, "was too long")
			return
		}

		// TODO(user) 应该通过 chan 传递数据过去，而不是每次启动一个新的 goroutine
		storage.NewNetdiskStorage(token, dst, data).Save()
	}
}
