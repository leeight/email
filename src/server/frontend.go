package main

import (
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	_ "github.com/mattn/go-sqlite3"

	"./RFC2047"
	"./base"
	"./net/mail"
)

var (
	// 服务器的配置信息
	kConfig          *base.ServerConfig
	kDefaultPageSize = 15
	kDefaultPageNo   = 1
	log              = base.NewLogger("frontend")
)

func getAddressList(value string) []*mail.Address {
	list := make([]*mail.Address, 0)
	for _, item := range strings.Split(value, "; ") {
		v, err := mail.ParseAddress(item)
		if err == nil {
			list = append(list, v)
		}
	}
	return list
}

func apiMarkAsReadHandler(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", kConfig.DbPath())
	if err != nil {
		log.Warning("%s", err)
	}
	defer db.Close()

	sql := "UPDATE mails SET `is_read` = 1 WHERE `id` IN (" + r.FormValue("ids") + ")"

	log.Info(sql)
	_, err = db.Exec(sql)
	if err != nil {
		log.Warning("%s", err)
	}

	s, _ := json.MarshalIndent(
		base.NewSimpleResponse("true"), "", "    ")
	w.Write(s)
}

func apiDeleteHandler(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", kConfig.DbPath())
	if err != nil {
		log.Warning("%s", err)
	}
	defer db.Close()

	sql := "UPDATE mails SET `is_delete` = 1 WHERE `id` IN (" + r.FormValue("ids") + ")"

	log.Info(sql)
	_, err = db.Exec(sql)
	if err != nil {
		log.Warning("%s", err)
	}

	s, _ := json.MarshalIndent(
		base.NewSimpleResponse("true"), "", "    ")
	w.Write(s)
}

// 发送邮件
// 支持from, to, cc, subject, message这5个参数
func apiPostHandler(w http.ResponseWriter, r *http.Request) {
	// 准备参数
	from, err := mail.ParseAddress(RFC2047.Encode(kConfig.Frontend.Name) +
		" <" + kConfig.Frontend.From + ">")
	if err != nil || from == nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	to := getAddressList(r.FormValue("to"))
	cc := getAddressList(r.FormValue("cc"))

	subject := r.FormValue("subject")
	message := r.FormValue("message")

	// 准备Header
	header := make(map[string]string)
	header["From"] = from.String()
	header["To"] = base.AddressToString(to)
	header["Cc"] = base.AddressToString(cc)
	header["Subject"] = RFC2047.Encode(subject)

	// 要发送的原始数据
	raw := base.EnvelopeMail(header, []byte(message))
	fmt.Println(string(raw))

	// 开始发送邮件
	smtpserver := kConfig.Smtp.GetHostName()
	tls := kConfig.Smtp.Tls
	auth := base.LoginAuth(kConfig.Smtp.Username, kConfig.Smtp.Password)

	err = base.SendMail(from, to, cc, raw, smtpserver, tls, auth)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	s, _ := json.MarshalIndent(
		base.NewSimpleResponse("true"), "", "    ")
	w.Write(s)
}

// 获取邮件的详情
func apiReadHandler(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", kConfig.DbPath())
	if err != nil {
		log.Warning("%s", err)
	}
	defer db.Close()

	sql := "SELECT " +
		"`id`, `uidl`, `from`, `to`, `cc`, `bcc`, " +
		"`reply_to`, `subject`, `date`, `message` " +
		"FROM mails " +
		"WHERE `id` = ?"

	var email base.EMail
	err = db.QueryRow(sql, r.FormValue("id")).Scan(
		&email.Id,
		&email.Uidl,
		&email.From,
		&email.To,
		&email.Cc,
		&email.Bcc,
		&email.ReplyTo,
		&email.Subject,
		&email.Date,
		&email.Message)

	if err != nil {
		log.Warning("%s", err)
	}

	_, err = db.Exec("UPDATE mails SET `is_read` = 1 WHERE `id` = ?", r.FormValue("id"))
	if err != nil {
		log.Warning("%s", err)
	}

	evm := email.ToViewModel(kConfig.DownloadDir(), db)
	sr := base.NewSimpleResponse("true", evm)
	s, _ := json.MarshalIndent(sr, "", "    ")
	w.Write(s)
}

