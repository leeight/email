package main

import (
	"database/sql"
	"flag"
	"fmt"
	"io/ioutil"
	"net/http"
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

			go addToIndexer(email.Id, config)
		}

		fmt.Println()
	}
}

func addToIndexer(id uint64, config *base.ServerConfig) {
	// 构造请求地址
	searcherUrl := fmt.Sprintf("http://localhost:%d/add_document?id=%d",
		config.Service.Searcher.Port, id)

	// 发起请求
	resp, err := http.Get(searcherUrl)
	if err != nil {
		log.Warning("%s", err.Error())
		return
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Warning("%s", err.Error())
		return
	}

	if string(body) != `{"success":true}` {
		log.Warning("%s", string(body))
		return
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
	initsqlPtr := flag.String("initsql", "", "The init sql file path")
	flag.Parse()

	config, err := base.GetConfig(*configPtr)
	if err != nil {
		log.Fatal(err)
		fmt.Fprintf(os.Stderr, "Usage of %s:\n", os.Args[0])
		flag.PrintDefaults()
		return
	}

	// 检查数据库文件是否存在
	if _, err = os.Stat(config.DbPath()); err != nil {
		log.Info("Initializing database")

		// 不存在，初始化数据库
		db, err := sql.Open("sqlite3", config.DbPath())
		if err != nil {
			log.Fatal(err)
			return
		}

		// 定位初始化的sql文件
		sqlFile := *initsqlPtr
		if sqlFile == "" {
			sqlFile = path.Join(config.Dirs.Base, "../../../src/server/init.sql")
		}
		if _, err = os.Stat(sqlFile); err != nil {
			log.Warning("Can't find init sql file, please specify it with -initsql argument.")
			return
		}

		// 开始初始化数据
		sqlContent, err := ioutil.ReadFile(sqlFile)
		if err != nil {
			log.Warning(err.Error())
			return
		}

		db.Exec(string(sqlContent))
		db.Close()
	}

	// 先执行一次
	receiveMail(config)(time.Now())

	// 定时器启动
	interval := config.Pop3.GetInterval()
	setInterval(receiveMail(config), interval*time.Second)
}
