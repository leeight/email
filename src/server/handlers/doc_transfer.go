package handlers

import (
	"net/http"
	"os"
	"path"

	"../task"
	"../web"
)

type DocTransferHandler struct {
	Context web.Context
}

// docid=base64(${uidl}/att/xxx.docx)
// base64解码之后就可以知道需要回写的url路径
// 后续浏览附件的时候，如果有xxx.pdf，那么优先浏览这个，否则给出提示即可
// GET,/?did=bb87df5d7f11e5bfd39e74ed8f2dfacf&errno=41&errmsg=reach+max+conv+count&logid=3885844692&pages=0&pagesize=
func (h DocTransferHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := h.Context
	config := ctx.GetConfig()
	log := ctx.GetLogger()

	docid := r.URL.Query().Get("docid")
	abs := path.Join(config.DownloadDir(), docid)

	if _, err := os.Stat(abs); os.IsNotExist(err) {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Info("DocTransferHandler: %s", docid)
	go task.NewDocTransferTask(docid, ctx)
	w.Write([]byte(`OK`))
}