// 获取所有的Label列表
func apiLabelsHandler(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", kConfig.DbPath())
	if err != nil {
		log.Warning("%s", err)
	}
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

// 获取邮件列表
func apiListHandler(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", kConfig.DbPath())
	if err != nil {
		log.Warning("%s", err)
	}
	defer db.Close()

	// 解析url参数
	pageSize, err := strconv.Atoi(r.PostFormValue("pageSize"))
	if err != nil {
		pageSize = kDefaultPageSize
	}

	pageNo, err := strconv.Atoi(r.PostFormValue("pageNo"))
	if err != nil {
		pageNo = kDefaultPageNo
	}

	labelId, err := strconv.Atoi(r.PostFormValue("label"))
	if err != nil {
		labelId = -1
	}

	skipCount := (pageNo - 1) * pageSize
	if skipCount < 0 {
		skipCount = 0
	}

	// 准备sql
	sql := "SELECT " +
		"`id`, `uidl`, `from`, `to`, `cc`, `bcc`, " +
		"`reply_to`, `subject`, `date`, `is_read` " +
		"FROM mails "
	if labelId > 0 {
		sql += "WHERE `is_delete` != 1 AND `id` IN (SELECT `mid` FROM `mail_tags` WHERE `tid` = " + strconv.Itoa(labelId) + ") "
	} else {
		sql += "WHERE `is_delete` != 1 "
	}
	sql += "ORDER BY `date` DESC, `id` DESC LIMIT ?, ?"
	log.Info(sql)
	stmt, err := db.Prepare(sql)
	if err != nil {
		log.Warning("%s", err)
	}
	defer stmt.Close()

	// 开始检索
	rows, err := stmt.Query(skipCount, pageSize)
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

		evm := email.ToViewModel(kConfig.DownloadDir(), db)
		emails = append(emails, evm)
	}

	// 查询总的数据量
	var totalCount int
	sql = "SELECT COUNT(*) FROM mails "
	if labelId > 0 {
		sql += "WHERE `is_delete` != 1 AND `id` IN (SELECT `mid` FROM `mail_tags` WHERE `tid` = " + strconv.Itoa(labelId) + ")"
	} else {
		sql += "WHERE `is_delete` != 1 "
	}
	err = db.QueryRow(sql).Scan(&totalCount)
	if err != nil {
		log.Warning("%s", err)
	}
	log.Info("%s, %d, %d, %d\n", sql, totalCount, skipCount, pageSize)

	lpr := base.NewListResponse("true", totalCount, pageNo, pageSize, emails)
	s, _ := json.MarshalIndent(lpr, "", "    ")
	w.Write(s)
}

func addDefaultHeaders(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// if origin := r.Header.Get("Origin"); origin != "" {
		// 	w.Header().Set("Access-Control-Allow-Origin", origin)
		// }
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		// w.Header().Set("X-From", RFC2047.Encode(kConfig.Frontend.Name)+"<"+kConfig.Frontend.From+">")
		// w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		// w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token")
		// w.Header().Set("Access-Control-Allow-Credentials", "true")
		fn(w, r)
	}
}

func main() {
	configPtr := flag.String("config", "config.yml", "The config file path")
	flag.Parse()

	var err error
	kConfig, err = base.GetConfig(*configPtr)
	if err != nil {
		log.Warning("%s", err)
		fmt.Fprintf(os.Stderr, "Usage of %s:\n", os.Args[0])
		flag.PrintDefaults()
		return
	}

	// 自定义的API
	http.HandleFunc("/api/", addDefaultHeaders(apiListHandler))
	http.HandleFunc("/api/mail/read", addDefaultHeaders(apiReadHandler))
	http.HandleFunc("/api/mail/post", addDefaultHeaders(apiPostHandler))
	http.HandleFunc("/api/mail/mark_as_read", addDefaultHeaders(apiMarkAsReadHandler))
	http.HandleFunc("/api/mail/delete", addDefaultHeaders(apiDeleteHandler))
	http.HandleFunc("/api/labels", addDefaultHeaders(apiLabelsHandler))

	// 其它请求走静态文件
	http.Handle("/", http.FileServer(http.Dir(kConfig.Dirs.Base)))
	log.Info("Server started http://localhost:" + strconv.Itoa(kConfig.Http.Port))
	http.ListenAndServe(":"+strconv.Itoa(kConfig.Http.Port), nil)
}
