package main

import (
	"database/sql"
	"encoding/json"
	_ "github.com/mattn/go-sqlite3"
	"log"
	"net/http"
	"time"

	"./base"
	"./net/mail"
)

// ER所需要的数据格式
type ListResponse struct {
	Success string `json:"success"`
	Page    struct {
		TotalCount int              `json:"totalCount"`
		PageNo     int              `json:"pageNo"`
		PageSize   int              `json:"pageSize"`
		OrderBy    string           `json:"orderBy"`
		Order      string           `json:"order"`
		Result     []EMailViewModel `json:"result"`
	} `json:"page"`
}

type SimpleResponse struct {
	Success string            `json:"success"`
	Message map[string]string `json:"message"`
	Result  EMailViewModel    `json:"result"`
}

// 定义邮件类型，View Model
type EMailViewModel struct {
	Id      int             `json:"id"`
	Uidl    string          `json:"uidl"`
	From    *mail.Address   `json:"from"`
	To      []*mail.Address `json:"to"`
	Cc      []*mail.Address `json:"cc"`
	Bcc     []*mail.Address `json:"bcc"`
	ReplyTo []*mail.Address `json:"reply_to"`
	Date    time.Time       `json:"date"`
	Subject string          `json:"subject"`
	Message string          `json:"message"`
	Status  int             `json:"status"`
}

func createListPageResponse(r []EMailViewModel) ListResponse {
	var res ListResponse
	res.Success = "true"
	res.Page.TotalCount = 100
	res.Page.PageNo = 1
	res.Page.PageSize = 10
	res.Page.OrderBy = "id"
	res.Page.Order = "desc"
	res.Page.Result = r
	return res
}

func createSimpleResponse(r EMailViewModel) SimpleResponse {
	var res SimpleResponse
	res.Success = "true"
	res.Result = r
	return res
}

func createViewModel(e *base.EMail) EMailViewModel {
	var evm EMailViewModel
	evm.Id = e.Id
	evm.Uidl = e.Uidl
	evm.Date = e.Date
	evm.Subject = e.Subject
	evm.Status = e.Status
	evm.Message = e.Message
	evm.From, _ = mail.ParseAddress(e.From)
	evm.To, _ = mail.ParseAddressList(e.To)
	evm.Cc, _ = mail.ParseAddressList(e.Cc)
	evm.Bcc, _ = mail.ParseAddressList(e.Bcc)
	evm.ReplyTo, _ = mail.ParseAddressList(e.ReplyTo)
	return evm
}

// 获取邮件的详情
func apiReadHandler(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", "./foo.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	stmt, err := db.Prepare("SELECT `id`, `uidl`, `from`, `to`, `cc`, `bcc`, `reply_to`, `subject`, `date`, `message` FROM mails WHERE `id` = ?")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()

	var email base.EMail
	err = stmt.QueryRow(r.PostFormValue("id")).Scan(
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

	s, _ := json.MarshalIndent(createSimpleResponse(createViewModel(&email)), "", "    ")
	w.Write(s)
}

// 获取邮件列表
func apiListHandler(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", "./foo.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	rows, err := db.Query("SELECT `id`, `uidl`, `from`, `to`, `cc`, `bcc`, `reply_to`, `subject`, `date` FROM mails ORDER BY `id` DESC LIMIT 10")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	emails := make([]EMailViewModel, 0)
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
		emails = append(emails, createViewModel(&email))
	}
	s, _ := json.MarshalIndent(createListPageResponse(emails), "", "    ")
	w.Write(s)
}

func addDefaultHeaders(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if origin := r.Header.Get("Origin"); origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		fn(w, r)
	}
}

func main() {
	// 自定义的API
	http.HandleFunc("/api/", addDefaultHeaders(apiListHandler))
	http.HandleFunc("/api/mail/read", addDefaultHeaders(apiReadHandler))

	// 其它请求走静态文件
	http.Handle("/", http.FileServer(http.Dir("/Users/leeight/hd/local/leeight.github.com/email-client")))
	http.ListenAndServe(":8765", nil)
}
