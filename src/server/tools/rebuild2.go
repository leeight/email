package main

import (
	"flag"
	"io/ioutil"
	"log"
	"os"
	"path"
	"strings"

	"../base"
)

func main() {
	var rawDir = flag.String("rawDir", "", "The raw directory.")
	flag.Parse()

	if *rawDir == "" {
		flag.PrintDefaults()
		return
	}

	fileInfos, err := ioutil.ReadDir(*rawDir)
	if err != nil {
		log.Panic(err)
	}

	for _, item := range fileInfos {
		if item.IsDir() {
			continue
		}

		if !strings.HasSuffix(item.Name(), ".txt") {
			continue
		}

		raw, err := ioutil.ReadFile(path.Join(*rawDir, item.Name()))
		if err != nil {
			log.Fatal(err)
		}

		uidl := strings.Replace(item.Name(), ".txt", "", -1)
		downloadDir := path.Join(path.Dir(*rawDir), "downloads", uidl)
		prefix := path.Join("downloads", uidl)
		os.MkdirAll(downloadDir, 0755)
		_, err = base.NewMail(raw, downloadDir, prefix)
		if err != nil {
			log.Printf("%s, %s\n", item.Name(), err)
		}
	}
}
