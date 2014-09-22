package handlers

import (
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"path"
	"strings"

	"../web"
)

type DocViewerHandler struct {
	Context web.Context
}

// 只有 if (/\.(doc|xls|ppt)x?$/i.test(item.name)) { 会进入这个Handler来处理
// docid=base64(${uidl}/att/xxx.docx)
// base64解码之后就可以知道需要回写的url路径
// 后续浏览附件的时候，如果有xxx.pdf，那么优先浏览这个，否则给出提示即可
// GET,/?did=bb87df5d7f11e5bfd39e74ed8f2dfacf&errno=41&errmsg=reach+max+conv+count&logid=3885844692&pages=0&pagesize=
func (h DocViewerHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := h.Context
	config := ctx.GetConfig()
	log := ctx.GetLogger()

	name := strings.Replace(r.URL.Path, "/doc/viewer/", "", 1)
	abs := path.Join(config.DownloadDir(), name)
	log.Info("name = [%s]", abs)

	if _, err := os.Stat(abs); os.IsNotExist(err) {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	parts := strings.Split(name, "/")
	htmlname := parts[0] + "/doc/" + strings.Replace(parts[2], path.Ext(parts[2]), ".html", 1)
	htmlabs := path.Join(config.DownloadDir(), htmlname)
	if _, err := os.Stat(htmlabs); err == nil {
		log.Info("htmlabs = [%s]", htmlabs)
		http.Redirect(w, r, "/downloads/"+htmlname, http.StatusMovedPermanently)
		return
	}

	os.MkdirAll(path.Dir(htmlabs), 0755)
	p := exec.Command(config.Service.Soffice.Exec,
		"--headless",
		"--convert-to", "html",
		"--outdir", path.Dir(htmlabs),
		abs)

	err := p.Start()
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}

	err = p.Wait()
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}

	if _, err := os.Stat(htmlabs); err == nil {
		log.Info("htmlabs = [%s]", htmlabs)
		// 添加自定义的样式，美化一下效果
		raw, _ := ioutil.ReadFile(htmlabs)
		style := `
        <style type="text/css">
        html{ background: #ebebeb}
        body{
          width:980px;
          margin: 50px auto;
          background: #fff;
          padding: 10px;
          box-shadow: 0 0 0 1px #d1d1d1, 0 0 4px 1px #ccc;
        }
        </style>
        </head>`
		raw = []byte(strings.Replace(string(raw), "</head>", style, -1))

		ioutil.WriteFile(htmlabs, raw, 0644)

		http.Redirect(w, r, "/downloads/"+htmlname, http.StatusMovedPermanently)
		return
	}
}
