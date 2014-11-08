package parser

import (
	"encoding/json"
	"fmt"
	"testing"
)

func TestXLSX2Html(t *testing.T) {
	file := "/Volumes/HDD/Users/leeight/百度云同步盘/我的文档/emails/baidu.com/liyubei/downloads/729538/att/BDD周收入监控20141031-20141106.xlsx"
	sheets, _ := XLSX2Html(file)
	fmt.Println(len(sheets))
	x, _ := json.MarshalIndent(sheets, "", "  ")
	fmt.Println(string(x))
}
