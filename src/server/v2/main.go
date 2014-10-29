package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"path"
	"strings"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/mattn/go-sqlite3"

	"./backend"
	"./config"
	"./frontend"
	"./util"
)

func main() {
	var configfile = flag.String("config", "config.json", "The config file path")
	flag.Parse()

	log.SetFlags(log.LstdFlags | log.Lshortfile)

	config, err := config.NewConfig(*configfile)
	if err != nil {
		log.Fatal(err)
	}

	if len(os.Args) >= 2 && strings.Index(os.Args[1], "-config=") == 0 {
		// 为了兼容 	orm.RunCommand() 的参数处理逻辑，当发现传递 -config= 参数的时候，
		// 人肉把它删掉，例如：
		// os.Args = ["main", "-config=x.json", "orm", "sqlall"]
		// =>
		// os.Args = ["main", "orm", "sqlall"]
		// https://github.com/astaxie/beego/blob/a144769515b8ddfb69046b3ef9e29c38bab94f3b/orm/cmd.go#L51
		os.Args = append(os.Args[0:1], os.Args[2:]...)
	}

	orm.Debug = config.Debug
	orm.RegisterDriver("mysql", orm.DR_MySQL)
	orm.RegisterDriver("sqlite3", orm.DR_Sqlite)

	// [username[:password]@][protocol[(address)]]/dbname[?param1=value1&...&paramN=valueN]
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

	beego.HttpPort = config.Http.Port
	beego.SetStaticPath("/downloads", path.Join(config.BaseDir, "downloads"))
	beego.SetStaticPath("/raw", path.Join(config.BaseDir, "raw"))
	// TODO(user) 只在开发的模式下启用
	beego.InsertFilter("/src/common/css/main.less", beego.BeforeStatic, util.StyleFilter)

	go backend.Run(config)
	frontend.Run(config)
}
