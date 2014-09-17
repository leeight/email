package main

import (
	"github.com/huichen/wukong/engine"
	"github.com/huichen/wukong/types"
	"log"
)

var (
	// searcher是协程安全的
	searcher = engine.Engine{}
)

func main() {
	// 初始化
	searcher.Init(types.EngineInitOptions{
		SegmenterDictionaries: "/Volumes/HDD/Users/leeight/local/leeight.github.com/gopath/src/github.com/huichen/wukong/data/dictionary.txt"})
	defer searcher.Close()

	// 将文档加入索引
	searcher.IndexDocument(0, types.DocumentIndexData{Content: "此次百度收购将成中国互联网最大并购"})
	searcher.IndexDocument(1, types.DocumentIndexData{Content: "百度宣布拟全资收购91无线业务"})
	searcher.IndexDocument(2, types.DocumentIndexData{Content: "百度是中国最大的搜索引擎"})

	// 等待索引刷新完毕
	searcher.FlushIndex()

	// 搜索输出格式见types.SearchResponse结构体
	log.Print(searcher.Search(types.SearchRequest{Text: "百度中国"}))
}
