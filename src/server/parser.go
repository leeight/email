package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"

	"./base"
)

var (
	// kDownloadDir = "test/downloads"
	kDownloadDir = "/Volumes/HDD/Users/leeight/local/leeight.github.com/email-client/test/downloads"
)

func main() {
	// 参数解析
	rawPtr := flag.String("raw", "raw.txt", "The raw file path")
	flag.Parse()

	if *rawPtr == "" {
		fmt.Fprintf(os.Stderr, "Usage of %s:\n", os.Args[0])
		flag.PrintDefaults()
		return
	}

	raw, err := ioutil.ReadFile(*rawPtr)
	if err != nil {
		log.Panic(err)
	}

	email, err := base.NewMail(raw, kDownloadDir, "test/downloads")
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("Id = %d\n", email.Id)
	log.Printf("Subject = %s\n", email.Subject)
	log.Printf("From = %s\n", email.From)
	log.Printf("To = %s\n", email.To)
	log.Printf("Cc = %s\n", email.Cc)
	log.Printf("Bcc = %s\n", email.Bcc)
	log.Printf("ReplyTo = %s\n", email.ReplyTo)
	log.Printf("Date = %s\n", email.Date)
	log.Printf("Message = %s\n", email.Message)
	log.Printf("Message2 = %s\n", string(base.StripUnnecessaryTags([]byte(email.Message))))
	log.Printf("Status = %d\n", email.Status)

	ioutil.WriteFile("body.html", []byte(email.Message), 0644)

}
