package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"regexp"
	"strings"
	"time"

	"../base"
	"../thread"
	"../web"
)

func readAllMessages(db *sql.DB) []*thread.Message {
	var messages []*thread.Message

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
		"`refs` FROM `mails` WHERE `is_delete` != 1 ORDER BY `date` ASC")
	if err != nil {
		log.Fatal(err)
	}

	msgids := make(map[string]bool)
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
		if _, ok := msgids[msg_id]; ok {
			continue
		}
		if subject == "" || msg_id == "" {
			continue
		}

		if normalizeSubject(subject) == "" {
			// 如果标题里面只有 Re：回复 之类的内容，按照现在的逻辑是无法正确的创建Thread的
			continue
		}

		var references []string
		if refs != "" {
			references = strings.Split(refs, ",")
		}
		messages = append(messages, &thread.Message{
			subject, msg_id, uidl, references,
		})
		msgids[msg_id] = true
	}

	fmt.Printf("Message Count =[%d]\n", len(messages))

	return messages
}

func normalizeSubject(subject string) string {
	re := regexp.MustCompile(`(?i)((Re|Fwd|Fw|回复|答复|转发)(\[[\d+]\])?[:：](\s*)?)*(.*)`)
	ss := re.FindStringSubmatch(subject)
	return ss[5]
}

func addThread(db *sql.DB, subject string, mids []string) (int64, error) {
	// 根据 mids 的内容查询最后一封邮件的内容
	// date, from, is_read
	var date time.Time
	var from string
	var is_read int

	sql := fmt.Sprintf("SELECT `date`, `from`, `is_read` "+
		"FROM `mails` WHERE `uidl` IN (0,%s) ORDER BY `date` DESC LIMIT 1",
		strings.Join(mids, ","))

	err := db.QueryRow(sql).Scan(&date, &from, &is_read)
	if err != nil {
		log.Fatal(err)
		return 0, err
	}

	tx, err := db.Begin()
	if err != nil {
		log.Fatal(err)
		return 0, err
	}

	stmt, err := tx.Prepare("INSERT INTO threads (`from`, `date`, `subject`," +
		"`mids`, `is_read`, `is_delete`, `is_spam`) VALUES (?, ?, ?, ?, ?, 0, 0)")
	if err != nil {
		log.Fatal(err)
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(from, date, subject, strings.Join(mids, ","), is_read)
	if err != nil {
		log.Fatal(err)
		return 0, err
	}

	err = tx.Commit()
	if err != nil {
		log.Fatal(err)
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		log.Fatal(err)
		return 0, err
	}
	log.Printf("%d -> %v\n", id, mids)

	sql = fmt.Sprintf("UPDATE `mails` SET `thread_id` = %d WHERE `uidl` IN (0,%s)",
		id, strings.Join(mids, ","))
	log.Printf("%s", sql)
	_, err = db.Exec(sql)
	if err != nil {
		log.Fatal(err)
		return 0, err
	}

	return id, nil
}

func main() {
	config, err := base.GetConfig("config.yml")
	ctx := web.NewContext(config)
	db := ctx.GetDb()
	defer db.Close()

	messages := readAllMessages(db)
	data, err := json.MarshalIndent(messages, "", "  ")
	if err != nil {
		log.Panic(err)
	}
	ioutil.WriteFile("messages.json", data, 0644)
	return
	// db.Exec("DELETE FROM threads")

	// t := thread.NewThread(messages)
	// roots := t.GetRoots()

	// for subject, container := range t.GroupBySubject(roots) {
	// 	messages := container.FlattenChildren()
	// 	if !container.IsEmpty() {
	// 		newmsg := make([]*thread.Message, len(messages)+1)
	// 		copy(newmsg[1:], messages[0:])
	// 		newmsg[0] = container.GetMessage()
	// 		messages = newmsg
	// 	}

	// 	mids := make([]string, len(messages))
	// 	for idx, msg := range messages {
	// 		mids[idx] = msg.Uidl
	// 	}
	// 	tid, err := addThread(db, subject, mids)
	// 	if err == nil {
	// 		container.ThreadId = tid
	// 	}
	// }
}
