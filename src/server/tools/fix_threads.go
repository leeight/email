package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"path"
	"regexp"
	"strings"
	"time"

	"../RFC2047"
	"../base"
	"../net/mail"
	"../thread"
)

const (
	kRawDir = "../../data/baidu.com/liyubei/raw"
)

func getDeletedMails() map[string]bool {
	raw, err := ioutil.ReadFile("deleted_mails.json")
	if err != nil {
		log.Fatal(err)
	}

	var deletedMails []string
	err = json.Unmarshal(raw, &deletedMails)
	if err != nil {
		log.Fatal(err)
	}

	m := make(map[string]bool)
	for _, uidl := range deletedMails {
		m[uidl] = true
	}

	return m
}

// 扫描目录，解析邮件，得到相应的信息
func getAllMessages() []*thread.Message {
	fi, err := ioutil.ReadDir(kRawDir)
	if err != nil {
		log.Fatal(err)
	}

	deletedMails := getDeletedMails()

	re := regexp.MustCompile("[<>]")
	messages := make([]*thread.Message, 0)
	for _, file := range fi {
		if file.IsDir() {
			continue
		}

		raw, err := ioutil.ReadFile(path.Join(kRawDir, file.Name()))
		if err != nil {
			log.Fatal(err)
		}

		msg, err := mail.ReadMessage(bytes.NewBuffer(raw))
		if err != nil {
			log.Fatal(err)
		}

		// 从邮件中开始解析所需要的数据
		id := re.ReplaceAllString(msg.Header.Get("Message-ID"), "")
		if id == "" {
			continue
		}

		references := make([]string, 0)
		for _, ref := range regexp.MustCompile(`\s+`).Split(msg.Header.Get("References"), -1) {
			ref = re.ReplaceAllString(ref, "")
			if ref != "" {
				references = append(references, ref)
			}
		}

		// If both headers exist, take the first thing in the In-Reply-To header
		// that looks like a Message-ID, and append it to the References header.
		ss := regexp.MustCompile("<([^<>]+)>").FindStringSubmatch(msg.Header.Get("In-Reply-To"))
		if len(ss) > 0 {
			references = append(references, ss[1])
		}

		subject := RFC2047.Decode(msg.Header.Get("Subject"))

		uidl := strings.Replace(file.Name(), ".txt", "", -1)

		if _, ok := deletedMails[uidl]; ok {
			continue
		}

		messages = append(messages, &thread.Message{subject, id, uidl, references})
		fmt.Printf("%s\n", file.Name())
	}

	s, _ := json.MarshalIndent(messages, "", "    ")
	ioutil.WriteFile("messages.json", s, 0644)

	return messages
}

func readAllMessages() []*thread.Message {
	raw, err := ioutil.ReadFile("messages.json")
	if err != nil {
		log.Fatal(err)
	}

	var messages []*thread.Message
	err = json.Unmarshal(raw, &messages)
	if err != nil {
		log.Fatal(err)
	}

	return messages
}

func addThread(db *sql.DB, subject string, mids []string) error {
	// 根据 mids 的内容查询最后一封邮件的内容
	// date, from
	var date time.Time
	var from string
	err := db.QueryRow("SELECT `date`, `from` FROM `mails` WHERE `uidl` = ?",
		mids[len(mids)-1]).Scan(&date, &from)
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
		"`mids`, `is_read`, `is_delete`, `is_spam`) VALUES (?, ?, ?, ?, 1, 0, 0)")
	if err != nil {
		log.Fatal(err)
		return err
	}
	defer stmt.Close()

	result, err := stmt.Exec(from, date, subject, strings.Join(mids, ","))
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

	db.Exec("DELETE FROM threads")

	messages := readAllMessages()
	// messages := getAllMessages()

	t := thread.NewThread(messages)
	roots := t.GetRoots()

	for subject, container := range t.GroupBySubject(roots) {
		messages := container.FlattenChildren()
		// if len(messages) > 0 {
		if !container.IsEmpty() {
			newmsg := make([]*thread.Message, len(messages)+1)
			copy(newmsg[1:], messages[0:])
			newmsg[0] = container.GetMessage()
			messages = newmsg
		}

		mids := make([]string, len(messages))
		// fmt.Printf("%s\n", subject)
		for idx, msg := range messages {
			mids[idx] = msg.Uidl
			// fmt.Printf("    %s => %s\n", msg.Uidl, msg.Subject)
		}
		addThread(db, subject, mids)
		// }
	}
}
