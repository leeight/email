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
	"strconv"
	"strings"

	"github.com/huichen/wukong/engine"
	"github.com/huichen/wukong/types"
	// "github.com/microcosm-cc/bluemonday"

	"./base"
	"./net/mail"
	"./web"
)

const (
	SecondsInADay     = 86400
	MaxTokenProximity = 2
)

var (
	searcher = engine.Engine{}
)

/*******************************************************************************
    索引
*******************************************************************************/
func indexAllMails(db *sql.DB) {
	defer db.Close()

	rows, err := db.Query("SELECT id, `from`, `to`, `cc`, `subject`, `date` FROM mails WHERE `is_delete` != 1")
	if err != nil {
		log.Fatal(err)
	}

	log.Print("添加索引")

	// 删除所有的html标签，只保留文本
	// sanitizer := bluemonday.Policy{}

	count := 0
	for rows.Next() {
		count++

		email := base.EMail{}
		rows.Scan(
			&email.Id, &email.From, &email.To,
			&email.Cc, &email.Subject, &email.Date,
		)
		addToIndexer(&email)
	}

	searcher.FlushIndex()
	log.Printf("索引了%d封邮件\n", count)
}

func addToIndexer(email *base.EMail) {
	attrs := make([]string, 0)

	from, err := mail.ParseAddress(email.From)
	if err != nil {
		return
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

	log.Printf("%v, %d", email.Date, email.Date.Unix())
	searcher.IndexDocument(email.Id, types.DocumentIndexData{
		Content: strings.Join(attrs, "\x00") + "\x00" +
			email.Subject + "\x00",
		// sanitizer.Sanitize(email.Message),
		Fields: MailScoringFields{
			// email.Date的格式是 2013-09-17 12:22:45
			Timestamp:   email.Date.Unix(),
			IsCanonical: strings.Index(from.Address, "@baidu.com") != -1,
		},
	})
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
	output[0] = float32(msf.Timestamp / 5410243629)
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
	ids := make([]string, len(output.Docs))
	for idx, doc := range output.Docs {
		ids[idx] = strconv.FormatUint(doc.DocId, 10)
	}
	response, _ := json.Marshal(&base.SearcherJsonRPCResponse{
		Ids:    ids,
		Tokens: output.Tokens,
	})

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	io.WriteString(w, string(response))
}

type AddDocumentHandler struct {
	Context web.Context
}

func (h AddDocumentHandler) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	db := h.Context.GetDb()
	defer db.Close()

	id := req.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "invalid request.", http.StatusBadRequest)
		return
	}

	email := base.EMail{}
	sql := "SELECT id, `from`, `to`, `cc`, `subject`, `date` FROM mails WHERE `is_delete` != 1 AND `id` = ?"
	err := db.QueryRow(sql, id).Scan(
		&email.Id, &email.From, &email.To,
		&email.Cc, &email.Subject, &email.Date,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	addToIndexer(&email)

	io.WriteString(w, `{"success":true}`)
}

/*******************************************************************************
	主函数
*******************************************************************************/
func main() {
	// 解析命令行参数
	configPtr := flag.String("config", "config.yml", "The config file path")
	flag.Parse()

	config, err := base.GetConfig(*configPtr)
	if err != nil {
		log.Fatal(err)
	}
	context := web.NewContext(config)

	// 初始化
	gob.Register(MailScoringFields{})

	searcherDataDir := config.Service.Searcher.Datadir
	log.Printf("DataDir = [%s]\n", searcherDataDir)

	searcher.Init(types.EngineInitOptions{
		SegmenterDictionaries: path.Join(searcherDataDir, "/dictionary.txt"),
		StopTokenFile:         path.Join(searcherDataDir, "/stop_tokens.txt"),
		IndexerInitOptions: &types.IndexerInitOptions{
			IndexType: types.LocationsIndex,
		},
		UsePersistentStorage:    true,
		PersistentStorageFolder: "data/baidu.com/liyubei/db/searcher",
	})

	// 索引
	go indexAllMails(context.GetDb())

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
	http.Handle("/add_document", AddDocumentHandler{context})
	// http.Handle("/del_document", DelDocumentHandler{context})
	port := strconv.Itoa(config.Service.Searcher.Port)

	log.Printf("服务器启动 localhost:%s\n", port)
	http.ListenAndServe("localhost:"+port, nil)
}
