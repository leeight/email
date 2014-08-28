package base

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path"
	"path/filepath"
	"time"

	"gopkg.in/yaml.v1"
)

const (
	kDefaultInterval    = 60
	kDefaultDownloadDir = "downloads"
	kDefaultRawDir      = "raw"
	kDefaultDbName      = "foo.db"
)

type pop3Type struct {
	Username, Password, Hostname string
	Tls                          bool
	Interval                     time.Duration
}

func (this pop3Type) GetInterval() time.Duration {
	if this.Interval <= 0 {
		return kDefaultInterval
	}
	return this.Interval
}

type smtpType struct {
	Username, Password, Hostname string
	Tls                          bool
}

type ServerConfig struct {
	Pop3 pop3Type
	Smtp smtpType
	Dirs struct {
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
		log.Panic(err)
		return nil, err
	}

	data, err := ioutil.ReadFile(abs)
	if err != nil {
		log.Panic(err)
		return nil, err
	}

	var config ServerConfig
	err = yaml.Unmarshal(data, &config)
	if err != nil {
		log.Panic(err)
		return nil, err
	}

	// base是相对于config.yml来计算的
	config.Dirs.Base = filepath.Clean(
		path.Join(filepath.Dir(abs), config.Dirs.Base))

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
