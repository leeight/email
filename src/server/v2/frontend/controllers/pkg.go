package controllers

import (
	"fmt"
	"net/url"
	"path"
	"regexp"
	"strings"

	"../../models"
	"../../util"
)

// pkg级别公用的变量
var gSrvConfig *models.ServerConfig

// SetServerConfig 设置全局变量 gSrvConfig 的值
func SetServerConfig(c *models.ServerConfig) {
	gSrvConfig = c
}

func patchEmailFields(email *models.Email) {
	// 修复from,to,cc,bcc,reply_to这5个字段的值
	email.FixMailAddressFields()

	// 从sqlite3导入数据到mysql之后，发生了转义的问题
	// 如果全部修复，貌似也没啥意义，就这里用到的时候再处理一下吧
	if strings.Index(email.Message, "`Content-Type`") != -1 {
		email.Message = strings.Replace(email.Message, "`", "'", -1)
	}

	// 删除一些无意义的标签
	email.Message = string(util.StripUnnecessaryTags([]byte(email.Message)))

	// 替换src="cid:"的内容
	var re = regexp.MustCompile(`src="cid:([^"]+)"`)
	email.Message = re.ReplaceAllString(email.Message,
		fmt.Sprintf(`src="downloads/%s/cid/$1"`, url.QueryEscape(email.Uidl)))

	// 修复email.Attachments字段的值
	email.Attachments = util.ScanAttachments(
		path.Join(gSrvConfig.BaseDir, "downloads", email.Uidl, "att"),
		email.Uidl, gSrvConfig)
}
