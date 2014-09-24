package main

import (
	"bytes"
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path"
	"regexp"
	"strings"

	"../base"
	"../net/mail"
)

func getReferences(msg *mail.Message) string {
	var references []string
	re := regexp.MustCompile("[<>]")
	for _, ref := range regexp.MustCompile(`[\s,]+`).Split(msg.Header.Get("References"), -1) {
		ref = re.ReplaceAllString(ref, "")
		if ref != "" {
			references = append(references, ref)
		}
	}

	// If both headers exist, take the first thing in the In-Reply-To header
	// that looks like a Message-ID, and append it to the References header.
	ss := regexp.MustCompile("<([^<>]+)>").FindStringSubmatch(msg.Header.Get("In-Reply-To"))
	if len(ss) > 0 {
		for _, ref := range references {
			if ref == ss[1] && ss[1] != "" {
				// 已经存在了，不需要加入新的了
				return strings.Join(references, ",")
			}
		}

		// 不存在，追加新的进去
		references = append(references, ss[1])
	}

	return strings.Join(references, ",")
}

type simpleHeader struct {
	MsgID string
	Refs  string
}

// 扫描目录，解析邮件，得到相应的信息
func getAllMessages(rawDir string) map[string]*simpleHeader {
	fi, err := ioutil.ReadDir(rawDir)
	if err != nil {
		log.Fatal(err)
	}

	headers := make(map[string]*simpleHeader)
	for _, file := range fi {
		if file.IsDir() {
			continue
		}

		raw, err := ioutil.ReadFile(path.Join(rawDir, file.Name()))
		if err != nil {
			log.Fatal(err)
		}

		msg, err := mail.ReadMessage(bytes.NewBuffer(raw))
		if err != nil {
			log.Fatal(err)
		}

		// 从邮件中开始解析所需要的数据
		msgid := regexp.MustCompile("[<>]").ReplaceAllString(msg.Header.Get("Message-ID"), "")
		if msgid == "" {
			continue
		}
		refs := getReferences(msg)

		key := strings.Replace(file.Name(), ".txt", "", -1)

		headers[key] = &simpleHeader{msgid, refs}
		fmt.Printf("%s\n", file.Name())
	}

	return headers
}

func main() {
	config, err := base.GetConfig("config.yml")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Usage of %s:\n", os.Args[0])
		return
	}
	headers := getAllMessages(config.RawDir())

	db, err := sql.Open("sqlite3", config.DbPath())
	if err != nil {
		log.Panic(err)
	}
	defer db.Close()

	tx, err := db.Begin()
	if err != nil {
		log.Panic(err)
	}

	stmt, err := tx.Prepare("UPDATE `mails` SET `msg_id` = ?, `refs` = ? WHERE `uidl` = ?")
	if err != nil {
		log.Panic(err)
	}
	defer stmt.Close()

	for uidl, hdr := range headers {
		_, err = stmt.Exec(hdr.MsgID, hdr.Refs, uidl)
		if err != nil {
			log.Panic(err)
		}
		fmt.Printf("%s => %s %s\n", uidl, hdr.MsgID, hdr.Refs)
	}

	err = tx.Commit()
	if err != nil {
		log.Panic(err)
	}
}
