package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path"
	"strconv"
	"strings"

	"github.com/astaxie/beego/orm"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/mattn/go-sqlite3"

	cf "../v2/config"
	"../v2/models"
	"../v2/util/parser"
	"../v2/util/saver"
)

func rebuild(file string, rawDir string, config *models.ServerConfig, update bool) error {
	ext := path.Ext(file)
	uidl := strings.Replace(file, ext, "", 1)

	// BEGIN 检查是否存在
	var m = &models.Email{}
	err := config.Ormer.
		QueryTable("email").
		Filter("Uidl", uidl).
		One(m, "Id", "Uidl", "Date")
	if err != nil && err != orm.ErrNoRows {
		log.Println(err)
		return err
	}

	if !update && m.Id > 0 {
		// 不是UPDATE，那么是INSERT，测试需要判断一下是否存在
		log.Printf("[FOUND] %s, id = %d\n", uidl, m.Id)
		return err
	}
	// END

	raw, err := ioutil.ReadFile(path.Join(rawDir, file))
	if err != nil {
		log.Println(err)
		return err
	}

	email, err := parser.NewEmail(raw)
	if err != nil {
		log.Println(err)
		return err
	}
	email.IsRead = 1
	email.Uidl = uidl

	if m.Id > 0 {
		email.Id = m.Id
	}

	// 保存到数据库
	saver.EmailSave(email, config)

	// 保存邮件的资源和附件
	saver.EmailResourceSave(email, config)

	log.Printf("[ SAVE] %s\n", uidl)
	return nil
}

// 读取raw目录里面的原始信息，开始重建索引数据
// 1. sqlite的数据会被清空，重写
// 2. 附件的内容会被重新生成
func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	// 参数解析
	var rawPtr = flag.String("raw", "", "The raw file path, comma sperated multi files")
	var configPtr = flag.String("config", "config.json", "The config file path")
	var dirptr = flag.String("dir", "", "The directory to check.")
	var lastptr = flag.Int("last", 0, "The last success uidl.")
	flag.Parse()

	config, err := cf.NewConfig(*configPtr)
	if err != nil {
		fmt.Fprintf(os.Stderr, "\nUsage of %s:\n", os.Args[0])
		flag.PrintDefaults()
		return
	}

	var rawDir string
	if *dirptr != "" {
		rawDir = *dirptr
	} else {
		rawDir = path.Join(config.BaseDir, "raw")
	}

	orm.Debug = config.Debug
	orm.RegisterDriver("mysql", orm.DR_MySQL)
	orm.RegisterDriver("sqlite3", orm.DR_Sqlite)

	srv := config.Service.Db
	if srv.Type == "" || srv.Type == "mysql" {
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?parseTime=true&charset=utf8",
			srv.Username, srv.Password, srv.Host, srv.Port, srv.Name)
		orm.RegisterDataBase("default", "mysql", dsn)
	} else if srv.Type == "sqlite" {
		orm.RegisterDataBase("default", "sqlite3",
			path.Join(config.BaseDir, "db", srv.Name+".db"))
	} else {
		log.Fatalf("Invalid Database Type: %s\n", srv.Type)
	}

	orm.RunCommand()
	config.Ormer = orm.NewOrm()

	if *rawPtr != "" {
		// 用户指定例如文件，例如
		// rebuild -raw=720375.txt,12.txt
		for _, f := range strings.Split(*rawPtr, ",") {
			rebuild(path.Base(f), rawDir, config, true)
		}
	} else {
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

			rebuild(item.Name(), rawDir, config, false)
		}
	}
}
