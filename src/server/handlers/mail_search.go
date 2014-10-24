package handlers

import (
	"encoding/json"
	"net/http"

	"../base"
	"../web"
	"./schema"
)

type MailSearchHandler struct {
	Context web.Context
}

func (h MailSearchHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := h.Context
	log := ctx.GetLogger()
	db := ctx.GetDb()
	defer db.Close()

	params := new(schema.MailSearchSchema)
	params.Init(r)

	sql := params.BuildListSql()
	log.Info(sql)

	emails := make([]*base.EMailViewModel, 0)

	rows, err := db.Query(sql,
		"%"+params.Keyword+"%",
		params.SkipCount, params.PageSize)
	if err != nil {
		log.Warning("%s", err)
	}
	defer rows.Close()

	// 格式化数据
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
			&email.IsRead)

		evm := email.ToViewModel(ctx.GetConfig().DownloadDir(), db)
		emails = append(emails, evm)
	}

	var totalCount int
	totalSql := params.BuildTotalSql()
	err = db.QueryRow(totalSql, "%"+params.Keyword+"%").Scan(&totalCount)
	if err != nil {
		log.Warning("%s", err)
	}
	log.Info("%s, %d, %d, %d\n", totalSql, totalCount, params.SkipCount, params.PageSize)

	lpr := base.NewListResponse("true", totalCount, params.PageNo, params.PageSize, emails)
	s, _ := json.MarshalIndent(lpr, "", "    ")
	w.Write(s)
}
