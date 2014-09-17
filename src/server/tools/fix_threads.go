package main

import (
	"database/sql"
	"encoding/json"
	"io/ioutil"
	"log"
	"strings"
	"time"

	"../base"
	"../thread"
)

func readAllMessages(db *sql.DB) []*thread.Message {
	messages := make([]*thread.Message, 0)

	// 忽略某些特定标签的邮件
	mids := make(map[string]bool)
	sql := "SELECT `mid` FROM `mail_tags` WHERE `tid` IN (SELECT `id` FROM `tags` WHERE `name` IN (?,?))"
	rows, err := db.Query(sql, "Spam", "监控邮件")
	if err != nil {
		log.Fatal(err)
	}
	for rows.Next() {
		var mid string
		err = rows.Scan(&mid)
		if err != nil {
			log.Fatal(err)
		}
		mids[mid] = true
	}
	log.Printf("%d", len(mids))

	rows, err = db.Query("SELECT `id`, `subject`, `msg_id`, `uidl`, " +
		"`refs` FROM `mails` WHERE `is_delete` != 1")
	if err != nil {
		log.Fatal(err)
	}

	for rows.Next() {
		var mid string
		var subject string
		var msg_id string
		var uidl string
		var refs string

		err = rows.Scan(&mid, &subject, &msg_id, &uidl, &refs)
		if err != nil {
			log.Fatal(err)
		}
		if _, ok := mids[mid]; ok {
			continue
		}

		references := make([]string, 0)
		if refs != "" {
			references = strings.Split(refs, ",")
		}
		messages = append(messages, &thread.Message{
			subject, msg_id, uidl, references,
		})
	}

	return messages
}

func addThread(db *sql.DB, subject string, mids []string) error {
	// 根据 mids 的内容查询最后一封邮件的内容
	// date, from, is_read
	var date time.Time
	var from string
	var is_read int
	err := db.QueryRow("SELECT `date`, `from`, `is_read` FROM `mails` WHERE `uidl` = ?",
		mids[len(mids)-1]).Scan(&date, &from, &is_read)
	if err != nil {
		log.Fatal(err)
		return err
	}

	tx, err := db.Begin()
	if err != nil {
		log.Fatal(err)
		return err
	}

	stmt, err := tx.Prepare("INSERT INTO threads (`from`, `date`, `subject`," +
		"`mids`, `is_read`, `is_delete`, `is_spam`) VALUES (?, ?, ?, ?, ?, 0, 0)")
	if err != nil {
		log.Fatal(err)
		return err
	}
	defer stmt.Close()

	result, err := stmt.Exec(from, date, subject, strings.Join(mids, ","), is_read)
	if err != nil {
		log.Fatal(err)
		return err
	}

	err = tx.Commit()
	if err != nil {
		log.Fatal(err)
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		log.Fatal(err)
		return err
	}
	log.Printf("%d -> %v\n", id, mids)

	return nil
}

func main() {
	config, err := base.GetConfig("config.yml")

	db, err := sql.Open("sqlite3", config.DbPath())
	if err != nil {
		log.Panic(err)
		return
	}
	defer db.Close()

	messages := readAllMessages(db)
	data, err := json.MarshalIndent(messages, "", "  ")
	if err != nil {
		log.Panic(err)
	}
	ioutil.WriteFile("messages.json", data, 0644)
	// return
	db.Exec("DELETE FROM threads")

	t := thread.NewThread(messages)
	roots := t.GetRoots()

	for subject, container := range t.GroupBySubject(roots) {
		messages := container.FlattenChildren()
		if !container.IsEmpty() {
			newmsg := make([]*thread.Message, len(messages)+1)
			copy(newmsg[1:], messages[0:])
			newmsg[0] = container.GetMessage()
			messages = newmsg
		}

		mids := make([]string, len(messages))
		for idx, msg := range messages {
			mids[idx] = msg.Uidl
		}
		addThread(db, subject, mids)
	}
}
