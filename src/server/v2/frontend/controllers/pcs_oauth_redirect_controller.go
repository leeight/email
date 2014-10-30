package controllers

import (
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/astaxie/beego"

	"../../models"
)

type PcsOAuthRedirectController struct {
	beego.Controller
}

func (this *PcsOAuthRedirectController) Get() {
	this.Post()
}

func (this *PcsOAuthRedirectController) Post() {
	var code = this.GetString("code")
	if code == "" {
		this.Abort(strconv.Itoa(http.StatusBadRequest))
	}

	var p = url.Values{}
	p.Set("grant_type", "authorization_code")
	p.Set("code", code)
	p.Set("client_id", "sO9daRmMp9hY6GZ0WfGTfZX1")
	p.Set("client_secret", "a9pxdjaFb5jVSGt7HvStNwEfspP8NxoD")
	p.Set("redirect_uri", "http://localhost:"+
		strconv.Itoa(gSrvConfig.Http.Port)+"/api/pcs/oauth_redirect")

	var url = "https://openapi.baidu.com/oauth/2.0/token?" + p.Encode()
	log.Println(url)

	resp, err := http.Get(url)
	if err != nil {
		log.Println(err)
		this.Abort(strconv.Itoa(http.StatusInternalServerError))
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println(err)
		this.Abort(strconv.Itoa(http.StatusInternalServerError))
	}

	if resp.StatusCode != 200 {
		log.Println(string(body))
		this.Abort(strconv.Itoa(http.StatusInternalServerError))
	}

	netdisk, err := models.NewNetdiskType(body)
	if err != nil {
		log.Println(err)
		this.Abort(strconv.Itoa(http.StatusInternalServerError))
	}
	gSrvConfig.Service.Netdisk = *netdisk
	gSrvConfig.Sync()

	this.Data["access_token"] = netdisk.AccessToken
	this.Data["expires"] = time.Now().Add(time.Duration(netdisk.ExpiresIn) * time.Second).String()
	this.TplNames = "pcs_oauth_redirect.tpl"
}
