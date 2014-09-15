package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

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

	var mids string
	err := db.QueryRow("SELECT `mids` FROM `threads` WHERE id = ?",
		r.FormValue("id")).Scan(&mids)
	if err != nil {
		log.Warning("%s", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	log.Info("Mids = %s", mids)

	var sql string
	if strings.Index(mids, ",") != -1 {
		sql = "SELECT " +
			"`id`, `uidl`, `from`, `to`, `cc`, `bcc`, " +
			"`reply_to`, `subject`, `date`, `message`, `is_read` " +
			"FROM mails " +
			"WHERE `uidl` IN (" + mids + ")"
	} else {
		sql = "SELECT " +
			"`id`, `uidl`, `from`, `to`, `cc`, `bcc`, " +
			"`reply_to`, `subject`, `date`, `message`, `is_read` " +
			"FROM mails " +
			"WHERE `uidl` = " + mids
	}
	log.Info(sql)

	rows, err := db.Query(sql)
	if err != nil {
		log.Warning("%s", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	eids := make([]string, 0)
	emails := make([]*base.EMail, 0)
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

		emails = append(emails, &email)
		eids = append(eids, strconv.FormatUint(email.Id, 10))
	}

	sql = "UPDATE threads SET `is_read` = 1 WHERE `id` = ?"
	db.Exec(sql, r.FormValue("id"))
	log.Info(sql)

	if len(eids) > 1 {
		sql = "UPDATE mails SET `is_read` = 1 WHERE `id` IN (" + strings.Join(eids, ",") + ")"
	} else {
		sql = "UPDATE mails SET `is_read` = 1 WHERE `id` = " + eids[0]
	}
	db.Exec(sql)
	log.Info(sql)

	evms := make([]*base.EMailViewModel, len(emails))
	for idx, email := range emails {
		evms[idx] = email.ToViewModel(ctx.GetConfig().DownloadDir(), db)
	}
	sr := base.NewSimpleResponse("true", evms)
	s, _ := json.MarshalIndent(sr, "", "    ")
	w.Write(s)
}
