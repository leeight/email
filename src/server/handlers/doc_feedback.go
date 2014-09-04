package handlers

import (
	"encoding/base64"
	"io/ioutil"
	"net/http"
	"os"
	"path"
	"strings"

	"../web"
)

type DocFeedbackHandler struct {
	Context web.Context
}

// docid=base64(${uidl}/att/xxx.docx)
// base64解码之后就可以知道需要回写的url路径
// 后续浏览附件的时候，如果有xxx.pdf，那么优先浏览这个，否则给出提示即可
func (h DocFeedbackHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := h.Context
	log := ctx.GetLogger()
	config := ctx.GetConfig()

	r.ParseMultipartForm(-1)

	docid := r.URL.Query().Get("docid")
	if docid == "" {
		http.Error(w, "invalid docid.", http.StatusBadRequest)
		return
	}

	fpath, err := base64.StdEncoding.DecodeString(docid)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	log.Info(string(fpath))

	parts := strings.Split(string(fpath), "/")
	if len(parts) != 3 {
		http.Error(w, "invalid docid", http.StatusBadRequest)
		return
	}

	// nc -l -p 8766 来调试原始的数据格式
	f, _, err := r.FormFile("data")
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	c, err := ioutil.ReadAll(f)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	dpath := path.Join(
		config.DownloadDir(),
		parts[0],
		"doc",
		strings.Replace(parts[2], path.Ext(parts[2]), ".pdf", 1),
	)
	log.Info("%s, %s, %s, %s", dpath,
		r.FormValue("pages"),
		r.FormValue("page"),
		r.FormValue("type"))

	// 保存文件的内容，下次预览就可以用了
	os.MkdirAll(path.Dir(dpath), 0755)
	ioutil.WriteFile(dpath, c, 0644)

	w.Write([]byte(`{"errno":0,"errmsg":"no error","logid":0}`))
}
