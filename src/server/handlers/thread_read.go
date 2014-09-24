package handlers

import (
	"encoding/json"
	"net/http"

	"../base"
	"../web"
)

type ThreadReadHandler struct {
	Context web.Context
}

func (h ThreadReadHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := h.Context
	log := ctx.GetLogger()
	db := ctx.GetDb()
	defer db.Close()

	sql := "SELECT `id`, `uidl`, `from`, `to`, `cc`, `bcc`, " +
		"`reply_to`, `subject`, `date`, `message`, `is_read` " +
		"FROM `mails` " +
		"WHERE `thread_id` = ? ORDER BY `date` ASC"
	log.Info(sql)

	tid := r.FormValue("id")
	rows, err := db.Query(sql, tid)
	if err != nil {
		log.Warning("%s", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var emails []*base.EMailViewModel
	for rows.Next() {
		var email base.EMail
		rows.Scan(
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
			&email.IsRead)

		emails = append(emails, email.ToViewModel(ctx.GetConfig().DownloadDir(), db))
	}

	sql = "UPDATE `threads` SET `is_read` = 1 WHERE `id` = ?; " +
		"UPDATE `mails` SET `is_read` = 1 WHERE `thread_id` = ?; "
	db.Exec(sql, tid, tid)

	sr := base.NewSimpleResponse("true", emails)
	s, _ := json.MarshalIndent(sr, "", "    ")
	w.Write(s)
}
