package handlers

import (
	"encoding/json"
	"net/http"

	"../base"
	"../web"
	"./schema"
)

type MailListHandler struct {
	Context web.Context
}

func (h MailListHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := h.Context
	log := ctx.GetLogger()
	db := ctx.GetDb()
	defer db.Close()

	params := new(schema.MailListSchema)
	params.Init(r)

	listSql := params.BuildListSql()
	log.Info(listSql)

	rows, err := db.Query(listSql, params.SkipCount, params.PageSize)
	if err != nil {
		log.Warning("%s", err)
	}
	defer rows.Close()

	// 格式化数据
	emails := make([]*base.EMailViewModel, 0)
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

	// 查询总的数据量
	var totalCount int
	totalSql := params.BuildTotalSql()
	err = db.QueryRow(totalSql).Scan(&totalCount)
	if err != nil {
		log.Warning("%s", err)
	}
	log.Info("%s, %d, %d, %d\n", totalSql, totalCount, params.SkipCount, params.PageSize)

	lpr := base.NewListResponse("true", totalCount, params.PageNo, params.PageSize, emails)
	s, _ := json.MarshalIndent(lpr, "", "    ")
	w.Write(s)
}
