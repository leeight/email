package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
	"log"
	"net/http"

	"./base"
)

func apiHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	db, err := sql.Open("sqlite3", "./foo.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	rows, err := db.Query("SELECT `id`, `uidl`, `from`, `to`, `cc`, `bcc`, `reply_to`, `subject`, `message` FROM mails LIMIT 10")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	emails := make([]base.EMail, 0)
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
			&email.Message)
		emails = append(emails, email)
	}
	s, _ := json.MarshalIndent(emails, "", "    ")
	w.Write(s)
}

func staticHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hi there, I love %s!", r.URL.Path[1:])
}

func main() {
	http.HandleFunc("/api/", apiHandler)
	http.HandleFunc("/", staticHandler)
	http.ListenAndServe(":8765", nil)
}
