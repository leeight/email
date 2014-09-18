package main

import (
	"bytes"
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path"
	"strings"

	"../base"
)

func fix(fname, modtime string) {
	raw, _ := ioutil.ReadFile(fname)
	if bytes.Index(raw, []byte("Date:")) == -1 {
		date := []byte(fmt.Sprintf("Date: %s\r\n", modtime))
		ioutil.WriteFile(fname, append(date[:], raw[:]...), 0644)
		fmt.Printf("[FAIL]: %s\n", fname)
	} else {
		fmt.Printf("[PASS]: %s\n", fname)
	}
}

func main() {
	config, err := base.GetConfig("config.yml")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Usage of %s:\n", os.Args[0])
		return
	}

	db, err := sql.Open("sqlite3", config.DbPath())
	if err != nil {
		log.Panic(err)
	}
	defer db.Close()

	db.Exec("DELETE FROM `mails` WHERE `is_sent` = 1")

	sentMailDir := path.Join(config.RawDir(), "sent")

	fs, _ := ioutil.ReadDir(sentMailDir)
	for _, item := range fs {
		if item.IsDir() {
			continue
		}

		fname := path.Join(sentMailDir, item.Name())
		fix(fname, item.ModTime().Format("Mon, 2 Jan 2006 15:04:05 -0700"))

		uidl := strings.Replace(item.Name(), ".txt", "", -1)
		raw, _ := ioutil.ReadFile(fname)
		email, err := base.SaveMail(raw, uidl, config)
		if err != nil {
			log.Fatal(err)
			continue
		}

		// 保存到数据库
		email.Uidl = uidl
		email.IsSent = 1
		email.IsRead = 1
		// email.Date = time.Now()
		email.Id, err = email.Store(db)
		if err != nil {
			log.Fatal(err)
		}
	}
}
