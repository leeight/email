package main

import (
	"flag"
	"fmt"
	"os"
	"runtime/pprof"
	"time"

	"./backend"
	"./base"
	"./web"
)

func main() {
	var configfile = flag.String("config", "config.yml", "The config file path")
	// var initsqlfile = flag.String("initsql", "", "The init sql file path")
	var cpuprofile = flag.String("cpuprofile", "", "write cpu profile to file")

	flag.Parse()

	if *cpuprofile != "" {
		f, err := os.Create(*cpuprofile)
		if err != nil {
			panic(err)
		}
		pprof.StartCPUProfile(f)
		defer pprof.StopCPUProfile()
	}

	config, err := base.GetConfig(*configfile)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Usage of %s:\n", os.Args[0])
		flag.PrintDefaults()
		return
	}

	ctx := web.NewContext(config)

	// 检查数据库文件是否存在
	// backend.InitDatabase(ctx, *initsqlfile)

	// 先执行一次
	executor := backend.ReceiveRecentMails(ctx)
	executor(time.Now())

	// 初始化邮件线索的信息
	go backend.AddToThread(ctx)
	go backend.AddToIndexer(ctx)

	// 定时器启动
	interval := config.Pop3.GetInterval()
	for now := range time.Tick(interval * time.Second) {
		executor(now)
	}
}
