package handlers

import (
	"encoding/json"
	"net/http"

	"../base"
	"../web"
)

type MailLabelsHandler struct {
	Context web.Context
}

func (h MailLabelsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := h.Context
	log := ctx.GetLogger()
	db := ctx.GetDb()
	defer db.Close()

	rows, err := db.Query("SELECT `id`, `name` FROM tags ORDER BY `name`;")
	if err != nil {
		log.Warning("%s", err)
	}

	labels := make([]*base.LabelType, 0)
	for rows.Next() {
		var label base.LabelType
		err = rows.Scan(&label.Id, &label.Name)
		if err != nil {
			log.Warning("%s", err)
			continue
		}
		labels = append(labels, &label)
	}

	// FIXME(user) 性能肯定有问题的呀
	// 计算未读的数据量
	// SELECT COUNT(*) FROM mails WHERE is_read = 0 AND id IN (SELECT mid FROM mail_tags WHERE tid = 5);
	for _, label := range labels {
		sql := "SELECT COUNT(*) FROM mails WHERE is_read = 0 " +
			"AND id IN (SELECT mid FROM mail_tags WHERE tid = ?);"
		err = db.QueryRow(sql, label.Id).Scan(&label.UnreadCount)
		if err != nil {
			log.Warning("%s", err)
		}
	}

	s, _ := json.MarshalIndent(base.NewSimpleResponse("true", labels), "", "    ")
	w.Write(s)
}
