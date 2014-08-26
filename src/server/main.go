package main

import (
	"database/sql"
	"io/ioutil"
	"log"
	"os"
	"path"

	pop3 "github.com/bytbox/go-pop3"
	_ "github.com/mattn/go-sqlite3"

	"./base"
)

func main() {
	config, err := base.GetConfig("config.yml")
	if err != nil {
		log.Panic(err)
	}

	// 开始交互
	var client *pop3.Client
	if config.Pop3.Tls {
		client, err = pop3.DialTLS(config.Pop3.Hostname)
	} else {
		client, err = pop3.Dial(config.Pop3.Hostname)
	}
	if err != nil {
		log.Panic(err)
	}
	defer client.Quit()

	err = client.Auth(config.Pop3.Username, config.Pop3.Password)
	if err != nil {
		log.Panic(err)
	}

	// 打开数据库
	db, err := sql.Open("sqlite3", "./foo.db")
	if err != nil {
		log.Panic(err)
		return
	}
	defer db.Close()

	// 开始拉数据
	msgs, _, err := client.ListAll()
	uidls, err := client.UidlAll()
	for _, msg := range msgs {
		uidl := uidls[msg]

		// 检查是否存在
		stmt, err := db.Prepare("SELECT `id` FROM mails WHERE `uidl` = ?")
		if err != nil {
			log.Fatal(err)
			continue
		}
		defer stmt.Close()

		var id int = -1
		err = stmt.QueryRow(uidl).Scan(&id)
		if err == nil && id > 0 {
			log.Printf("[FOUND] %d -> %s, id = %d\n", msg, uidl, id)
			continue
		}

		raw, err := client.Retr(msg)
		if err != nil {
			log.Fatal(err)
			continue
		}

		ioutil.WriteFile("raw/"+uidl+".txt", []byte(raw), 0644)
		log.Printf("[ SAVE] %d -> raw/%s.txt\n", msg, uidl)

		os.MkdirAll(path.Join(config.Dirs.Download, uidl), 0755)
		email, err := base.NewMail([]byte(raw), path.Join(config.Dirs.Download, uidl))
		if err != nil {
			log.Fatal(err)
			continue
		}

		// 保存到数据库
		email.Uidl = string(uidl)
		err = email.Store(db)
		if err != nil {
			log.Fatal(err)
			continue
		}
		log.Printf("[ SAVE] %d -> %s\n", msg, uidl)
	}
}
