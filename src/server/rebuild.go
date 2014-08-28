package main

import (
	"database/sql"
	"flag"
	"io/ioutil"
	"log"
	"os"
	"path"
	"strings"

	_ "github.com/mattn/go-sqlite3"

	"./base"
)

func rebuild(file string, db *sql.DB, downloadDir string, update bool) error {
	ext := path.Ext(file)
	baseName := strings.Replace(file, ext, "", 1)
	uidl := baseName

	// BEGIN 检查是否存在
	var id int64 = -1
	err := db.QueryRow("SELECT `id` FROM mails WHERE `uidl` = ?", uidl).Scan(&id)
	if err != nil {
		log.Fatal(err)
		return err
	}

	if !update {
		// 不是UPDATE，那么是INSERT，测试需要判断一下是否存在
		if err == nil && id > 0 {
			log.Printf("[FOUND] %s, id = %d\n", uidl, id)
			return err
		}
	}
	// END

	raw, err := ioutil.ReadFile(path.Join("raw", file))
	if err != nil {
		log.Fatal(err)
		return err
	}

	os.MkdirAll(path.Join(downloadDir, uidl), 0755)
	email, err := base.NewMail(raw, path.Join(downloadDir, uidl))
	if err != nil {
		log.Fatal(err)
		return err
	}

	// 保存到数据库
	email.Uidl = uidl
	email.Id = id
	_, err = email.Store(db)
	if err != nil {
		log.Fatal(err)
		return err
	}
	log.Printf("[ SAVE] %s\n", uidl)
	return nil
}

// 读取raw目录里面的原始信息，开始重建索引数据
// 1. sqlite的数据会被清空，重写
// 2. 附件的内容会被重新生成
func main() {
	// 参数解析
	rawPtr := flag.String("raw", "", "The raw file path")
	flag.Parse()

	config, err := base.GetConfig("config.yml")
	if err != nil {
		log.Panic(err)
	}

	// 打开数据库
	db, err := sql.Open("sqlite3", config.DbPath())
	if err != nil {
		log.Panic(err)
		return
	}
	defer db.Close()

	if *rawPtr != "" {
		// 用户指定例如文件，例如
		// rebuild -raw=raw/720375.txt
		rebuild(path.Base(*rawPtr), db, config.DownloadDir(), true)
	} else {
		_, err = db.Exec("DELETE FROM `mails`")
		if err != nil {
			log.Panic(err)
		}

		fileInfos, err := ioutil.ReadDir(config.RawDir())
		if err != nil {
			log.Panic(err)
		}

		for _, item := range fileInfos {
			if item.IsDir() {
				continue
			}
			rebuild(item.Name(), db, config.DownloadDir(), false)
		}
	}
}
