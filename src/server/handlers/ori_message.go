package handlers

import (
	"net/http"
	"regexp"

	"../web"
)

type OriMessageHandler struct {
	Context web.Context
}

// 请求的路径格式是 /ori/message/${uidl}.html
func (h OriMessageHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := h.Context
	db := ctx.GetDb()
	log := ctx.GetLogger()
	defer db.Close()

	// 准备sql
	sql := "SELECT `message` FROM mails WHERE uidl = ?"
	re := regexp.MustCompile(`^/ori/message/(.*).html$`)
	sm := re.FindAllStringSubmatch(r.URL.Path, -1)
	if len(sm) != 1 {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	uidl := sm[0][1]
	log.Info("%s, %s, %v", sql, uidl, sm)

	var message string
	err := db.QueryRow(sql, uidl).Scan(&message)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	html := regexp.MustCompile(`src="downloads/`).ReplaceAll(
		[]byte(message), []byte(`src="/downloads/`))
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Write(html)
}
