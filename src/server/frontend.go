package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"./base"
	"./handlers"
	"./web"
)

func main() {
	configPtr := flag.String("config", "config.yml", "The config file path")
	flag.Parse()

	config, err := base.GetConfig(*configPtr)
	if err != nil {
		// log.Warning("%s", err)
		fmt.Fprintf(os.Stderr, "Usage of %s:\n", os.Args[0])
		flag.PrintDefaults()
		return
	}

	context := web.NewContext(config)

	// 自定义的API
	http.Handle("/api/inbox", handlers.MailListHandler{context})
	http.Handle("/api/mail/read", handlers.MailReadHandler{context})
	http.Handle("/api/mail/search", handlers.MailSearchHandler{context})
	http.Handle("/api/mail/mark_as_read", handlers.MarkAsReadHandler{context})
	http.Handle("/api/mail/delete", handlers.MailDeleteHandler{context})
	http.Handle("/api/mail/post", handlers.MailPostHandler{context})

	http.Handle("/api/thread/list", handlers.ThreadListHandler{context})
	http.Handle("/api/thread/read", handlers.ThreadReadHandler{context})

	http.Handle("/api/labels", handlers.MailLabelsHandler{context})
	http.Handle("/api/contacts", handlers.ContactsListHandler{context})

	// 文档转化成功之后的wurl调用
	http.Handle("/api/doc/feedback", handlers.DocFeedbackHandler{context})
	http.Handle("/api/doc/notify", handlers.DocNotifyHandler{context})
	http.Handle("/api/doc/transfer", handlers.DocTransferHandler{context})

	// 默认情况下的文档预览页面，提示：可以提交文档转码请求或者直接下载
	http.Handle("/doc/viewer/", handlers.DocViewerHandler{context})
	http.Handle("/ori/message/", handlers.OriMessageHandler{context})

	// 其它请求走静态文件
	http.Handle("/", http.FileServer(http.Dir(config.Dirs.Base)))
	context.GetLogger().Info("Server started http://localhost:" + strconv.Itoa(config.Http.Port))
	http.ListenAndServe(":"+strconv.Itoa(config.Http.Port), nil)
}
