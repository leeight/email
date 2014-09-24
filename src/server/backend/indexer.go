package backend

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"../base"
	"../web"
)

var indexerChannel = make(chan *base.EMail, 20)

type messageType struct {
	Id      uint64 `json:"id"`
	Uidl    string `json:"uidl"`
	Subject string `json:"subject"`
	Date    int64  `json:"date"`
}

func AddToIndexer(ctx web.Context) {
	for {
		email := <-indexerChannel
		doPut(ctx, email)
	}
}

func doPut(ctx web.Context, email *base.EMail) {
	log := ctx.GetLogger()

	var msg = messageType{
		email.Id, email.Uidl, email.Subject, email.Date.Unix(),
	}

	url := fmt.Sprintf("http://localhost:9200/baidu/mails/%d",
		email.Id)
	client := &http.Client{}
	data, _ := json.Marshal(msg)
	request, err := http.NewRequest("PUT", url, bytes.NewReader(data))
	if err != nil {
		log.Warning("%s", err.Error())
		return
	}

	response, err := client.Do(request)
	if err != nil {
		log.Warning("%s", err.Error())
		return
	}
	defer response.Body.Close()

	contents, err := ioutil.ReadAll(response.Body)
	if err != nil {
		log.Warning("%s", err.Error())
		return
	}

	log.Info("%s, %v, %q\n", url, string(data), string(contents))
}

// func addToIndexerImpl(ctx web.Context, email *base.EMail) {
// 	config := ctx.GetConfig()
// 	log := ctx.GetLogger()

// 	// 构造请求地址
// 	searcherUrl := fmt.Sprintf("http://localhost:%d/add_document?id=%d",
// 		config.Service.Searcher.Port, email.Id)

// 	// 发起请求
// 	resp, err := http.Get(searcherUrl)
// 	if err != nil {
// 		log.Warning("%s", err.Error())
// 		return
// 	}
// 	defer resp.Body.Close()
// 	body, err := ioutil.ReadAll(resp.Body)
// 	if err != nil {
// 		log.Warning("%s", err.Error())
// 		return
// 	}

// 	if string(body) != `{"success":true}` {
// 		log.Warning("%s", string(body))
// 		return
// 	}
// }
