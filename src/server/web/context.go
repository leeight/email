package web

import (
	"database/sql"

	// 支持mysql
	_ "github.com/go-sql-driver/mysql"
	// 支持sqllite
	_ "github.com/mattn/go-sqlite3"
	"github.com/op/go-logging"

	"../base"
)

// Context 来封装必要的运行时上下文信息
type Context interface {
	GetDb() *sql.DB
	GetMysqlDb() *sql.DB
	GetConfig() *base.ServerConfig
	GetLogger() *logging.Logger
}

// NewContext 创建一个Context，现在只有webContext类型
func NewContext(config *base.ServerConfig) Context {
	return webContext{config: config}
}

type webContext struct {
	config *base.ServerConfig
	logger *logging.Logger
}

func (c webContext) GetDb() *sql.DB {
	return c.GetMysqlDb()
	// db, err := sql.Open("sqlite3", c.config.DbPath())
	// if err != nil {
	// 	c.GetLogger().Warning("%s", err)
	// }
	// return db
}

func (c webContext) GetMysqlDb() *sql.DB {
	db, err := sql.Open("mysql", "root:@/foo?parseTime=true")
	if err != nil {
		c.GetLogger().Warning("%s", err)
		panic(err)
	}

	err = db.Ping()
	if err != nil {
		panic(err)
	}

	return db
}

func (c webContext) GetConfig() *base.ServerConfig {
	return c.config
}

func (c webContext) GetLogger() *logging.Logger {
	if c.logger == nil {
		c.logger = base.NewLogger("frontend")
	}
	return c.logger
}
