package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"../base"
	"../web"
)

type ContactsListHandler struct {
	Context web.Context
}

func (h ContactsListHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := h.Context
	log := ctx.GetLogger()
	db := ctx.GetDb()
	defer db.Close()

	// TODO(user) 重复的代码 mail_list.go
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

	keyword := r.PostFormValue("keyword")

	skipCount := (pageNo - 1) * pageSize
	if skipCount < 0 {
		skipCount = 0
	}

	// 准备sql
	sql := "SELECT " +
		"`id`, `name`, `email`, `count` " +
		"FROM contacts "
	if keyword != "" {
		sql += "WHERE `email` LIKE \"" + keyword + "%\" "
	}
	sql += "ORDER BY `count` DESC LIMIT ?, ?"
	log.Info(sql)

	rows, err := db.Query(sql, skipCount, pageSize)
	if err != nil {
		log.Warning("%v", err)
	}
	defer rows.Close()

	var contacts []*base.Contact
	for rows.Next() {
		var c base.Contact
		rows.Scan(&c.Id, &c.Name, &c.EMail, &c.Count)
		contacts = append(contacts, &c)
	}

	var totalCount int
	sql = "SELECT COUNT(*) FROM contacts "
	if keyword != "" {
		sql += "WHERE `email` LIKE \"" + keyword + "%\" "
	}
	err = db.QueryRow(sql).Scan(&totalCount)
	if err != nil {
		log.Warning("%s", err)
	}
	log.Info("%s, %d, %d, %d\n", sql, totalCount, skipCount, pageSize)

	lpr := base.NewListResponse("true", totalCount, pageNo, pageSize, contacts)
	s, _ := json.MarshalIndent(lpr, "", "    ")
	w.Write(s)
}

//
