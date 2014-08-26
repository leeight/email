package base

import (
	"gopkg.in/yaml.v1"
	"io/ioutil"
)

type pop3Type struct {
	Username, Password, Hostname string
	Tls                          bool
}

type smtpType struct {
	Username, Password, Hostname string
	Tls                          bool
}

type ServerConfig struct {
	Pop3 pop3Type
	Smtp smtpType
	Dirs struct {
		Static   string
		Download string
		Raw      string
	}
}

func GetConfig(file string) (*ServerConfig, error) {
	data, err := ioutil.ReadFile(file)
	if err != nil {
		return nil, err
	}

	var config ServerConfig
	err = yaml.Unmarshal(data, &config)
	if err != nil {
		return nil, err
	}

	return &config, nil
}
