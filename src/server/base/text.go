package base

import (
	// "fmt"
	"net/url"
	// "regexp"

	"github.com/microcosm-cc/bluemonday"
)

// 删除邮件正文中不必要的内容，只保留<body>和</body>之间的内容
func StripUnnecessaryTags(html []byte) []byte {
	// 居然有变态的这种CASE
	// <![if !vml]>$
	//     <body bgcolor="#16668e" lang="ZH-CN" style="tab-interval:36.0pt">$
	// <![endif]-->$
	// <![if vml]>$
	//     <body bgcolor="#EEECE1" lang="ZH-CN" style="tab-interval:36.0pt">$
	// <![endif]-->$

	// p1 := regexp.MustCompile(`</?body[^>]*>`)
	// indexs := p1.FindAllIndex(html, -1)
	// fmt.Printf("%v\n", indexs)
	// if indexs != nil {
	// 	if len(indexs) == 2 {
	// 		start := indexs[0][1]
	// 		end := indexs[1][0]
	// 		html = html[start:end]
	// 	} else if len(indexs) == 1 {
	// 		// 有的邮件里面只有<body>，没有结束的</body>
	// 		// 例如：http://127.0.0.1:8848/index.html?ed=#/mail/view~id=963&uidl=720375
	// 		// 估计大部分都是自己写程序发送的，正常的User-Agent是不会出现这个问题的
	// 		start := indexs[0][1]
	// 		html = html[start:]
	// 	} else if len(indexs) > 2 {
	// 		// 就是上面的那种变态的CASE了

	// 	}
	// }

	// fmt.Println(string(html))

	// 删除 <!--[if 和 <![endif]--> 之间的内容
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
	sanitizer.AllowAttrs("style", "color").OnElements("span", "table", "td", "tr", "font")

	return sanitizer.SanitizeBytes(html)
	// p2 := regexp.MustCompile(`(?si)((<!--\[if.*?endif\]-->)|(<style[^>]*>.*?</style>))`)
	// html = p2.ReplaceAll(html, []byte(""))

	// return []byte(p2)
}
