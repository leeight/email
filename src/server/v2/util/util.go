package util

import (
	"bytes"
	"fmt"
	"html"
	"io"
	"io/ioutil"
	"log"
	"mime"
	"net/url"
	"os/exec"
	"regexp"
	"strings"
	"time"

	"github.com/astaxie/beego/context"
	"github.com/dustin/go-humanize"
	"github.com/microcosm-cc/bluemonday"
	"github.com/qiniu/iconv"
	"github.com/saintfish/chardet"

	"../../net/mail"
	"../models"
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

// 扫描 att 目录，补充必要的信息
func ScanAttachments(dir, uidl string, config *models.ServerConfig) []*models.Attachment {
	var atts []*models.Attachment
	fileInfos, err := ioutil.ReadDir(dir)
	if err != nil {
		return atts
	}

	for _, item := range fileInfos {
		if item.IsDir() {
			continue
		}

		// http://pan.baidu.com/disk/home#path=%252Fapps%252Fdropbox%252Fbaidu.com%252Fliyubei%252F390026932.08759.stu.xjtu.edu.cn,S=2174601
		var dst = fmt.Sprintf("/apps/dropbox/%s/%s/%s",
			config.Pop3.Domain, config.Pop3.Username, StripInvalidCharacter(uidl))
		var previewUrl = fmt.Sprintf("http://pan.baidu.com/disk/home#path=%s",
			url.QueryEscape(url.QueryEscape(dst)))
		att := models.Attachment{
			humanize.Bytes(uint64(item.Size())),
			item.Name(),
			previewUrl,
		}
		atts = append(atts, &att)
	}
	return atts
}

// 发送邮件的时候，把邮件地址解析成后续可用的
// 如果遇到非法的，无法解析的，直接抛弃掉
func ParseAddressList(value string) []*mail.Address {
	var list []*mail.Address
	for _, item := range strings.Split(value, "; ") {
		v, err := mail.ParseAddress(item)
		if err == nil {
			list = append(list, v)
		}
	}
	return list
}

func ParseDate(date string) (time.Time, error) {
	var y = mail.Header{}
	y["Date"] = []string{date}
	return y.Date()
}

func AddressToString(list []*mail.Address) string {
	addresses := make([]string, len(list))
	for i, item := range list {
		addresses[i] = item.String()
	}

	return strings.Join(addresses, ", ")
}

// 开发模式的时候启用，主要目的是不再依赖edp webserver
// 方式是通过系统调用lessc来搞定这个事情
func StyleFilter(root string) func(*context.Context) {
	return func(ctx *context.Context) {
		var cmd = exec.Command("lessc", "-ru", root+ctx.Input.Url())
		var out bytes.Buffer
		cmd.Stdout = &out

		var err = cmd.Run()
		if err != nil {
			log.Println("lessc", "-ru", ctx.Input.Url(), err)
			return
		}

		ctx.ResponseWriter.Header().Set("Content-Type", "text/css; charset=utf-8")
		ctx.ResponseWriter.Write(out.Bytes())
	}
}

func ListResponse(totalCount int64, pageNo int, pageSize int, args ...interface{}) models.Response {
	return &models.ListResponse{
		Success: "true",
		Page: models.PageType{
			TotalCount: totalCount,
			PageNo:     pageNo,
			PageSize:   pageSize,
			OrderBy:    "id",
			Order:      "desc",
			Result:     args[0].(interface{}),
		},
	}
}

func SimpleResponse(args ...interface{}) models.Response {
	if args == nil {
		return &models.SimpleResponse{
			Success: "true",
			Result:  models.DefaultResult{},
		}
	}

	if len(args) == 1 {
		// args = [ [A, B, C] ] -> args = [A, B, C]
		return &models.SimpleResponse{
			Success: "true",
			Result:  args[0].(interface{}),
		}
	} else {
		return &models.SimpleResponse{
			Success: "true",
			Result:  args,
		}
	}
}
