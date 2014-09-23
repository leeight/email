package handlers

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"

	"../base"
	"../web"
	"./schema"
)

type messageType struct {
	Id      int       `json:"id"`
	Uidl    int       `json:"uidl"`
	Subject string    `json:"subject"`
	Date    time.Time `json:"date"`
}

type searchResultType struct {
	Took     int  `json:"took"`
	TimedOut bool `json:"timed_out"`
	Shards   struct {
		Total      int `json:"total"`
		Successful int `json:"successful"`
		Failed     int `json:"failed"`
	} `json:"_shards"`
	Hits struct {
		Total    int     `json:"total"`
		MaxScore float64 `json:"max_score"`
		Hits     []struct {
			Index     string      `json:"_index"`
			Type      string      `json:"_type"`
			Id        string      `json:"_id"`
			Score     float64     `json:"_score"`
			Source    messageType `json:"_source"`
			Highlight struct {
				Subject []string `json:"subject"`
			} `json:"highlight"`
		} `json:"hits"`
	} `json:"hits"`
}

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

	// 发起请求
	var searcherUrl = params.BuildSearcherUrl()
	log.Info("%s", searcherUrl)
	resp, err := http.Post(searcherUrl, "", bytes.NewReader(params.BuildSearcherBody()))
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
	var result searchResultType
	json.Unmarshal(body, &result)
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}

	// 准备sql
	var smap = make(map[string]string)
	var ids = make([]string, len(result.Hits.Hits))
	for idx, item := range result.Hits.Hits {
		ids[idx] = item.Id
		smap[item.Id] = item.Highlight.Subject[0]
	}
	sql := params.BuildListSql(ids)
	log.Info(sql)

	emails := make([]*base.EMailViewModel, 0)

	if len(ids) > 0 {
		rows, err := db.Query(sql)
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

			if _, ok := smap[strconv.FormatUint(email.Id, 10)]; ok {
				// smap里面的标题是高亮的
				email.Subject = smap[strconv.FormatUint(email.Id, 10)]
			}
			evm := email.ToViewModel(ctx.GetConfig().DownloadDir(), db)
			emails = append(emails, evm)
		}
	}

	lpr := base.NewListResponse("true", result.Hits.Total, params.PageNo, params.PageSize, emails)
	s, _ := json.MarshalIndent(lpr, "", "    ")
	w.Write(s)
}
