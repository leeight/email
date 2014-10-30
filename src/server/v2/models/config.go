package models

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"time"

	"github.com/astaxie/beego/orm"
)

// backend和frontend所依赖的配置信息
type ServerConfig struct {
	Http       httpType    `json:"http"`
	Pop3       pop3Type    `json:"pop3"`
	Smtp       smtpType    `json:"smtp"`
	Service    serviceType `json:"service"`
	Debug      bool        `json:"debug"`
	ConfigPath string      `json:"-"`
	BaseDir    string      `json:"-"`
	Ormer      orm.Ormer   `json:"-"`
	InitMode   bool        `json:"-"`
}

// 数据同步到本地磁盘
func (sc *ServerConfig) Sync() error {
	if sc.ConfigPath == "" {
		return errors.New("Invalid sc.ConfigPath")
	}

	var data, err = json.MarshalIndent(sc, "", "  ")
	if err != nil {
		return err
	}

	err = ioutil.WriteFile(sc.ConfigPath, data, 0644)
	if err != nil {
		return err
	}

	return nil
}

// WebServer的配置信息
type httpType struct {
	Port int `json:"port"`
}

// POP3服务的配置信息
type pop3Type struct {
	Username         string        `json:"username"`
	Password         string        `json:"password"`
	Email            string        `json:"email"`
	Host             string        `json:"host"`
	Domain           string        `json:"-"`
	Port             int           `json:"port"`
	Tls              bool          `json:"tls"`
	Interval         time.Duration `json:"interval"`
	KeepMailOnServer int           `json:"keep_mail_on_server"` // 单位（天），早于这些天之前的邮件会从服务器中删除
}

// SMTP服务的配置信息
type smtpType struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Host     string `json:"host"`
	Port     int    `json:"port"`
	Tls      bool   `json:"tls"`
}

// 相关的一些其它服务
type serviceType struct {
	Db      dbType           `json:"db"`
	Netdisk netdiskType      `json:"netdisk"`
	Filter  filterConfigType `json:"filter"`
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

func NewNetdiskType(data []byte) (*netdiskType, error) {
	var nt = netdiskType{}
	var err = json.Unmarshal(data, &nt)
	if err != nil {
		return nil, err
	}
	return &nt, nil
}
