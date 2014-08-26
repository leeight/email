package main

import (
	"database/sql"
	"io/ioutil"
	"log"
	"os"
	"path"
	"strings"

	_ "github.com/mattn/go-sqlite3"

	"./base"
)

// 读取raw目录里面的原始信息，开始重建索引数据
// 1. sqlite的数据会被清空，重写
// 2. 附件的内容会被重新生成
func main() {
	config, err := base.GetConfig("config.yml")
	if err != nil {
		log.Panic(err)
	}

	fileInfos, err := ioutil.ReadDir("raw")
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

	_, err = db.Exec("DELETE FROM `mails`")
	if err != nil {
		log.Panic(err)
		return
	}

	for _, item := range fileInfos {
		if item.IsDir() {
			continue
		}
		ext := path.Ext(item.Name())
		baseName := strings.Replace(item.Name(), ext, "", 1)
		uidl := baseName

		// BEGIN 检查是否存在
		stmt, err := db.Prepare("SELECT `id` FROM mails WHERE `uidl` = ?")
		if err != nil {
			log.Fatal(err)
			continue
		}
		defer stmt.Close()

		var id int = -1
		err = stmt.QueryRow(uidl).Scan(&id)
		if err == nil && id > 0 {
			log.Printf("[FOUND] %s, id = %d\n", uidl, id)
			continue
		}
		// END

		raw, err := ioutil.ReadFile(path.Join("raw", item.Name()))
		if err != nil {
			log.Fatal(err)
			continue
		}

		os.MkdirAll(path.Join(config.Dirs.Download, uidl), 0755)
		email, err := base.CreateMail(raw, path.Join(config.Dirs.Download, uidl))
		if err != nil {
			log.Fatal(err)
			continue
		}

		// 保存到数据库
		email.Uidl = uidl
		err = email.Store(db)
		if err != nil {
			log.Fatal(err)
			continue
		}
		log.Printf("[ SAVE] %s\n", uidl)
	}
}
