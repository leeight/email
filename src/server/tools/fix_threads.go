package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"path"
	"regexp"
	"strings"

	"../RFC2047"
	"../net/mail"
	"../thread"
)

const (
	kRawDir = "../../data/baidu.com/liyubei/raw"
)

func getDeletedMails() map[string]bool {
	raw, err := ioutil.ReadFile("deleted_mails.json")
	if err != nil {
		log.Fatal(err)
	}

	var deletedMails []string
	err = json.Unmarshal(raw, &deletedMails)
	if err != nil {
		log.Fatal(err)
	}

	m := make(map[string]bool)
	for _, uidl := range deletedMails {
		m[uidl] = true
	}

	return m
}

// 扫描目录，解析邮件，得到相应的信息
func getAllMessages() []*thread.Message {
	fi, err := ioutil.ReadDir(kRawDir)
	if err != nil {
		log.Fatal(err)
	}

	deletedMails := getDeletedMails()

	re := regexp.MustCompile("[<>]")
	messages := make([]*thread.Message, 0)
	for _, file := range fi {
		if file.IsDir() {
			continue
		}

		raw, err := ioutil.ReadFile(path.Join(kRawDir, file.Name()))
		if err != nil {
			log.Fatal(err)
		}

		msg, err := mail.ReadMessage(bytes.NewBuffer(raw))
		if err != nil {
			log.Fatal(err)
		}

		// 从邮件中开始解析所需要的数据
		id := re.ReplaceAllString(msg.Header.Get("Message-ID"), "")
		if id == "" {
			continue
		}

		references := make([]string, 0)
		for _, ref := range regexp.MustCompile(`\s+`).Split(msg.Header.Get("References"), -1) {
			ref = re.ReplaceAllString(ref, "")
			if ref != "" {
				references = append(references, ref)
			}
		}

		// If both headers exist, take the first thing in the In-Reply-To header
		// that looks like a Message-ID, and append it to the References header.
		ss := regexp.MustCompile("<([^<>]+)>").FindStringSubmatch(msg.Header.Get("In-Reply-To"))
		if len(ss) > 0 {
			references = append(references, ss[1])
		}

		subject := RFC2047.Decode(msg.Header.Get("Subject"))

		uidl := strings.Replace(file.Name(), ".txt", "", -1)

		if _, ok := deletedMails[uidl]; ok {
			continue
		}

		messages = append(messages, &thread.Message{subject, id, uidl, references})
		fmt.Printf("%s\n", file.Name())
	}

	s, _ := json.MarshalIndent(messages, "", "    ")
	ioutil.WriteFile("messages.json", s, 0644)

	return messages
}

func readAllMessages() []*thread.Message {
	raw, err := ioutil.ReadFile("messages.json")
	if err != nil {
		log.Fatal(err)
	}

	var messages []*thread.Message
	err = json.Unmarshal(raw, &messages)
	if err != nil {
		log.Fatal(err)
	}

	return messages
}

func main() {
	messages := readAllMessages()
	// messages := getAllMessages()
	// fmt.Printf("%d\n", len(messages))

	// messages := make([]*thread.Message, 0)
	thread := thread.NewThread(messages)
	// msgid := "AE0EBE28-8122-432A-8F1E-BE2C40EA55AE@designdrumm.com"
	// msgid := "221EDC891526FF488A73B41BEE14085CD3C24B@M1-MAIL-MBX01.internal.baidu.com"
	// msgid := "036F131D-3526-4E82-894C-50A36895D070@coffeeonmars.com"
	roots := thread.GetRoots()
	for subject, container := range thread.GroupBySubject(roots) {
		fmt.Printf("%s\n", subject)
		messages := container.FlattenChildren()
		for _, msg := range messages {
			fmt.Printf("    %s => %s\n", msg.Uidl, msg.Subject)
		}
	}
}
