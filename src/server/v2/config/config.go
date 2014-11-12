package config

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"

	"code.google.com/p/go.net/publicsuffix"

	"../models"
)

// DefaultConfig 用来如果没有任何配置文件的时候，初始化一个默认的值，保证可以把服务运行
// 起来，然后再通过 /user/settings 的页面来修改 POP3 和 SMTP 的配置
// 主要是初始化 Service.Db 和 HTTP.Port
func DefaultConfig() *models.ServerConfig {
	var sc = &models.ServerConfig{}

	sc.Debug = true
	sc.InitMode = true
	sc.HTTP.Port = 8877
	sc.Pop3.Interval = 60
	sc.Service.Db.Type = "sqlite"
	sc.Service.Db.Name = "default"
	// sc.BaseDir = path.Join("data", "domain", "username")
	sc.ConfigPath = "config.json"

	return sc
}

// NewConfig 从文件 file 加载项目的配置信息
// 如果失败了，返回 nil, error
// 如果成功了，返回 models.ServerConfig, nil
func NewConfig(file string) (*models.ServerConfig, error) {
	abs, err := filepath.EvalSymlinks(file)
	if err != nil {
		return nil, err
	}

	data, err := ioutil.ReadFile(file)
	if err != nil {
		return nil, err
	}

	v := new(models.ServerConfig)
	err = json.Unmarshal(data, v)
	if err != nil {
		return nil, err
	}

	domain, err := publicsuffix.EffectiveTLDPlusOne(
		v.Pop3.Host)
	if err != nil {
		return nil, err
	}
	v.Pop3.Domain = domain

	// base是相对于config.yml来计算的
	v.ConfigPath = abs
	v.BaseDir = filepath.Clean(
		path.Join(filepath.Dir(abs),
			"data", domain, v.Pop3.Username))

	// 初始化目录的结构
	os.MkdirAll(path.Join(v.BaseDir, "raw"), 0755)
	os.MkdirAll(path.Join(v.BaseDir, "downloads"), 0755)
	os.MkdirAll(path.Join(v.BaseDir, "db"), 0755)

	return v, nil
}
