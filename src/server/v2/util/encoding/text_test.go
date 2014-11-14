package encoding

import (
	// "fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDecode(t *testing.T) {
	dst, err := DecodeString("\xc4\xe3\xba\xc3", "gbk")
	assert.Nil(t, err)
	assert.Equal(t, "你好", dst)

	dst, err = DecodeString("\xc4\xe3\xba\xc3", "GBK")
	assert.Nil(t, err)
	assert.Equal(t, "你好", dst)

	dst, err = DecodeString("\xc4\xe3\xba\xc3", "Gb2312")
	assert.Nil(t, err)
	assert.Equal(t, "你好", dst)

	dst, err = DecodeString("\xc4\xe3\xba\xc3", "xxxx")
	assert.Nil(t, err)
	assert.Equal(t, "\xc4\xe3\xba\xc3", dst)
}
