package handlers

import (
	"encoding/json"
	"net/http"

	"../base"
	"../web"
)

type MailReadHandler struct {
	Context web.Context
}

func (h MailReadHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := h.Context
	log := ctx.GetLogger()
	db := ctx.GetDb()
	defer db.Close()

	sql := "SELECT " +
		"`id`, `uidl`, `from`, `to`, `cc`, `bcc`, " +
		"`reply_to`, `subject`, `date`, `message`, `is_sent` " +
		"FROM mails " +
		"WHERE `id` = ?"
	log.Info(sql)

	var email base.EMail
	err := db.QueryRow(sql, r.FormValue("id")).Scan(
		&email.Id,
		&email.Uidl,
		&email.From,
		&email.To,
		&email.Cc,
		&email.Bcc,
		&email.ReplyTo,
		&email.Subject,
		&email.Date,
		&email.Message,
		&email.IsSent)

	if err != nil {
		log.Warning("%s", err)
	}

	_, err = db.Exec("UPDATE mails SET `is_read` = 1 WHERE `id` = ?", r.FormValue("id"))
	if err != nil {
		log.Warning("%s", err)
	}

	evm := email.ToViewModel(ctx.GetConfig().DownloadDir(), db)
	sr := base.NewSimpleResponse("true", evm)
	s, _ := json.MarshalIndent(sr, "", "    ")
	w.Write(s)
}
