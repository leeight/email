package main

// curl http://localhost:9200/baidu/mails/_search\?q\=subject:%E7%99%BE%E7%A7%91\&pretty

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

type messageType struct {
	Id      int    `json:"id"`
	Uidl    int    `json:"uidl"`
	Subject string `json:"subject"`
	Date    int64  `json:"date"`
}

type searchResultType struct {
	Took     int  `json:"took"`
	TimedOut bool `json:"timed_out"`
	Shards   struct {
		Total      int `json:"total"`
		Successful int `json:"successful"`
		Failed     int `json:"failed"`
	} `json:"_shards"`
	Hits struct {
		Total    int     `json:"total"`
		MaxScore float64 `json:"max_score"`
		Hits     []struct {
			Index  string      `json:"_index"`
			Type   string      `json:"_type"`
			Id     string      `json:"_id"`
			Score  float64     `json:"_score"`
			Source messageType `json:"_source"`
		} `json:"hits"`
	} `json:"hits"`
}

type searchRequestType struct {
	Query struct {
		Match struct {
			Subject string `json:"subject"`
		} `json:"match"`
	} `json:"query"`
	Highlight struct {
		Fields struct {
			Subject struct{} `json:"subject"`
		} `json:"fields"`
	} `json:"highlight"`
	From int `json:"from"`
	Size int `json:"size"`
}

func checkError(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	var queryptr = flag.String("query", "", "The query to search")
	var fromptr = flag.Int("from", 0, "The from value")
	var sizeptr = flag.Int("size", 10, "The limit value")

	flag.Parse()

	if *queryptr == "" {
		return
	}

	var host = "http://localhost:9200/baidu/mails/_search?pretty"

	var params searchRequestType
	params.Query.Match.Subject = *queryptr
	params.From = *fromptr
	params.Size = *sizeptr
	raw, _ := json.Marshal(params)

	resp, err := http.Post(host, "", bytes.NewReader(raw))
	checkError(err)

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	checkError(err)
	fmt.Printf("%v\n", string(body))

	var result searchResultType
	json.Unmarshal(body, &result)

	for _, item := range result.Hits.Hits {
		fmt.Printf("%f => %v\n", item.Score, item.Source)
	}
}
