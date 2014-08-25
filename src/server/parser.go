package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"

	"./base"
)

func Usage() {
	fmt.Fprintf(os.Stderr, "Usage of %s:\n", os.Args[0])
	flag.PrintDefaults()
}

var (
	// kDownloadDir = "test/downloads"
	kDownloadDir = "/Volumes/HDD/Users/leeight/local/leeight.github.com/email-client/test/downloads"
)

func main() {
	// 参数解析
	rawPtr := flag.String("raw", "raw.txt", "The raw file path")
	flag.Parse()

	if *rawPtr == "" {
		Usage()
		return
	}

	raw, _ := ioutil.ReadFile(*rawPtr)
	email, err := base.CreateMail(raw, kDownloadDir)
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("Id = %d\n", email.Id)
	log.Printf("Subject = %s\n", email.Subject)
	log.Printf("To = %s\n", email.To)
	log.Printf("Cc = %s\n", email.Cc)
	log.Printf("Bcc = %s\n", email.Bcc)
	log.Printf("ReplyTo = %s\n", email.ReplyTo)
	log.Printf("Date = %s\n", email.Date)
	// log.Printf("Message = %s\n", email.Message)
	log.Printf("Status = %d\n", email.Status)

	ioutil.WriteFile("body.html", []byte(email.Message), 0644)

}
