package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"../base"
	"../web"
)

// http://localhost:9200/baidu/mails/_search\?q\=%E6%97%A5%E5%BF%97\&pretty
// curl -X PUT http://localhost:9200/baidu/mails/3 -d '{"subject": "Re: 相互检查中间页日志"}'

type messageType struct {
	ID      int    `json:"id"`
	Uidl    int    `json:"uidl"`
	Subject string `json:"subject"`
	Date    int64  `json:"date"`
}

func doPut(msg *messageType) {
	url := fmt.Sprintf("http://localhost:9200/baidu/mails/%d",
		msg.ID)
	client := &http.Client{}
	data, _ := json.Marshal(msg)
	request, err := http.NewRequest("PUT", url, bytes.NewReader(data))
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("%s, %v\n", url, string(data))

	response, err := client.Do(request)
	if err != nil {
		log.Fatal(err)
	}

	defer response.Body.Close()
	contents, err := ioutil.ReadAll(response.Body)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("%q\n", string(contents))
}

// 调用elasticsearch的api，索引文档
func main() {
	config, err := base.GetConfig("config.yml")
	if err != nil {
		log.Fatal(err)
	}

	ctx := web.NewContext(config)
	db := ctx.GetDb()
	defer db.Close()

	rows, err := db.Query("SELECT `id`, `uidl`, `subject`, `date` FROM `mails` WHERE `is_delete` != 1")
	if err != nil {
		log.Fatal(err)
	}

	for rows.Next() {
		var msg messageType
		var date time.Time
		err = rows.Scan(&msg.ID, &msg.Uidl, &msg.Subject, &date)
		msg.Date = date.Unix()
		if err != nil {
			log.Fatal(err)
		}
		doPut(&msg)
	}
}
