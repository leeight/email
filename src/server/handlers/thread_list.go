package handlers

import (
	"encoding/json"
	"net/http"

	"../base"
	"../net/mail"
	"../web"
	"./schema"
)

type ThreadListHandler struct {
	Context web.Context
}

func (h ThreadListHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := h.Context
	log := ctx.GetLogger()
	db := ctx.GetDb()
	defer db.Close()

	params := new(schema.ThreadListSchema)
	params.Init(r)

	// 准备sql
	listSql := params.BuildListSql()
	log.Info(listSql)

	rows, err := db.Query(listSql, params.SkipCount, params.PageSize)
	if err != nil {
		log.Warning("%s", err)
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}
	defer rows.Close()

	// 格式化数据
	var threads []*base.Thread
	for rows.Next() {
		var from string
		var thread base.Thread
		err := rows.Scan(
			&thread.Id,
			&from,
			&thread.Subject,
			&thread.Date,
			&thread.MailCount,
			&thread.IsRead)
		if err != nil {
			log.Warning("%s", err)
			continue
		}

		// if thread.MailCount <= 0 {
		// 	log.Warning("All of the mails in thread [%d] are removed", thread.Id)
		// 	continue
		// }

		thread.From, err = mail.ParseAddress(from)
		if err != nil {
			log.Warning("%s", err)
			continue
		}

		threads = append(threads, &thread)
	}

	// 查询总的数据量
	var totalCount int
	totalSql := params.BuildTotalSql()
	err = db.QueryRow(totalSql).Scan(&totalCount)
	if err != nil {
		log.Warning("%s", err)
	}
	log.Info("%s, %d, %d, %d\n", totalSql, totalCount, params.SkipCount, params.PageSize)

	lpr := base.NewListResponse("true", totalCount, params.PageNo, params.PageSize, threads)
	s, _ := json.MarshalIndent(lpr, "", "    ")
	w.Write(s)
}
