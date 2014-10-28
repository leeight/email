package main

import (
	"fmt"
	"log"
	"path"

	"github.com/astaxie/beego/orm"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/mattn/go-sqlite3"

	"../backend"
	"../config"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	config, err := config.NewConfig("config.json")
	if err != nil {
		log.Fatal(err)
	}

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

	backend.Run(config)
}
