package handlers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"

	"../base"
	"../web"
)

type MailSearchHandler struct {
	Context web.Context
}

func (h MailSearchHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := h.Context
	log := ctx.GetLogger()
	config := ctx.GetConfig()
	db := ctx.GetDb()
	defer db.Close()

	query := r.PostFormValue("keyword")
	// query := r.URL.Query().Get("query")
	if query == "" {
		http.Error(w, "Invalid request.", http.StatusBadRequest)
		return
	}

	// 构造请求地址
	searcherUrl := fmt.Sprintf("http://localhost:%d/json?query=%s",
		config.Service.Searcher.Port,
		url.QueryEscape(query))

	// 发起请求
	resp, err := http.Get(searcherUrl)
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}

	// 调用接口
	rpcresp := base.SearcherJsonRPCResponse{}
	err = json.Unmarshal(body, &rpcresp)
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}

	// 准备sql
	sql := fmt.Sprintf("SELECT "+
		"`id`, `uidl`, `from`, `to`, `cc`, `bcc`, "+
		"`reply_to`, `subject`, `date`, `is_read` "+
		"FROM mails WHERE `is_delete` != 1 AND `id` IN (%s)", strings.Join(rpcresp.Ids, ","))
	log.Info(sql)

	rows, err := db.Query(sql)
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

		// 标题高亮
		for _, t := range rpcresp.Tokens {
			evm.Subject = strings.Replace(evm.Subject, t, "<strong>"+t+"</strong>", -1)
		}

		emails = append(emails, evm)
	}

	lpr := base.NewListResponse("true", len(emails), 1, len(emails), emails)
	s, _ := json.MarshalIndent(lpr, "", "    ")
	w.Write(s)
}
