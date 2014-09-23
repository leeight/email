package main

import (
	"database/sql"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"strconv"
	"strings"

	_ "github.com/go-sql-driver/mysql"
	_ "github.com/mattn/go-sqlite3"
	"github.com/op/go-logging"

	"../base"
	"../web"
)

var log = logging.MustGetLogger("rebuild")

func rebuild(file string, db *sql.DB, rawDir string, config *base.ServerConfig, update bool) error {
	ext := path.Ext(file)
	baseName := strings.Replace(file, ext, "", 1)
	uidl := baseName

	// BEGIN 检查是否存在
	var id uint64 = 0
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

	raw, err := ioutil.ReadFile(path.Join(rawDir, file))
	if err != nil {
		log.Warning("%s", err)
		return err
	}

	downloadDir := path.Join(config.DownloadDir(), uidl)
	prefix := path.Join(path.Base(config.DownloadDir()), uidl)
	os.MkdirAll(downloadDir, 0755)
	email, err := base.NewMail(raw, downloadDir, prefix)
	if err != nil {
		log.Warning("%s", err)
		return err
	}

	// 保存到数据库
	email.Uidl = uidl
	email.Id = id
	email.IsRead = 1
	email.Id, err = email.Store(db)
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
	var rawPtr = flag.String("raw", "", "The raw file path, comma sperated multi files")
	var configPtr = flag.String("config", "config.yml", "The config file path")
	var dirptr = flag.String("dir", "", "The directory to check.")
	var lastptr = flag.Int("last", 0, "The last success uidl.")
	flag.Parse()

	config, err := base.GetConfig(*configPtr)
	if err != nil {
		log.Warning("%s", err)
		fmt.Fprintf(os.Stderr, "\nUsage of %s:\n", os.Args[0])
		flag.PrintDefaults()
	}

	ctx := web.NewContext(config)
	db := ctx.GetDb()
	defer db.Close()

	var rawDir string
	if *dirptr != "" {
		rawDir = *dirptr
	} else {
		rawDir = config.RawDir()
	}

	if *rawPtr != "" {
		// 用户指定例如文件，例如
		// rebuild -raw=720375.txt,12.txt
		for _, f := range strings.Split(*rawPtr, ",") {
			rebuild(path.Base(f), db, rawDir, config, true)
		}
	} else {
		// _, err = db.Exec("DELETE FROM `mails`")
		// if err != nil {
		// 	log.Panic(err)
		// }

		fileInfos, err := ioutil.ReadDir(rawDir)
		if err != nil {
			log.Panic(err)
		}

		for _, item := range fileInfos {
			if item.IsDir() {
				continue
			}

			if !strings.HasSuffix(item.Name(), ".txt") {
				continue
			}

			uidl := strings.Replace(item.Name(), ".txt", "", -1)
			id, _ := strconv.Atoi(uidl)
			if *lastptr > 0 && id < *lastptr {
				continue
			}

			rebuild(item.Name(), db, rawDir, config, false)
		}
	}
}
