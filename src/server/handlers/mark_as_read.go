package handlers

import (
	"encoding/json"
	"net/http"

	"../base"
	"../web"
)

type MarkAsReadHandler struct {
	Context web.Context
}

func (h MarkAsReadHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := h.Context
	log := ctx.GetLogger()
	db := ctx.GetDb()
	defer db.Close()

	sql := "UPDATE mails SET `is_read` = 1 WHERE `id` IN (" + r.FormValue("ids") + ")"
	log.Info(sql)

	_, err := db.Exec(sql)
	if err != nil {
		log.Warning("%s", err)
	}

	s, _ := json.MarshalIndent(
		base.NewSimpleResponse("true"), "", "    ")
	w.Write(s)
}
