package main

import (
	"database/sql"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"

	pop3 "github.com/bytbox/go-pop3"
	_ "github.com/mattn/go-sqlite3"

	"./base"
)

var (
	kDownloadDir = "downloads"
)

func Usage() {
	fmt.Fprintf(os.Stderr, "Usage of %s:\n", os.Args[0])
	flag.PrintDefaults()
}

func main() {
	// 参数解析
	username := flag.String("username", "", "The username")
	password := flag.String("password", "", "The password")

	flag.Parse()

	log.Printf("username = %s, password = %s",
		*username, *password)

	if *username == "" || *password == "" {
		Usage()
		return
	}

	// 开始交互
	client, err := pop3.DialTLS("email.baidu.com:995")
	if err != nil {
		panic(err)
	}
	defer client.Quit()

	err = client.Auth(*username, *password)
	if err != nil {
		panic(err)
	}

	// 打开数据库
	db, err := sql.Open("sqlite3", "./foo.db")
	if err != nil {
		log.Fatal(err)
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

		email, err := base.CreateMail([]byte(raw), kDownloadDir)
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
