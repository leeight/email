package main

// 对所有的文件执行一次过滤器
// 过滤器的配置来自filters.yml
// 执行之前会清空 tags 和 mail_tags 的内容
// 类似 rebuild_index 做的事情一样

import (
	"database/sql"
	"log"

	"./base"
)

func getTmpDB() *sql.DB {
	db, err := sql.Open("sqlite3", "tmp.db")
	if err != nil {
		log.Fatal(err)
		return nil
	}
	db.Exec(`
    DROP TABLE IF EXISTS tags;
    DROP TABLE IF EXISTS mail_tags;
    CREATE TABLE tags (
      id INTEGER NOT NULL PRIMARY KEY,
      name VARCHAR(512)
    );
    CREATE TABLE mail_tags (
      id INTEGER NOT NULL PRIMARY KEY,
      mid INTEGER,
      tid INTEGER
    );
  `)

	return db
}

func main() {
	config, err := base.GetConfig("config.yml")
	if err != nil {
		log.Panic(err)
	}

	filters, err := base.GetFilters("filters.yml")
	if err != nil {
		log.Panic(err)
	}

	db, err := sql.Open("sqlite3", "./foo.db")
	if err != nil {
		log.Panic(err)
		return
	}
	defer db.Close()

	// 清空数据
	db.Exec(`DELETE FROM tags; DELETE FROM mail_tags;`)

	sql := "SELECT " +
		"`id`, `uidl`, `from`, `to`, `cc`, `bcc`, " +
		"`reply_to`, `subject`, `date`, `message` " +
		"FROM mails;"

	rows, err := db.Query(sql)
	if err != nil {
		log.Panic(err)
	}

	// FIXME(user) 如果继续用db的话，存在database is locked的问题
	tmpdb := getTmpDB()

	rawDir := config.Dirs.Raw
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
			&email.Date,
			&email.Message)

		err = base.RunFilter(&email, filters[:], rawDir, tmpdb)
		if err != nil {
			log.Fatal(err)
		}
	}

	// 最后通过执行attach来迁移数据
	// sqlite3 foo.db
	// > attach "tmp.db" as tmp; delete from tags; delete from mail_tags;
	// > insert into tags select * from tmp.tags; insert into mail_tags select * from tmp.mail_tags;
}
