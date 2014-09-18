package backend

import (
	"fmt"
	"io/ioutil"
	"net/http"

	"../base"
	"../web"
)

var indexerChannel = make(chan *base.EMail, 20)

func AddToIndexer(ctx web.Context) {
	for {
		email := <-indexerChannel
		addToIndexerImpl(ctx, email)
	}
}

func addToIndexerImpl(ctx web.Context, email *base.EMail) {
	config := ctx.GetConfig()
	log := ctx.GetLogger()

	// 构造请求地址
	searcherUrl := fmt.Sprintf("http://localhost:%d/add_document?id=%d",
		config.Service.Searcher.Port, email.Id)

	// 发起请求
	resp, err := http.Get(searcherUrl)
	if err != nil {
		log.Warning("%s", err.Error())
		return
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Warning("%s", err.Error())
		return
	}

	if string(body) != `{"success":true}` {
		log.Warning("%s", string(body))
		return
	}
}
