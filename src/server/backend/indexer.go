package backend

import (
	"fmt"
	"io/ioutil"
	"net/http"

	"../web"
)

var indexerChannel = make(chan uint64, 20)

func AddToIndexer(ctx web.Context) {
	for {
		id := <-indexerChannel
		addToIndexerImpl(ctx, id)
	}
}

func addToIndexerImpl(ctx web.Context, id uint64) {
	config := ctx.GetConfig()
	log := ctx.GetLogger()

	// 构造请求地址
	searcherUrl := fmt.Sprintf("http://localhost:%d/add_document?id=%d",
		config.Service.Searcher.Port, id)

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
