package main

import (
	"database/sql"
	"flag"
	"fmt"
	"io/ioutil"
	// "log"
	"os"
	"path"
	"time"

	pop3 "github.com/bytbox/go-pop3"
	_ "github.com/mattn/go-sqlite3"

	"./base"
)

var log = base.NewLogger("main")

func receiveMail(config *base.ServerConfig) func(time.Time) {
	return func(t time.Time) {
		log.Info("Receiving Mails...")

		// 登录
		var client *pop3.Client
		var err error
		if config.Pop3.Tls {
			client, err = pop3.DialTLS(config.Pop3.GetHostName())
		} else {
			client, err = pop3.Dial(config.Pop3.GetHostName())
		}
		if err != nil {
			log.Warning("%s", err)
			return
		}
		defer client.Quit()

		err = client.Auth(config.Pop3.Username, config.Pop3.Password)
		if err != nil {
			log.Warning("%s", err)
			return
		}

		// 打开数据库
		db, err := sql.Open("sqlite3", config.DbPath())
		if err != nil {
			log.Warning("%s", err)
			return
		}
		defer db.Close()

		// 开始拉数据
		msgs, _, err := client.ListAll()
		if err != nil {
			log.Warning("%s", err)
			return
		}

		filters, err := base.GetFilters("filters.yml")
		if err != nil {
			log.Warning("%s", err)
		}

		uidls, err := client.UidlAll()
		for _, msg := range msgs {
			uidl := uidls[msg]

			// 检查是否存在
			var id int64 = -1
			err := db.QueryRow("SELECT `id` FROM mails WHERE `uidl` = ?", uidl).Scan(&id)
			if err != nil && err != sql.ErrNoRows {
				log.Warning("%s", err)
				continue
			} else if err == nil && id > 0 {
				continue
			}

			raw, err := client.Retr(msg)
			if err != nil {
				log.Warning("%s", err)
				continue
			}

			ioutil.WriteFile(path.Join(config.RawDir(), uidl+".txt"),
				[]byte(raw), 0644)
			log.Info("[ SAVE] %d -> %s/%s.txt\n", msg, config.RawDir(), uidl)

			downloadDir := path.Join(config.DownloadDir(), uidl)
			prefix := path.Join(path.Base(config.DownloadDir()), uidl)
			os.MkdirAll(downloadDir, 0755)
			email, err := base.NewMail([]byte(raw), downloadDir, prefix)
			if err != nil {
				log.Warning("%s", err)
				continue
			}

			// 保存到数据库
			email.Uidl = string(uidl)
			email.Id, err = email.Store(db)
			if err != nil {
				log.Warning("%s", err)
				continue
			}

			if filters != nil {
				err = base.RunFilter(email, filters[:], config.RawDir(), db)
				if err != nil {
					log.Warning("%s", err)
				}
			}

			log.Info("[ SAVE] %d -> %s\n", msg, uidl)
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
	configPtr := flag.String("config", "config.yml", "The config file path")
	flag.Parse()

	config, err := base.GetConfig(*configPtr)
	if err != nil {
		log.Fatal(err)
		fmt.Fprintf(os.Stderr, "Usage of %s:\n", os.Args[0])
		flag.PrintDefaults()
		return
	}

	// 检查数据库文件是否存在
	if _, err := os.Stat(config.DbPath()); os.IsNotExist(err) {
		// 不存在，初始化数据库
		db, err := sql.Open("sqlite3", config.DbPath())
		if err != nil {
			log.Fatal(err)
			return
		}
		db.Exec(`
		DROP TABLE IF EXISTS 'mails';
    DROP TABLE IF EXISTS tags;
    DROP TABLE IF EXISTS mail_tags;

		CREATE TABLE mails (
		  'id' INTEGER NOT NULL PRIMARY KEY,  -- 自增的Id
		  'uidl' VARCHAR(512),                -- 服务器端的Id
		  'from' VARCHAR(1024),               -- 发件人
		  'to' VARCHAR(1024),                 -- 收件人
		  'cc' VARCHAR(1024),                 -- CC的人
		  'bcc' VARCHAR(1024),                -- BCC的人
		  'reply_to' VARCHAR(1024),           -- 邮件回复的人
		  'date' DATETIME,                    -- 发送的日期
		  'subject' VARCHAR(1024),            -- 邮件的标题
		  'message' text,                     -- 邮件的征文，已经解析过了
		  'status' INTEGER,                   -- 邮件的状态（程序里面去判断）
		  'is_read' INTEGER,									-- 是否已经读过了
		  'is_delete' INTEGER,								-- 是否已经删除
		);
    CREATE TABLE tags (
      id INTEGER NOT NULL PRIMARY KEY,
      name VARCHAR(512)
    );
    CREATE TABLE mail_tags (
      id INTEGER NOT NULL PRIMARY KEY,
      mid INTEGER,
      tid INTEGER
    );`)
		db.Close()
	}

	// 先执行一次
	receiveMail(config)(time.Now())

	// 定时器启动
	interval := config.Pop3.GetInterval()
	setInterval(receiveMail(config), interval*time.Second)
}
