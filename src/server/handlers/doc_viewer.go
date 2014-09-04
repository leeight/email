package handlers

import (
	"net/http"
	"os"
	"path"
	"strings"
	// "net/url"

	"../web"
)

type DocViewerHandler struct {
	Context web.Context
}

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
	log.Info("%s", abs)

	if _, err := os.Stat(abs); os.IsNotExist(err) {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	pdfname := strings.Replace(name, path.Ext(name), ".pdf", 1)
	pdfabs := path.Join(config.DownloadDir(), pdfname)
	if _, err := os.Stat(pdfabs); err == nil {
		http.Redirect(w, r, path.Base(pdfname), http.StatusMovedPermanently)
		return
	}

	w.Write([]byte(`<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>预览『` + path.Base(name) + `』</title>
      <style type="text/css">
      html, body {
        height: 100%;
      }
      body {
        font-family: Arial, Helvetica, STHeiti, SimSun, sans-serif;
        font-size: 12px;
        color: #000;
      }
      p {
        position: relative;
        top: 50%;
        height: 100px;
        line-height: 100px;
        font-size: 18px;
        text-align: center;
        margin: 0;
        margin-top: -50px;
      }
      </style>
    </head>
    <body>
      <p>你可以<a id="submit-req" href="javascript:void(0)">提交文档转码请求</a>或者<a download="` + path.Base(name) +
		`" href="/downloads/` + name + `">直接下载</a>文档查看</p>
    </body>
    <script type="text/javascript">
    document.getElementById("submit-req").onclick = function() {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            alert('提交成功，请稍候重试')
          } else {
            alert(xhr.responseText);
          }
        }
      }
      var url = '/api/doc/transfer?docid=' + encodeURIComponent('` + name + `')
      xhr.open('POST', url, true);
      xhr.send(null);
      return false;
    };
    </script>
  </html>
  `))
}
