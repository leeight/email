package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
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

// 发送邮件
// 支持from, to, cc, subject, message这5个参数
func apiPostHandler(w http.ResponseWriter, r *http.Request) {
	// 准备参数
	from, err := mail.ParseAddress(r.FormValue("from"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
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
	smtpserver := kConfig.Smtp.Hostname
	tls := kConfig.Smtp.Tls
	auth := base.LoginAuth(kConfig.Smtp.Username, kConfig.Smtp.Password)

	err = base.SendMail(from, to, cc, raw, smtpserver, tls, auth)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	s, _ := json.MarshalIndent(
		base.NewSimpleResponse("true"), "", "    ")
	w.Write(s)
}

// 获取邮件的详情
func apiReadHandler(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", "./foo.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	stmt, err := db.Prepare(
		"SELECT " +
			"`id`, `uidl`, `from`, `to`, `cc`, `bcc`, " +
			"`reply_to`, `subject`, `date`, `message` " +
			"FROM mails " +
			"WHERE `id` = ?")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()

	var email base.EMail
	err = stmt.QueryRow(r.FormValue("id")).Scan(
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
		log.Fatal(err)
	}

	evm := email.ToViewModel(kConfig.Dirs.Download)
	sr := base.NewSimpleResponse("true", evm)
	s, _ := json.MarshalIndent(sr, "", "    ")
	w.Write(s)
}

// 获取所有的Label列表
func apiLabelsHandler(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", "./foo.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	rows, err := db.Query("SELECT `id`, `name` FROM tags;")
	if err != nil {
		log.Fatal(err)
	}

	type Label struct {
		Id   int    `json:"id"`
		Name string `json:"name"`
	}
	labels := make([]Label, 0)
	for rows.Next() {
		var label Label
		err = rows.Scan(&label.Id, &label.Name)
		if err != nil {
			log.Fatal(err)
			continue
		}
		labels = append(labels, label)
	}

	s, _ := json.MarshalIndent(base.NewSimpleResponse("true", labels), "", "    ")
	w.Write(s)
}

// 获取邮件列表
func apiListHandler(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", "./foo.db")
	if err != nil {
		log.Fatal(err)
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
		"`reply_to`, `subject`, `date` " +
		"FROM mails "
	if labelId > 0 {
		sql += "WHERE `id` IN (SELECT `mid` FROM `mail_tags` WHERE `tid` = " + strconv.Itoa(labelId) + ") "
	}
	sql += "ORDER BY `date` DESC, `id` DESC LIMIT ?, ?"
	log.Printf(sql)
	stmt, err := db.Prepare(sql)
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()

	// 开始检索
	rows, err := stmt.Query(skipCount, pageSize)
	if err != nil {
		log.Fatal(err)
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
			&email.Date)

		evm := email.ToViewModel(kConfig.Dirs.Download)
		emails = append(emails, evm)
	}

	// 查询总的数据量
	var totalCount int
	sql = "SELECT COUNT(*) FROM mails "
	if labelId > 0 {
		sql += "WHERE `id` IN (SELECT `mid` FROM `mail_tags` WHERE `tid` = " + strconv.Itoa(labelId) + ")"
	}
	err = db.QueryRow(sql).Scan(&totalCount)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("%s, %d, %d, %d\n", sql, totalCount, skipCount, pageSize)

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
		// w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		// w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token")
		// w.Header().Set("Access-Control-Allow-Credentials", "true")
		fn(w, r)
	}
}

func main() {
	kConfig, _ = base.GetConfig("config.yml")

	// 自定义的API
	http.HandleFunc("/api/", addDefaultHeaders(apiListHandler))
	http.HandleFunc("/api/mail/read", addDefaultHeaders(apiReadHandler))
	http.HandleFunc("/api/mail/post", addDefaultHeaders(apiPostHandler))
	http.HandleFunc("/api/labels", addDefaultHeaders(apiLabelsHandler))

	// 其它请求走静态文件
	http.Handle("/", http.FileServer(http.Dir(kConfig.Dirs.Static)))
	log.Println("Server started http://localhost:8765")
	http.ListenAndServe(":8765", nil)
}
