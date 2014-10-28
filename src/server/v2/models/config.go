package models

import (
	"time"

	"github.com/astaxie/beego/orm"
)

// backend和frontend所依赖的配置信息
type ServerConfig struct {
	Http    httpType    `json:"http"`
	Pop3    pop3Type    `json:"pop3"`
	Smtp    smtpType    `json:"smtp"`
	Service serviceType `json:"service"`
	BaseDir string      `json:"-"`
	Ormer   orm.Ormer   `json:"-"`
}

// WebServer的配置信息
type httpType struct {
	Port int `json:"port"`
}

// POP3服务的配置信息
type pop3Type struct {
	Username         string        `json:"username"`
	Password         string        `json:"password"`
	Host             string        `json:"host"`
	Domain           string        `json:"-"`
	Port             int           `json:"port"`
	Tls              bool          `json:"tls"`
	Interval         time.Duration `json:"interval"`
	KeepMailOnServer int           `json:"keep_mail_on_server"` // 单位（天），早于这些天之前的邮件会从服务器中删除
}

// SMTP服务的配置信息
type smtpType struct {
	pop3Type
}

// 相关的一些其它服务
type serviceType struct {
	Soffice sofficeServerType `json:"soffice"`
	Db      dbType            `json:"db"`
	Indexer indexerType       `json:"indexer"`
	Netdisk netdiskType       `json:"netdisk"`
	Filter  filterConfigType  `json:"filter"`
}

// soffice的可执行文件路径
type sofficeServerType struct {
	Exec string `json:"exec"`
}

// 数据库的配置信息
type dbType struct {
	Type     string `json:"type"`
	Name     string `json:"name"`
	Host     string `json:"host"`
	Username string `json:"username"`
	Password string `json:"password"`
	Port     int    `json:"port"`
}

// elasticsearch的配置
type indexerType struct {
	Host string `json:"host"`
	Port int    `json:"port"`
}

// 百度云的一些配置信息
type netdiskType struct {
	ExpiresIn     int    `json:"expires_in"`
	RefreshToken  string `json:"refresh_token"`
	AccessToken   string `json:"access_token"`
	SessionSecret string `json:"session_secret"`
	SessionKey    string `json:"session_key"`
	Scope         string `json:"scope"`
}

// 过滤器的配置信息
type filterConfigType struct {
	Config string `json:"config"`
}
