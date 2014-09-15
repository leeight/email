package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"../base"
	"../net/mail"
	"../web"
)

type ThreadListHandler struct {
	Context web.Context
}

func (h ThreadListHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := h.Context
	log := ctx.GetLogger()
	db := ctx.GetDb()
	defer db.Close()

	var (
		kDefaultPageSize = 15
		kDefaultPageNo   = 1
	)

	// TODO(user) 如何更通用一些呢？ 解析url参数
	pageSize, err := strconv.Atoi(r.PostFormValue("pageSize"))
	if err != nil {
		pageSize = kDefaultPageSize
	}

	pageNo, err := strconv.Atoi(r.PostFormValue("pageNo"))
	if err != nil {
		pageNo = kDefaultPageNo
	}

	// labelId, err := strconv.Atoi(r.PostFormValue("label"))
	// if err != nil {
	// 	labelId = -1
	// }

	skipCount := (pageNo - 1) * pageSize
	if skipCount < 0 {
		skipCount = 0
	}

	// isDeleted := r.PostFormValue("is_delete")

	// 准备sql
	sql := "SELECT " +
		"`id`, `from`, `subject`, `date`, `mids`, `is_read` " +
		"FROM `threads` "
	// if isDeleted == "1" {
	// 	sql += "WHERE `is_delete` = 1 "
	// } else {
	// 	if labelId > 0 {
	// 		sql += "WHERE `is_delete` != 1 AND `id` IN (SELECT `mid` FROM `mail_tags` WHERE `tid` = " + strconv.Itoa(labelId) + ") "
	// 	} else {
	// 		sql += "WHERE `is_delete` != 1 "
	// 	}
	// }
	sql += "ORDER BY `date` DESC, `id` DESC LIMIT ?, ?"
	log.Info(sql)

	rows, err := db.Query(sql, skipCount, pageSize)
	if err != nil {
		log.Warning("%s", err)
	}
	defer rows.Close()

	// 格式化数据
	threads := make([]*base.Thread, 0)
	for rows.Next() {
		var from string
		var thread base.Thread
		err := rows.Scan(
			&thread.Id,
			&from,
			&thread.Subject,
			&thread.Date,
			&thread.Mids,
			&thread.IsRead)
		if err != nil {
			log.Warning("%s", err)
			continue
		}

		thread.From, err = mail.ParseAddress(from)
		if err != nil {
			log.Warning("%s", err)
			continue
		}

		threads = append(threads, &thread)
	}

	// 查询总的数据量
	var totalCount int
	sql = "SELECT COUNT(*) FROM threads "
	// if isDeleted == "1" {
	// 	sql += "WHERE `is_delete` = 1 "
	// } else {
	// 	if labelId > 0 {
	// 		sql += "WHERE `is_delete` != 1 AND `id` IN (SELECT `mid` FROM `mail_tags` WHERE `tid` = " + strconv.Itoa(labelId) + ")"
	// 	} else {
	// 		sql += "WHERE `is_delete` != 1 "
	// 	}
	// }
	err = db.QueryRow(sql).Scan(&totalCount)
	if err != nil {
		log.Warning("%s", err)
	}
	log.Info("%s, %d, %d, %d\n", sql, totalCount, skipCount, pageSize)

	lpr := base.NewListResponse("true", totalCount, pageNo, pageSize, threads)
	s, _ := json.MarshalIndent(lpr, "", "    ")
	w.Write(s)
}
