package main

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path"
	"time"

	pop3 "github.com/bytbox/go-pop3"
	_ "github.com/mattn/go-sqlite3"

	"./base"
)

func receiveMail(config *base.ServerConfig) func(time.Time) {
	return func(t time.Time) {
		log.Println("Receiving Mails...")

		// 登录
		var client *pop3.Client
		var err error
		if config.Pop3.Tls {
			client, err = pop3.DialTLS(config.Pop3.Hostname)
		} else {
			client, err = pop3.Dial(config.Pop3.Hostname)
		}
		if err != nil {
			log.Fatal(err)
			return
		}
		defer client.Quit()

		err = client.Auth(config.Pop3.Username, config.Pop3.Password)
		if err != nil {
			log.Fatal(err)
			return
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
		if err != nil {
			log.Fatal(err)
			return
		}

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
				// log.Printf("[FOUND] %d -> %s, id = %d\n", msg, uidl, id)
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

		fmt.Println()
	}
}

func setInterval(
	f func(time.Time),
	d time.Duration) {
	for x := range time.Tick(d) {
		f(x)
	}
}

func main() {
	config, err := base.GetConfig("config.yml")
	if err != nil {
		log.Panic(err)
	}

	// 先执行一次
	receiveMail(config)(time.Now())

	// 定时器启动
	interval := config.Pop3.GetInterval()
	setInterval(receiveMail(config), interval*time.Second)
}
