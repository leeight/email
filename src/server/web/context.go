package web

import (
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
	"github.com/op/go-logging"

	"../base"
)

type Context interface {
	GetDb() *sql.DB
	GetConfig() *base.ServerConfig
	GetLogger() *logging.Logger
}

func NewContext(config *base.ServerConfig) Context {
	return webContext{config: config}
}

type webContext struct {
	config *base.ServerConfig
	logger *logging.Logger
}

func (c webContext) GetDb() *sql.DB {
	db, err := sql.Open("sqlite3", c.config.DbPath())
	if err != nil {
		c.GetLogger().Warning("%s", err)
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
