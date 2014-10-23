package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"
	"runtime/pprof"
	"strconv"

	"./base"
	"./handlers"
	"./web"
)

func main() {
	var configfile = flag.String("config", "config.yml", "The config file path")
	var cpuprofile = flag.String("cpuprofile", "", "write cpu profile to file")

	flag.Parse()

	if *cpuprofile != "" {
		f, err := os.Create(*cpuprofile)
		if err != nil {
			panic(err)
		}
		pprof.StartCPUProfile(f)
		defer pprof.StopCPUProfile()
	}

	config, err := base.GetConfig(*configfile)
	if err != nil {
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
	http.Handle("/api/mail/add_star", handlers.AddStarHandler{context})
	http.Handle("/api/mail/remove_star", handlers.RemoveStarHandler{context})
	http.Handle("/api/mail/delete", handlers.MailDeleteHandler{context})
	http.Handle("/api/mail/post", handlers.MailPostHandler{context})

	http.Handle("/api/thread/list", handlers.ThreadListHandler{context})
	http.Handle("/api/thread/read", handlers.ThreadReadHandler{context})

	http.Handle("/api/labels", handlers.MailLabelsHandler{context})
	http.Handle("/api/contacts", handlers.ContactsListHandler{context})

	// pcs授权之后的的回掉函数
	http.Handle("/api/pcs/oauth_redirect", handlers.PcsOAuthRedirectHandler{context})

	// 文档转化成功之后的wurl调用
	// http.Handle("/api/doc/feedback", handlers.DocFeedbackHandler{context})
	// http.Handle("/api/doc/notify", handlers.DocNotifyHandler{context})
	// http.Handle("/api/doc/transfer", handlers.DocTransferHandler{context})

	// 默认情况下的文档预览页面，提示：可以提交文档转码请求或者直接下载
	http.Handle("/doc/viewer/", handlers.DocViewerHandler{context})
	http.Handle("/ori/message/", handlers.OriMessageHandler{context})

	// 文件和图片上传的功能
	http.Handle("/api/upload/controller", handlers.UploadControllerHandler{context})

	// 其它请求走静态文件
	http.Handle("/", http.FileServer(http.Dir(config.Dirs.Base)))
	context.GetLogger().Info("Server started http://localhost:" + strconv.Itoa(config.Http.Port))
	http.ListenAndServe(":"+strconv.Itoa(config.Http.Port), nil)
}
