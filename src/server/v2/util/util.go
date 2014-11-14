package util

import (
	"bytes"
	"fmt"
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
	"github.com/saintfish/chardet"

	"../../net/mail"
	"../models"
	"./encoding"
)

// StripInvalidCharacter 按照文档里面的说明，删除一些特殊的字符
// http://developer.baidu.com/wiki/index.php?title=docs/pcs/rest/file_data_apis_list
// 1. 路径长度限制为1000
// 2. 路径中不能包含以下字符：\\ ? | " > < : *
// 3. 文件名或路径名开头结尾不能是“.”或空白字符，空白字符包括: \r, \n, \t, 空格, \0, \x0B
func StripInvalidCharacter(s string) string {
	return regexp.MustCompile(`^([\s\.]*)|([\s\.]*)$|[\\\?\|"<>:\*]`).ReplaceAllString(s, "")
}

// CharsetDecode 用来检测和修复一下文字的编码
// 有时候邮件标题里面并不是按照规范来的，需要检测编码，然后转化为utf-8
func CharsetDecode(r io.Reader, c string) ([]byte, error) {
	body, err := ioutil.ReadAll(r)
	if err != nil {
		return []byte(""), err
	}

	_, params, err := mime.ParseMediaType(c)
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
		x, err := encoding.Decode(body, charset)
		if err != nil {
			log.Println(err)
		}
		return x, nil
	}

	return body, nil
}

// StripUnnecessaryTags 删除邮件内容中一些无意义的标签
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
	sanitizer.AllowAttrs("class").OnElements("pre")

	return sanitizer.SanitizeBytes(html)
}

func encodeURIComponent(s string) string {
	return strings.Replace(url.QueryEscape(s), "+", "%20", -1)
}

// ScanAttachments 扫描 att 目录，给 models.Email 补充必要的信息
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
		var previewURL = fmt.Sprintf("http://pan.baidu.com/disk/home#path=%s",
			url.QueryEscape(url.QueryEscape(dst)))
		if strings.HasSuffix(item.Name(), ".xlsx") || strings.HasSuffix(item.Name(), ".docx") {
			// preview.html页面支持 xlsx 和 docx 的预览，xlsx的效果也比网盘的效果好
			// docx 的预览，需要解决的问题还比较多
			// 1. table cell 的合并(rowspan和colspan的设置)
			// 2. ul, li 的合理使用
			// 3. 基本样式的保留（颜色，字体，字号等等）
			// 4. 内联元素的显示（比如图片）
			previewURL = fmt.Sprintf("/preview.html?uidl=%s&file=%s",
				encodeURIComponent(uidl),
				encodeURIComponent(item.Name()))
		} else if regexp.MustCompile(".(png|jpe?g|gif|pdf|txt|html?|diff|patch)$").MatchString(item.Name()) {
			// 图片，PDF，文本之类的就直接在本地打开即可了
			previewURL = fmt.Sprintf("/downloads/%s/att/%s",
				encodeURIComponent(uidl),
				encodeURIComponent(item.Name()))
		}
		att := models.Attachment{
			Size:       humanize.Bytes(uint64(item.Size())),
			Name:       item.Name(),
			PreviewURL: previewURL,
		}
		atts = append(atts, &att)
	}
	return atts
}

// ParseAddressList 发送邮件的时候，把邮件地址解析成后续可用的
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

// ParseDate 用来解析邮件头中的日期，这里实际上调用的是 mail.Header 里面的
// 实现，因为 net/mail 里面默认初始化了很多种日期的格式
func ParseDate(date string) (time.Time, error) {
	var y = mail.Header{}
	y["Date"] = []string{date}
	return y.Date()
}

// AddressToString 是把邮件地址转化为字符串，以便可以放到邮件头里面去
// 发送邮件的时候会用到这个函数
func AddressToString(list []*mail.Address) string {
	addresses := make([]string, len(list))
	for i, item := range list {
		addresses[i] = item.String()
	}

	return strings.Join(addresses, ", ")
}

// StyleFilter 开发模式的时候启用，主要目的是不再依赖edp webserver
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

// ListResponse 用来输出列表页的响应数据
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

// SimpleResponse 用来输出一个普通的ajax的相应数据
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
	}

	return &models.SimpleResponse{
		Success: "true",
		Result:  args,
	}
}
