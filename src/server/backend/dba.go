package backend

import (
	"database/sql"
	"io/ioutil"
	"os"
	"path"

	"../web"
)

func InitDatabase(ctx web.Context, sqlFile string) {
	config := ctx.GetConfig()
	log := ctx.GetLogger()

	if _, err := os.Stat(config.DbPath()); err != nil {
		log.Info("Initializing database")

		// 不存在，初始化数据库
		db, err := sql.Open("sqlite3", config.DbPath())
		if err != nil {
			log.Fatal(err)
			return
		}

		// 定位初始化的sql文件
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
}
