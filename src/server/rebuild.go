package main

import (
	"database/sql"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"strings"

	_ "github.com/mattn/go-sqlite3"
	"github.com/op/go-logging"

	"./base"
)

var log = logging.MustGetLogger("rebuild")

func rebuild(file string, db *sql.DB, config *base.ServerConfig, update bool) error {
	ext := path.Ext(file)
	baseName := strings.Replace(file, ext, "", 1)
	uidl := baseName

	// BEGIN 检查是否存在
	var id int64 = -1
	err := db.QueryRow("SELECT `id` FROM mails WHERE `uidl` = ?", uidl).Scan(&id)
	if err != nil && err != sql.ErrNoRows {
		log.Warning("%s", err)
		return err
	}

	if !update {
		// 不是UPDATE，那么是INSERT，测试需要判断一下是否存在
		if err == nil && id > 0 {
			log.Info("[FOUND] %s, id = %d\n", uidl, id)
			return err
		}
	}
	// END

	raw, err := ioutil.ReadFile(path.Join(config.RawDir(), file))
	if err != nil {
		log.Warning("%s", err)
		return err
	}

	os.MkdirAll(path.Join(config.DownloadDir(), uidl), 0755)
	email, err := base.NewMail(raw,
		path.Join(path.Base(config.DownloadDir()), uidl))
	if err != nil {
		log.Warning("%s", err)
		return err
	}

	// 保存到数据库
	email.Uidl = uidl
	email.Id = id
	_, err = email.Store(db)
	if err != nil {
		log.Warning("%s", err)
		return err
	}
	log.Info("[ SAVE] %s\n", uidl)
	return nil
}

// 读取raw目录里面的原始信息，开始重建索引数据
// 1. sqlite的数据会被清空，重写
// 2. 附件的内容会被重新生成
func main() {
	// 参数解析
	rawPtr := flag.String("raw", "", "The raw file path")
	configPtr := flag.String("config", "config.yml", "The config file path")
	flag.Parse()

	config, err := base.GetConfig(*configPtr)
	if err != nil {
		log.Warning("%s", err)
		fmt.Fprintf(os.Stderr, "\nUsage of %s:\n", os.Args[0])
		flag.PrintDefaults()
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
		rebuild(path.Base(*rawPtr), db, config, true)
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
			rebuild(item.Name(), db, config, false)
		}
	}
}
