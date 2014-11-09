package parser

import (
	"path"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestXLSX2Html(t *testing.T) {
	sheets, err := XLSX2Html(path.Join("data", "test.xlsx"))
	assert.Nil(t, err)
	assert.NotNil(t, sheets)
	assert.Equal(t, 4, len(sheets))
	assert.Equal(t, sheets[0].Name, "一")
	assert.Equal(t, sheets[1].Name, "二")
	assert.Equal(t, sheets[2].Name, "三")
	assert.Equal(t, sheets[3].Name, "四")
}
