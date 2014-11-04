package backend

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"path"
	"time"

	"../models"
)

var emailDateMap map[string]time.Time

// 启动 backend 服务
func Run(config *models.ServerConfig) {
	// 尝试从磁盘恢复  uidl -> Date 的映射关系
	data, err := ioutil.ReadFile(path.Join(config.BaseDir, ".edm.json"))
	if err != nil {
		log.Println(err)
	} else {
		err = json.Unmarshal(data, &emailDateMap)
		if err != nil {
			log.Println(err)
		}
	}

	if emailDateMap == nil {
		emailDateMap = make(map[string]time.Time)
		log.Println("Init Email Date Index")
	} else {
		log.Println("Recovery Email Date Index from .edm.json")
	}

	// 开始启动服务
	runInternal(config, time.Now())

	var tick = config.Pop3.Interval * time.Second
	for now := range time.Tick(tick) {
		runInternal(config, now)
	}
}

func runInternal(config *models.ServerConfig, t time.Time) {
	var err = Receiver(config)
	if err != nil {
		log.Println(err)
	}
	fmt.Println()
}
