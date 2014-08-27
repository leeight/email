package base_test

import (
	"bytes"
	"database/sql"
	"io/ioutil"
	"log"
	"path"
	"testing"

	_ "github.com/mattn/go-sqlite3"

	"../base"
	"../net/mail"
)

func readEMail(uidl string) (*base.EMail, error) {
	db, err := sql.Open("sqlite3", "../foo.db")
	if err != nil {
		log.Fatal(err)
		return nil, err
	}
	defer db.Close()

	stmt, err := db.Prepare(
		"SELECT " +
			"`id`, `uidl`, `from`, `to`, `cc`, `bcc`, " +
			"`reply_to`, `subject`, `date`, `message` " +
			"FROM mails " +
			"WHERE `uidl` = ?")
	if err != nil {
		log.Fatal(err)
		return nil, err
	}
	defer stmt.Close()

	var email base.EMail
	err = stmt.QueryRow(uidl).Scan(
		&email.Id,
		&email.Uidl,
		&email.From,
		&email.To,
		&email.Cc,
		&email.Bcc,
		&email.ReplyTo,
		&email.Subject,
		&email.Date,
		&email.Message)

	if err != nil {
		log.Fatal(err)
		return nil, err
	}

	return &email, nil
}

type testpair struct {
	rule     []string
	expected bool
}

var tests = []testpair{
	{[]string{"From", "Is", "huqiaoxin@baidu.com"}, true},
	{[]string{"From", "Is", "liyubei@baidu.com"}, false},
	{[]string{"To", "Contains", "tanghaiyang@baidu.com"}, true},
	{[]string{"To", "Contains", "zhengheng"}, true},
	{[]string{"To", "Contains", "chengang04"}, true},
	{[]string{"To", "Contains", "tianxiao@baidu.com"}, true},
	{[]string{"To", "Contains", "kongyue"}, true},
	{[]string{"To", "Contains", "wangchenggang01"}, true},
	{[]string{"To", "Contains", "guoyi01"}, true},
	{[]string{"To", "Contains", "biyingying"}, true},
	{[]string{"To", "Contains", "chujingbo"}, true},
	{[]string{"Cc", "Contains", "cuiyuhong"}, true},
	{[]string{"Cc", "Contains", "lakerchen"}, true},
	{[]string{"Cc", "Contains", "wuhaiyun"}, true},
	{[]string{"Cc", "Contains", "bdd-core"}, true},
	{[]string{"X-Has-Attach", "Is", "no"}, true},
	{[]string{"X-Has-Attach", "Is", "yes"}, false},
	{[]string{"X-Mailer", "Is", "Foxmail 7.0.1.92[cn]"}, true},
	{[]string{"X-MS-Exchange-Organization-AuthSource", "Is", "TC-MAIL-FE01.internal.baidu.com"}, true},
	// Re: 品牌项目review_140630
	{[]string{"Subject", "Is", "Re: 品牌项目review_140630"}, true},
	{[]string{"Subject", "Contains", "Re: 品牌项目review_140630"}, true},
	{[]string{"Subject", "Contains", "review_140630"}, true},
	{[]string{"SubjectOrBody", "Is", "Re: 品牌项目review_140630"}, true},
	{[]string{"SubjectOrBody", "Contains", "Re: 品牌项目review_140630"}, true},
	{[]string{"SubjectOrBody", "Contains", "review_140630"}, true},
	// 今天的会议纪要如下，请查收并注意自己后续Acti
	{[]string{"Body", "Is", "今天的会议纪要如下，请查收并注意自己后续Acti"}, false},
	{[]string{"Body", "Contains", "今天的会议纪要如下，请查收并注意自己后续Acti"}, true},
	{[]string{"Body", "Contains", "今天的会议纪要如下，请查收并注意自己后续Acti"}, true},
	{[]string{"SubjectOrBody", "Contains", "今天的会议纪要如下，请查收并注意自己后续Acti"}, true},
	{[]string{"SubjectOrBody", "Contains", "今天的会议纪要如下，请查收并注意自己后续Acti"}, true},
}

func TestCheckRule(t *testing.T) {
	email, err := readEMail("716010")
	if err != nil {
		t.Error(err)
	}

	raw, err := ioutil.ReadFile(path.Join("..", "raw", "716010.txt"))
	if err != nil {
		t.Error(err)
	}

	msg, err := mail.ReadMessage(bytes.NewBuffer(raw))
	if err != nil {
		t.Error(err)
	}

	for _, item := range tests {
		x := base.CheckRule(email, msg, item.rule)
		if x != item.expected {
			t.Error("For", item.rule, "expected", item.expected, "get", x)
		}
	}
}

func TestMatchAll(t *testing.T) {
	var filter base.Filter
	filter.Condition.Match = "All"
	filter.Condition.Rules = [][]string{
		{"From", "Is", "huqiaoxin@baidu.com"},
		{"To", "Contains", "tanghaiyang@baidu.com"},
		{"To", "Contains", "zhengheng"},
		{"To", "Contains", "chengang04"},
		{"To", "Contains", "tianxiao@baidu.com"},
		{"To", "Contains", "kongyue"},
		{"To", "Contains", "wangchenggang01"},
		{"To", "Contains", "guoyi01"},
		{"To", "Contains", "biyingying"},
		{"To", "Contains", "chujingbo"},
		{"Cc", "Contains", "cuiyuhong"},
		{"Cc", "Contains", "lakerchen"},
		{"Cc", "Contains", "wuhaiyun"},
		{"Cc", "Contains", "bdd-core"},
	}

	email, err := readEMail("716010")
	if err != nil {
		t.Error(err)
	}

	if filter.Match(email, path.Join("..", "raw")) != true {
		t.Error("filter.Match", email.Uidl, "expected", true, "get", false)
	}
}

func TestMatchAny(t *testing.T) {
	var filter base.Filter
	filter.Condition.Match = "Any"
	filter.Condition.Rules = make([][]string, len(tests))
	for i, item := range tests {
		filter.Condition.Rules[i] = item.rule
	}

	email, err := readEMail("716010")
	if err != nil {
		t.Error(err)
	}

	if filter.Match(email, path.Join("..", "raw")) != true {
		t.Error("filter.Match", email.Uidl, "expected", true, "get", false)
	}
}
