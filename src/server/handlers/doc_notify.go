package handlers

import (
	"net/http"

	"../web"
)

type DocNotifyHandler struct {
	Context web.Context
}

// docid=base64(${uidl}/att/xxx.docx)
// base64解码之后就可以知道需要回写的url路径
// 后续浏览附件的时候，如果有xxx.pdf，那么优先浏览这个，否则给出提示即可
// GET,/?did=bb87df5d7f11e5bfd39e74ed8f2dfacf&errno=41&errmsg=reach+max+conv+count&logid=3885844692&pages=0&pagesize=
func (h DocNotifyHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := h.Context

	ctx.GetLogger().Info("%s", r.URL.String())
	w.Write([]byte(`{"errno":0,"errmsg":"no error","logid":0}`))
}
