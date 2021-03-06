package controllers

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/astaxie/beego"

	"../../models"
)

var tplPcsOauthRedirect = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>绑定成功</title>
    <link rel="stylesheet" type="text/css" href="http://libs.useso.com/js/bootstrap/3.2.0/css/bootstrap.css" />
    <style type="text/css">
    th { width: 150px; text-align: right; }
    </style>
  </head>
  <body>
    <div class="container">
      <h3>绑定成功</h3>
      <table width="100%%" cellpadding="0" cellspacing="0" class="table">
        <tr>
          <th>Access Token</th><td>%s</td>
        </tr>
        <tr>
          <th>有效期</th><td>%s</td>
        </tr>
      </table>
      <div class="btn-group">
        <button class="btn btn-success" id="close">关闭</button>
      </div>
    </div>
    <script type="text/javascript">
    document.getElementById('close').onclick = function() {
      try {
        window.close();
      }
      catch(ex){}
    };
    </script>
  </body>
</html>`

// PcsOAuthRedirectController 处理网盘授权的请求
type PcsOAuthRedirectController struct {
	beego.Controller
}

// Get 处理 GET 请求
func (controller *PcsOAuthRedirectController) Get() {
	controller.Post()
}

// Post 处理 POST 请求
func (controller *PcsOAuthRedirectController) Post() {
	var code = controller.GetString("code")
	if code == "" {
		controller.Abort(strconv.Itoa(http.StatusBadRequest))
	}

	var p = url.Values{}
	p.Set("grant_type", "authorization_code")
	p.Set("code", code)
	p.Set("client_id", "sO9daRmMp9hY6GZ0WfGTfZX1")
	p.Set("client_secret", "a9pxdjaFb5jVSGt7HvStNwEfspP8NxoD")
	p.Set("redirect_uri", "http://localhost:"+
		strconv.Itoa(gSrvConfig.HTTP.Port)+"/api/pcs/oauth_redirect")

	var url = "https://openapi.baidu.com/oauth/2.0/token?" + p.Encode()
	log.Println(url)

	resp, err := http.Get(url)
	if err != nil {
		log.Println(err)
		controller.Abort(strconv.Itoa(http.StatusInternalServerError))
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println(err)
		controller.Abort(strconv.Itoa(http.StatusInternalServerError))
	}

	if resp.StatusCode != 200 {
		log.Println(string(body))
		controller.Abort(strconv.Itoa(http.StatusInternalServerError))
	}

	netdisk, err := models.NewNetdiskType(body)
	if err != nil {
		log.Println(err)
		controller.Abort(strconv.Itoa(http.StatusInternalServerError))
	}
	gSrvConfig.Service.Netdisk = *netdisk
	gSrvConfig.Sync()

	var token = netdisk.AccessToken
	var expires = time.Now().Add(time.Duration(netdisk.ExpiresIn) * time.Second).String()
	controller.Ctx.ResponseWriter.Header().Set("Content-Type", "text/html; charset=utf-8")
	controller.Ctx.WriteString(fmt.Sprintf(tplPcsOauthRedirect, token, expires))
}
