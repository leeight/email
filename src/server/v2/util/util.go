package util

import (
	"fmt"
	"html"
	"io"
	"io/ioutil"
	"log"
	"mime"
	"net/url"
	"regexp"
	"strings"

	"github.com/microcosm-cc/bluemonday"
	"github.com/qiniu/iconv"
	"github.com/saintfish/chardet"
)

var charsetMap map[string]string

func init() {
	// 初始化 charsetMap
	charsetMap = make(map[string]string)

	charsetMap["gb2312"] = "gb18030"
	charsetMap["gbk"] = "gb18030"
	charsetMap["windows-1252"] = "gb18030"
	charsetMap["GB-18030"] = "gb18030"
}

// 按照文档里面的说明，删除一些特殊的字符
// http://developer.baidu.com/wiki/index.php?title=docs/pcs/rest/file_data_apis_list
// 1. 路径长度限制为1000
// 2. 路径中不能包含以下字符：\\ ? | " > < : *
// 3. 文件名或路径名开头结尾不能是“.”或空白字符，空白字符包括: \r, \n, \t, 空格, \0, \x0B
func StripInvalidCharacter(s string) string {
	return regexp.MustCompile(`^([\s\.]*)|([\s\.]*)$|[\\\?\|"<>:\*]`).ReplaceAllString(s, "")
}

// 修复一下charset的值，以便iconv可以正确的处理
func fixCharset(o string) string {
	if v, ok := charsetMap[o]; ok {
		return v
	}
	return o
}

func CharsetDecode(r io.Reader, c string) ([]byte, error) {
	body, err := ioutil.ReadAll(r)
	if err != nil {
		return []byte(""), err
	}

	ct, params, err := mime.ParseMediaType(c)
	if err != nil {
		return body, err
	}

	var charset string
	if _, ok := params["charset"]; ok {
		charset = strings.ToLower(strings.Replace(params["charset"], "\"", "", -1))
	} else {
		// 没有charset的声明，只有一个  Content-Type: text/html，此时
		// 需要用chardet来检测一下
		detector := chardet.NewTextDetector()
		result, err := detector.DetectBest(body)
		if err == nil {
			charset = result.Charset
		}
	}

	if charset != "" {
		cd, err := iconv.Open("utf-8", fixCharset(charset))
		if err != nil {
			log.Printf("Invalid charset = %s, content-type = %s\n", charset, ct)
			return body, nil
		}
		defer cd.Close()

		var outbuf [512]byte
		x, _, err := cd.Conv(body, outbuf[:])
		if err == nil {
			body = x
		}
	}

	if ct == "text/plain" {
		body = []byte(fmt.Sprintf("<pre>%s</pre>",
			html.EscapeString(string(body))))
	}

	return body, nil
}

// 删除一些无意义的标签
func StripUnnecessaryTags(html []byte) []byte {
	sanitizer := bluemonday.UGCPolicy()

	sanitizer.AllowStandardURLs()
	sanitizer.AllowStandardAttributes()
	sanitizer.AllowDataURIImages()
	sanitizer.AllowImages()
	sanitizer.AllowLists()
	sanitizer.AllowTables()
	sanitizer.AllowURLSchemeWithCustomPolicy("cid", func(url *url.URL) bool {
		return true
	})
	sanitizer.AllowAttrs("alt", "border").OnElements("img")
	sanitizer.AllowAttrs("style", "color").OnElements(
		"span", "table", "td", "tr", "font", "li", "ol", "ul")

	return sanitizer.SanitizeBytes(html)
}
