package base

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"time"

	"code.google.com/p/go.net/publicsuffix"
	"gopkg.in/yaml.v1"
)

const (
	kDefaultInterval    = 60
	kDefaultDownloadDir = "downloads"
	kDefaultRawDir      = "raw"
	kDefaultDbName      = "foo.db"
	kDefaultPop3Port    = 995
	kDefautlSmtpPort    = 25
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
	return fixHostname(this.Host, this.Port, kDefautlSmtpPort)
}

type frontendType struct {
	From string `json:"from"`
	Name string `json:"name"`
}

type ServerConfig struct {
	Http     httpType
	Pop3     pop3Type
	Smtp     smtpType
	Frontend frontendType
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

	// 创建目录保证正确性
	os.MkdirAll(config.DownloadDir(), 0755)
	os.MkdirAll(config.RawDir(), 0755)

	log.Printf("Config: %s\n", abs)
	log.Printf("Dirs.Base: %s\n", config.Dirs.Base)
	log.Printf("Dirs.Download: %s\n", config.DownloadDir())
	log.Printf("Dirs.Raw: %s\n", config.RawDir())
	log.Printf("Dirs.DbPath: %s\n", config.DbPath())
	fmt.Println()

	return &config, nil
}
