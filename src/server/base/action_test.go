package base_test

import (
	"database/sql"
	"log"
	"testing"

	"../base"
)

func getDB() *sql.DB {
	db, err := sql.Open("sqlite3", "../test.db")
	if err != nil {
		log.Fatal(err)
		return nil
	}
	db.Exec(`
    DROP TABLE IF EXISTS tags;
    DROP TABLE IF EXISTS mail_tags;
    CREATE TABLE tags (
      id INTEGER NOT NULL PRIMARY KEY,
      name VARCHAR(512)
    );
    CREATE TABLE mail_tags (
      id INTEGER NOT NULL PRIMARY KEY,
      mid INTEGER,
      tid INTEGER
    );
  `)

	return db
}

func TestLabelAction(t *testing.T) {
	db := getDB()
	defer db.Close()

	email := base.EMail{Id: 1}
	label := "Hello World"

	err := email.AddLabel(label, db)
	if err != nil {
		t.Error(err)
	}

	var tagId int
	var tagName string
	err = db.QueryRow("SELECT id, name FROM tags WHERE name = ?", label).Scan(&tagId, &tagName)
	if err != nil {
		t.Error(err)
	}

	if tagName != label {
		t.Error(tagName + " != " + label)
	}

	// mail_tags的更新是否正确呢？
	var mailTagId int
	err = db.QueryRow("SELECT id FROM mail_tags WHERE mid = ? AND tid = ?",
		email.Id, tagId).Scan(&mailTagId)
	if err != nil {
		t.Error(err)
	}
	if mailTagId <= 0 {
		t.Error("Mail Tag Id", mailTagId, "should greater than 0.")
	}

	// mail_tags的数据不能重复吧
	err = email.AddLabel(label, db)
	if err != nil {
		t.Error(err)
	}
	var mailTagCount int
	err = db.QueryRow("SELECT COUNT(id) FROM mail_tags WHERE mid = ? AND tid = ?",
		email.Id, tagId).Scan(&mailTagCount)
	if err != nil {
		t.Error(err)
	}
	if mailTagCount > 1 {
		t.Error("Mail Tag Count should not greater than 1, but now is", mailTagCount)
	}

	// Tag不能重复
	email2 := base.EMail{Id: 2}
	email2.AddLabel(label, db)

	var tagCount int
	err = db.QueryRow("SELECT COUNT(id) FROM tags WHERE name = ?", label).Scan(&tagCount)
	if err != nil {
		t.Error(err)
	}
	if tagCount != 1 {
		t.Error("Tag Should not duplicated, but", label, "count is", tagCount)
	}
}
