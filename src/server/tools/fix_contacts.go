package main

// 读取数据库中mails的数据，修复contacts表的数据

import (
	"../base"
	"../net/mail"
	"../web"
)

type Contact struct {
	Count int
	Email *mail.Address
}

type contactMap map[string]*Contact

func main() {
	config, _ := base.GetConfig("config.yml")
	context := web.NewContext(config)

	log := context.GetLogger()
	db := context.GetDb()
	defer db.Close()

	contacts := make(contactMap)

	rows, _ := db.Query("SELECT `from`, `to`, `cc` FROM mails")
	for rows.Next() {
		var from string
		var to string
		var cc string
		rows.Scan(&from, &to, &cc)

		c, err := mail.ParseAddress(from)
		if err == nil {
			if item, ok := contacts[c.Address]; !ok {
				contacts[c.Address] = &Contact{1, c}
			} else {
				item.Count++
			}
		}

		tcs, err := mail.ParseAddressList(to)
		if err == nil {
			for _, c := range tcs {
				if item, ok := contacts[c.Address]; !ok {
					contacts[c.Address] = &Contact{1, c}
				} else {
					item.Count++
				}
			}
		}

		ccs, err := mail.ParseAddressList(cc)
		if err == nil {
			for _, c := range ccs {
				if item, ok := contacts[c.Address]; !ok {
					contacts[c.Address] = &Contact{1, c}
				} else {
					item.Count++
				}
			}
		}
	}

	db.Exec(`
  DROP TABLE IF EXISTS contacts;
  CREATE TABLE contacts (
    id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(512),
    email VARCHAR(1024),
    count INTEGER
  );`)

	tx, _ := db.Begin()
	for _, c := range contacts {
		// 更新SQL
		tx.Exec("INSERT INTO contacts (`name`, `email`, `count`) VALUES (?, ?, ?)",
			c.Email.Name, c.Email.Address, c.Count)
	}
	err := tx.Commit()
	if err != nil {
		log.Warning("%v", err)
	} else {
		log.Info("Done.")
	}
}
