package storage

import (
	"io/ioutil"
	"path"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNetdiskSave(t *testing.T) {
	token := "21.1f01b263e9394ef43c9f7561e7336210.2592000.1416966874.3540365790-881963"
	dst := "/apps/dropbox/xjtu.edu.cn/leeight/464748099.07127.stu.xjtu.edu.cn,S=215058/数学之美－搜索引擎.pdf"
	data, err := ioutil.ReadFile(path.Join("data", "数学之美－搜索引擎.pdf"))

	assert.Nil(t, err)

	err = NewNetdiskStorage(token, dst, data).Save()
	assert.Nil(t, err)
}
