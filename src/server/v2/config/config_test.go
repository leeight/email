package config

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewConfigWithoutConfig(t *testing.T) {
	config, err := NewConfig("NoSuchFile.json")
	assert.Equal(t, config == nil, true)
	assert.Equal(t, err != nil, true)
}

func TestNewConfigWithoutInvalidFormat(t *testing.T) {
	config, err := NewConfig("config_test.go")
	assert.Equal(t, config == nil, true)
	assert.Equal(t, err != nil, true)
}

func TestNewConfigValid(t *testing.T) {
	config, err := NewConfig("../config.example.json")
	assert.Equal(t, config == nil, false)
	assert.Equal(t, err != nil, false)
	assert.Equal(t, config.Http.Port, 8765)
	assert.Equal(t, config.Pop3.Host, "email.baidu.com")
	assert.Equal(t, config.Pop3.KeepMailOnServer, 14)
	assert.Equal(t, config.Pop3.Interval, 60)
	assert.Equal(t, config.Pop3.Tls, true)
	assert.Equal(t, config.Smtp.Host, "email.baidu.com")
	assert.Equal(t, config.Smtp.Tls, true)
	assert.Equal(t, config.Smtp.Username, "internal\\liyubei")
	assert.Equal(t, config.Service.Db.Username, "root")
	assert.Equal(t, config.Service.Db.Type, "")
	assert.NotEqual(t, config.BaseDir, "")
}
