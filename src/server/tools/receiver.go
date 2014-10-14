package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path"

	pop3 "github.com/bytbox/go-pop3"
)

func main() {
	client, err := pop3.DialTLS("pop.126.com:995")

	if err != nil {
		log.Fatal(err)
	}
	defer client.Quit()

	err = client.Auth("leeight", "zhenxi@^@")
	if err != nil {
		log.Fatal(err)
	}

	// 开始拉数据
	msgs, _, err := client.ListAll()
	if err != nil {
		log.Fatal(err)
	}

	uidls, err := client.UidlAll()
	for msgid, msg := range msgs {
		uidl := uidls[msg]

		dst := path.Join("126.com", uidl+".txt")
		if _, err := os.Stat(dst); os.IsNotExist(err) {
			raw, err := client.Retr(msg)
			if err != nil {
				log.Printf("ERROR: %d -> %s\n", msgid, err)
				continue
			}

			ioutil.WriteFile(dst, []byte(raw), 0644)
			log.Printf("%d -> %s\n", msgid, uidl)
		}
	}

	fmt.Println()
}
