package base

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"code.google.com/p/go.net/publicsuffix"
	"gopkg.in/yaml.v1"
)

func fixHostname(host string, port, defaultPort int) string {
	if port <= 0 {
		port = defaultPort
	}
	return host + ":" + strconv.Itoa(port)
}

type httpType struct {
	Port int
}

type pop3Type struct {
	Username, Password, Host string
	Port                     int
	Tls                      bool
	Interval                 time.Duration
	Delete_older_mails       int // 单位（天），早于这些天之前的邮件会从服务器中删除
}

func (this pop3Type) GetInterval() time.Duration {
	if this.Interval <= 0 {
		return kDefaultInterval
	}
	return this.Interval
}

func (this pop3Type) GetHostName() string {
	hostname := fixHostname(this.Host, this.Port, kDefaultPop3Port)
	return hostname
}

type smtpType struct {
	Username, Password, Host string
	Port                     int
	Tls                      bool
}

func (this smtpType) GetHostName() string {
	return fixHostname(this.Host, this.Port, kDefautlSMTPPort)
}

type frontendType struct {
	From string `json:"from"`
	Name string `json:"name"`
}

type serviceType struct {
	Soffice sofficeServerType
	Db      dbType
	Indexer indexerType
	Netdisk netdiskType
}

type netdiskType struct {
	ExpiresIn     int    `json:"expires_in"`
	RefreshToken  string `json:"refresh_token"`
	AccessToken   string `json:"access_token"`
	SessionSecret string `json:"session_secret"`
	SessionKey    string `json:"session_key"`
	Scope         string `json:"scope"`
}

type sofficeServerType struct {
	Exec string
}

type dbType struct {
	Type, Name, Host, User, Pass string
	Port                         int
}

type indexerType struct {
	Host string
	Port int
}

type ServerConfig struct {
	Http     httpType
	Pop3     pop3Type
	Smtp     smtpType
	Frontend frontendType
	Service  serviceType
	Dirs     struct {
		Base string
	}
}

func (config *ServerConfig) DownloadDir() string {
	return path.Join(config.Dirs.Base, kDefaultDownloadDir)
}

func (config *ServerConfig) RawDir() string {
	return path.Join(config.Dirs.Base, kDefaultRawDir)
}

func (config *ServerConfig) DbPath() string {
	return path.Join(config.Dirs.Base, kDefaultDbName)
}

func (config *ServerConfig) NetdiskFile(name, uidl string) string {
	chunks := strings.Split(config.Dirs.Base, "/")
	return fmt.Sprintf("/apps/dropbox/%s/%s/%s/%s",
		chunks[len(chunks)-2],
		chunks[len(chunks)-1],
		uidl,
		name)
}

func GetConfig(file string) (*ServerConfig, error) {
	abs, err := filepath.EvalSymlinks(file)
	if err != nil {
		log.Fatal(err)
		return nil, err
	}

	data, err := ioutil.ReadFile(abs)
	if err != nil {
		log.Fatal(err)
		return nil, err
	}

	var config ServerConfig
	err = yaml.Unmarshal(data, &config)
	if err != nil {
		log.Fatal(err)
		return nil, err
	}

	if config.Pop3.Host == "" {
		log.Fatal("pop3.host is empty.")
	}

	domain, _ := publicsuffix.EffectiveTLDPlusOne(
		config.Pop3.Host)

	// base是相对于config.yml来计算的
	config.Dirs.Base = filepath.Clean(
		path.Join(filepath.Dir(abs),
			"data", domain, config.Pop3.Username))

	if config.Frontend.Name == "" {
		config.Frontend.Name = config.Pop3.Username
	}
	if config.Frontend.From == "" {
		config.Frontend.From = config.Frontend.Name + "@" + domain
	}

	if _, err := os.Stat(path.Join(config.Dirs.Base, "netdisk.json")); err == nil {
		netdiskConfig, err := ioutil.ReadFile(path.Join(config.Dirs.Base, "netdisk.json"))
		if err != nil {
			log.Fatal(err)
		}
		json.Unmarshal(netdiskConfig, &config.Service.Netdisk)
	}

	// 创建目录保证正确性
	os.MkdirAll(config.DownloadDir(), 0755)
	os.MkdirAll(config.RawDir(), 0755)
	os.MkdirAll(path.Dir(config.DbPath()), 0755)

	log.Printf("Config: %s\n", abs)
	log.Printf("Config.Pop3.DeleteOlderMails: %d\n", config.Pop3.Delete_older_mails)
	log.Printf("Dirs.Base: %s\n", config.Dirs.Base)
	log.Printf("Dirs.Download: %s\n", config.DownloadDir())
	log.Printf("Dirs.Raw: %s\n", config.RawDir())
	// log.Printf("Dirs.DbPath: %s\n", config.DbPath())
	fmt.Println()

	return &config, nil
}
