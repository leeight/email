package main

import (
	"database/sql"
	"encoding/gob"
	"encoding/json"
	"flag"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path"
	"reflect"
	"strings"
	"time"

	"github.com/huichen/wukong/engine"
	"github.com/huichen/wukong/types"
	"github.com/microcosm-cc/bluemonday"

	"./base"
	"./net/mail"
	"./web"
)

const (
	SecondsInADay     = 86400
	MaxTokenProximity = 2
	WukongHome        = "/Volumes/HDD/Users/leeight/local/leeight.github.com/gopath/src/github.com/huichen/wukong"
)

var (
	searcher = engine.Engine{}
	// wbs      = map[uint64]EMail{}
)

type EMail struct {
	Id      uint64 `json:"id"`
	Subject string `json:"subject"`
	From    string `json:"from"`
	To      string `json:"to"`
	Cc      string `json:"cc"`
	Message string `json:"message"`
	Date    string `json:"date"`
	// Timestamp    uint64 `json:"timestamp"`
	// UserName     string `json:"user_name"`
	// RepostsCount uint64 `json:"reposts_count"`
	// Text         string `json:"text"`
}

/*******************************************************************************
    索引
*******************************************************************************/
func indexMails(db *sql.DB) {
	defer db.Close()

	rows, err := db.Query("SELECT id, `from`, `to`, `cc`, `subject`, `message`, `date` FROM mails WHERE `is_delete` != 1")
	if err != nil {
		log.Fatal(err)
	}

	log.Print("添加索引")

	// 删除所有的html标签，只保留文本
	sanitizer := bluemonday.Policy{}

	count := 0
	for rows.Next() {
		count++

		email := EMail{}
		rows.Scan(&email.Id, &email.From, &email.To,
			&email.Cc, &email.Subject, &email.Message,
			&email.Date)

		attrs := make([]string, 0)

		from, err := mail.ParseAddress(email.From)
		if err != nil {
			continue
		}
		attrs = append(attrs, "from:"+from.Address)

		addresses, err := mail.ParseAddressList(email.To)
		if err == nil {
			for _, address := range addresses {
				attrs = append(attrs, "to:"+address.Address)
			}
		}

		addresses, err = mail.ParseAddressList(email.Cc)
		if err == nil {
			for _, address := range addresses {
				attrs = append(attrs, "cc:"+address.Address)
			}
		}

		date, _ := time.Parse("2006-01-02 15:04:05", email.Date)

		searcher.IndexDocument(email.Id, types.DocumentIndexData{
			Content: strings.Join(attrs, "\x00") + "\x00" +
				email.Subject + "\x00" +
				sanitizer.Sanitize(email.Message),
			Fields: MailScoringFields{
				// email.Date的格式是 2013-09-17 12:22:45
				Timestamp:   date.Unix(),
				IsCanonical: strings.Index(from.Address, "@baidu.com") != -1,
			},
		})
	}

	searcher.FlushIndex()
	log.Printf("索引了%d封邮件\n", count)
}

/*******************************************************************************
    评分
    1. 时间，越新的越靠前
    2. 发件人是否是百度的，如果是百度的，权重高于非百度的
*******************************************************************************/
type MailScoringFields struct {
	Timestamp   int64
	IsCanonical bool
}

type MailScoringCriteria struct {
}

func (criteria MailScoringCriteria) Score(
	doc types.IndexedDocument, fields interface{}) []float32 {
	if reflect.TypeOf(fields) != reflect.TypeOf(MailScoringFields{}) {
		return []float32{}
	}
	msf := fields.(MailScoringFields)
	output := make([]float32, 2)
	// if doc.TokenProximity > MaxTokenProximity {
	// 	output[0] = 1.0 / float32(doc.TokenProximity)
	// } else {
	// 	output[0] = 1.0
	// }
	output[0] = float32(msf.Timestamp / (SecondsInADay * 7))
	if msf.IsCanonical {
		output[1] = 1.0
	} else {
		output[1] = 0.0
	}
	return output
}

/*******************************************************************************
    JSON-RPC
*******************************************************************************/
type JsonResponse struct {
	EMails []*EMail `json:"emails"`
}

type JsonRpcHandler struct {
	Context web.Context
}

func (h JsonRpcHandler) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	db := h.Context.GetDb()
	defer db.Close()

	query := req.URL.Query().Get("query")
	output := searcher.Search(types.SearchRequest{
		Text: query,
		RankOptions: &types.RankOptions{
			ScoringCriteria: &MailScoringCriteria{},
			OutputOffset:    0,
			MaxOutputs:      100,
		},
	})

	// 整理为输出格式
	emails := []*EMail{}
	for _, doc := range output.Docs {
		email := EMail{Id: doc.DocId}
		err := db.QueryRow("SELECT `from`, `to`, `cc`, `subject` FROM mails WHERE id = ?",
			email.Id).Scan(&email.From, &email.To,
			&email.Cc, &email.Subject)
		if err != nil {
			log.Fatal(err)
		}

		for _, t := range output.Tokens {
			email.Subject = strings.Replace(email.Subject, t, "<strong>"+t+"</strong>", -1)
		}

		emails = append(emails, &email)
	}
	response, _ := json.Marshal(&JsonResponse{EMails: emails})

	w.Header().Set("Content-Type", "application/json")
	io.WriteString(w, string(response))
}

/*******************************************************************************
	主函数
*******************************************************************************/
func main() {
	// 解析命令行参数
	flag.Parse()

	// 初始化
	gob.Register(MailScoringFields{})
	searcher.Init(types.EngineInitOptions{
		SegmenterDictionaries: path.Join(WukongHome, "/data/dictionary.txt"),
		StopTokenFile:         path.Join(WukongHome, "/data/stop_tokens.txt"),
		IndexerInitOptions: &types.IndexerInitOptions{
			IndexType: types.LocationsIndex,
		},
		UsePersistentStorage:    true,
		PersistentStorageFolder: "db",
	})
	// wbs = make(map[uint64]Weibo)

	config, err := base.GetConfig("config.yml")
	if err != nil {
		log.Fatal(err)
	}
	context := web.NewContext(config)

	// 索引
	go indexMails(context.GetDb())

	// 捕获ctrl-c
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		for _ = range c {
			log.Print("捕获Ctrl-c，退出服务器")
			searcher.Close()
			os.Exit(0)
		}
	}()

	http.Handle("/json", JsonRpcHandler{context})
	// http.Handle("/", http.FileServer(http.Dir("static")))
	log.Print("服务器启动")
	http.ListenAndServe("localhost:9090", nil)
}
