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
	return fixHostname(this.Host, this.Port, kDefautlSMTPPort)
}

type frontendType struct {
	From string `json:"from"`
	Name string `json:"name"`
}

type serviceType struct {
	Doc      docServiceType
	Searcher searcherServiceType
	Soffice  sofficeServerType
}

type searcherServiceType struct {
	Datadir string
	Port    int
}

type sofficeServerType struct {
	Exec string
}

type docServiceType struct {
	Url      string
	Pid      int
	Token    string
	Sformats []string
	Tformat  string
}

type ServerConfig struct {
	Http     httpType
	Pop3     pop3Type
	Smtp     smtpType
	Frontend frontendType
	Service  serviceType
	Db       string
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
	if config.Db == "" {
		return path.Join(config.Dirs.Base, kDefaultDbName)
	} else {
		return path.Join(config.Dirs.Base, config.Db)
	}
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

	// 如果不是绝对路径，那么路径是相对于config.yml所在的目录来计算的
	if !filepath.IsAbs(config.Service.Searcher.Datadir) {
		config.Service.Searcher.Datadir = filepath.Clean(
			path.Join(filepath.Dir(abs),
				config.Service.Searcher.Datadir))
	}

	// 创建目录保证正确性
	os.MkdirAll(config.DownloadDir(), 0755)
	os.MkdirAll(config.RawDir(), 0755)
	os.MkdirAll(path.Dir(config.DbPath()), 0755)

	log.Printf("Config: %s\n", abs)
	log.Printf("Dirs.Base: %s\n", config.Dirs.Base)
	log.Printf("Dirs.Download: %s\n", config.DownloadDir())
	log.Printf("Dirs.Raw: %s\n", config.RawDir())
	log.Printf("Dirs.DbPath: %s\n", config.DbPath())
	fmt.Println()

	return &config, nil
}
