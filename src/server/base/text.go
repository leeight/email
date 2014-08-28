package base

import (
	"regexp"
)

// 删除邮件正文中不必要的内容，只保留<body>和</body>之间的内容
func StripUnnecessaryTags(html []byte) []byte {
	p1 := regexp.MustCompile(`</?body[^>]*>`)
	indexs := p1.FindAllIndex(html, 2)
	if indexs != nil {
		if len(indexs) == 2 {
			start := indexs[0][1]
			end := indexs[1][0]
			html = html[start:end]
		} else if len(indexs) == 1 {
			// 有的邮件里面只有<body>，没有结束的</body>
			// 例如：http://127.0.0.1:8848/index.html?ed=#/mail/view~id=963&uidl=720375
			// 估计大部分都是自己写程序发送的，正常的User-Agent是不会出现这个问题的
			start := indexs[0][1]
			html = html[start:]
		}
	}

	// 删除 <!--[if 和 <![endif]--> 之间的内容
	p2 := regexp.MustCompile(`(?si)((<!--\[if.*endif\]-->)|(<style>.*</style>))`)
	html = p2.ReplaceAll(html, []byte(""))

	return html
}
