package backend

import (
	"fmt"
	"log"
	"time"

	"../models"
)

// 启动 backend 服务
func Run(config *models.ServerConfig) {
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
