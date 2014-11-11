package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/textproto"
	"os"
	"path"
	"strings"

	cf "../v2/config"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	var configPtr = flag.String("config", "config.json", "The config file path")
	flag.Parse()

	config, err := cf.NewConfig(*configPtr)
	if err != nil {
		fmt.Fprintf(os.Stderr, "\nUsage of %s:\n", os.Args[0])
		flag.PrintDefaults()
		return
	}

	var rawDir = path.Join(config.BaseDir, "raw")
	fileInfos, err := ioutil.ReadDir(rawDir)
	if err != nil {
		log.Panic(err)
	}

	var subjects = make([]string, 0)
	for _, item := range fileInfos {
		if item.IsDir() {
			continue
		}

		if !strings.HasSuffix(item.Name(), ".txt") {
			continue
		}

		raw, err := ioutil.ReadFile(path.Join(rawDir, item.Name()))
		if err != nil {
			log.Fatal(err)
		}

		var idx = bytes.Index(raw, []byte("\n\n"))

		if idx == -1 {
			idx = len(raw)
		}

		reader := textproto.NewReader(bufio.NewReader(bytes.NewReader(raw[0:idx])))
		header, err := reader.ReadMIMEHeader()
		if header == nil || len(header) <= 0 {
			continue
		}

		subjects = append(subjects, header.Get("Subject"))
	}

	formated, err := json.MarshalIndent(subjects, "", "  ")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(formated))
}
