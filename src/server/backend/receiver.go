package backend

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"path"
	"time"

	pop3 "github.com/bytbox/go-pop3"

	"../base"
	"../web"
)

func ReceiveRecentMails(ctx web.Context) func(time.Time) {
	return func(t time.Time) {
		config := ctx.GetConfig()
		log := ctx.GetLogger()

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
		db := ctx.GetMysqlDb()
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
		for msgid, msg := range msgs {
			uidl := uidls[msg]

			// 检查是否存在
			var id int64 = -1
			var date time.Time
			err := db.QueryRow("SELECT `id`, `date` FROM mails WHERE `uidl` = ?", uidl).Scan(&id, &date)
			if err != nil && err != sql.ErrNoRows {
				log.Warning("%s", err)
				continue
			} else if err == nil && id > 0 {
				// 如果存在记录，检查是否可以从服务器中删除了
				if config.Pop3.Delete_older_mails > 0 &&
					time.Since(date).Hours() > float64(24*config.Pop3.Delete_older_mails) {
					// 判断 date 和 当前的日期差别，如果大于 config.Pop3.Delete_older_mails 的配置
					// 说明可以删除
					log.Info("[ DELETE] %d -> %s (%f)\n", msgid, uidl, time.Since(date).Hours())
					client.Dele(msgid)
				}
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

			email, err := base.SaveMail([]byte(raw), string(uidl), config)
			if err != nil {
				log.Warning("%s", err)
				continue
			}

			// 保存到数据库
			email.Uidl = string(uidl)
			email.IsSent = 0
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

			if email.IsDelete != 1 {
				indexerChannel <- email
				threadChannel <- email
			}
		}

		fmt.Println()
	}
}
