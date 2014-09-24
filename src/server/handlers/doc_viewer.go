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
	ext := path.Ext(parts[2])

	previewExt := ".html"
	if ext == ".pptx" || ext == ".ppt" {
		previewExt = ".pdf"
	}

	previewName := parts[0] + "/doc/" + strings.Replace(parts[2], ext, previewExt, 1)
	previewAbs := path.Join(config.DownloadDir(), previewName)
	if _, err := os.Stat(previewAbs); err == nil {
		log.Info("previewAbs = [%s]", previewAbs)
		http.Redirect(w, r, "/downloads/"+previewName, http.StatusMovedPermanently)
		return
	}

	os.MkdirAll(path.Dir(previewAbs), 0755)
	p := exec.Command(config.Service.Soffice.Exec,
		"--headless",
		"--convert-to", previewExt[1:],
		"--outdir", path.Dir(previewAbs),
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

	if _, err := os.Stat(previewAbs); err == nil {
		log.Info("previewAbs = [%s]", previewAbs)
		if previewExt == ".html" {
			// 添加自定义的样式，美化一下效果
			raw, _ := ioutil.ReadFile(previewAbs)
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
			title := `
				<div style="position: absolute;top: 0;">
						<h1 style="margin: 0;position: relative;left: -10px;">` + path.Base(name) + `</h1>
				</div>
				</body>`

			raw = []byte(strings.Replace(string(raw), "</head>", style, 1))
			raw = []byte(strings.Replace(string(raw), "</body>", title, 1))
			ioutil.WriteFile(previewAbs, raw, 0644)
		}
		http.Redirect(w, r, "/downloads/"+previewName, http.StatusMovedPermanently)
	} else {
		http.Error(w, "Converted document failed", http.StatusInternalServerError)
	}
}
