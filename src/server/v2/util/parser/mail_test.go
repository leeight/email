package parser

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"path"
	"testing"

	"github.com/stretchr/testify/assert"

	"../../../net/mail"
)

func TestNewEmailFallback(t *testing.T) {
	raw, err := ioutil.ReadFile(path.Join("data", "727774.txt"))
	assert.Equal(t, err, nil)

	email, err := NewEmailFallback(raw)
	assert.Equal(t, err, nil)

	assert.Equal(t, email.Subject, "FS数据库-每日服务排查报告 20141026")
	assert.Equal(t, email.MsgId, "")
	assert.Equal(t, email.Date.String(), "2014-10-27 09:55:03 +0800 CST")
	assert.Equal(t, email.IsCalendar, 0)
	assert.Equal(t, email.Status, 3)
	assert.Equal(t, email.IsRead, 1)
	assert.Equal(t, email.IsSent, 0)
	assert.Equal(t, email.IsStar, 0)
	assert.Equal(t, email.IsDelete, 0)
	assert.Equal(t, email.IsArchive, 0)
	assert.Equal(t, len(email.MessageBundle), 0)
	assert.Equal(t, len(email.ResourceBundle), 0)
	assert.Equal(t, email.HasMessage("text/html"), false)
	assert.Equal(t, email.IcalMessage, "")
	assert.Equal(t, email.Message, "")
	assert.Nil(t, email.RawMessage)
}

func TestNewMail_729676(t *testing.T) {
	raw, err := ioutil.ReadFile(path.Join("data", "729676.txt"))
	assert.Equal(t, err, nil)

	msg, err := mail.ReadMessage(bytes.NewBuffer(raw))
	assert.Equal(t, err, nil)

	fmt.Printf("(%s)\n", msg.Header.Get("Subject"))
}

func TestNewMail_727774(t *testing.T) {
	raw, err := ioutil.ReadFile(path.Join("data", "727774.txt"))
	assert.Equal(t, err, nil)

	email, err := NewEmail(raw)
	assert.Equal(t, err, nil)

	assert.Equal(t, email.Subject, "FS数据库-每日服务排查报告 20141026")
	assert.Equal(t, email.MsgId, "201410270155.s9R1t3vx004468@tc-dba-csp-robot.tc.baidu.com")
	assert.Equal(t, email.Date.String(), "2014-10-27 09:55:03 +0800 CST")
	assert.Equal(t, email.IsCalendar, 0)
	assert.Equal(t, email.Status, 0)
	assert.Equal(t, email.IsRead, 0)
	assert.Equal(t, email.IsSent, 0)
	assert.Equal(t, email.IsStar, 0)
	assert.Equal(t, email.IsDelete, 0)
	assert.Equal(t, email.IsArchive, 0)
	assert.Equal(t, len(email.MessageBundle), 1)
	assert.Equal(t, len(email.ResourceBundle), 0)
	assert.Equal(t, email.HasMessage("text/html"), true)
	assert.Equal(t, email.IcalMessage, "")
	assert.NotEqual(t, email.Message, "")
	assert.NotNil(t, email.RawMessage)
}

func TestNewMail_727804(t *testing.T) {
	raw, err := ioutil.ReadFile(path.Join("data", "727804.txt"))
	assert.Equal(t, err, nil)

	email, err := NewEmail(raw)
	assert.Equal(t, err, nil)

	assert.Equal(t, email.Subject, "线下机房服务器搬迁通知【下半年机房搬迁】//第七批物理搬迁提醒！！")
	assert.Equal(t, email.MsgId, "B7B6F2698C038C4ABB6AF421AE70352074403C84@M1-MAIL-MBX05.internal.baidu.com")
	assert.Equal(t, email.Date.String(), "2014-10-27 11:44:50 +0800 CST")
	assert.Equal(t, email.IsCalendar, 0)
	assert.Equal(t, email.Status, 0)
	assert.Equal(t, email.IsRead, 0)
	assert.Equal(t, email.IsSent, 0)
	assert.Equal(t, email.IsStar, 0)
	assert.Equal(t, email.IsDelete, 0)
	assert.Equal(t, email.IsArchive, 0)
	assert.Equal(t, len(email.MessageBundle), 1)
	assert.Equal(t, len(email.ResourceBundle), 2)
	assert.Equal(t, email.HasResource("下半年涉及产品线.xlsx"), true)
	assert.Equal(t, email.HasResource("下半年机器列表-第七批.xlsx"), true)
	assert.Equal(t, email.HasMessage("text/html"), true)
	assert.Equal(t, email.IcalMessage, "")
	assert.NotEqual(t, email.Message, "")
	assert.NotNil(t, email.RawMessage)
}

func TestNewMail_727841(t *testing.T) {
	raw, err := ioutil.ReadFile(path.Join("data", "727841.txt"))
	assert.Equal(t, err, nil)

	email, err := NewEmail(raw)
	assert.Equal(t, err, nil)

	assert.Equal(t, email.Subject, "【会议纪要】 霓裳-入门版story 详审")
	assert.Equal(t, email.MsgId, "858119A384FF8E4BB356A6BB5C874A6540187B4A@M1-MAIL-MBX03.internal.baidu.com")
	assert.Equal(t, email.Date.String(), "2014-10-27 15:17:23 +0800 CST")
	assert.Equal(t, email.IsCalendar, 1)
	assert.Equal(t, email.Status, 0)
	assert.Equal(t, email.IsRead, 0)
	assert.Equal(t, email.IsSent, 0)
	assert.Equal(t, email.IsStar, 0)
	assert.Equal(t, email.IsDelete, 0)
	assert.Equal(t, email.IsArchive, 0)
	assert.Equal(t, len(email.MessageBundle), 2)
	assert.Equal(t, len(email.ResourceBundle), 1)
	assert.Equal(t, email.HasResource("story优先级.xlsx"), false)
	assert.Equal(t, email.HasMessage("text/html"), true)
	assert.Equal(t, email.HasMessage("text/calendar"), true)
	assert.Equal(t, email.From, `"Meng,Qi(BDD)" <mengqi01@baidu.com>`)
	assert.Equal(t, email.To, `cy-rd <cy-rd@baidu.com>, cy-qa <cy-qa@baidu.com>, creative-pm <creative-pm@baidu.com>, "Jin,Lei(UPD)" <jinlei01@baidu.com>`)
	assert.Equal(t, email.Cc, `"Wang,Mingyun" <wangmingyun@baidu.com>, "Xietian,Xietian" <xietianxietian@baidu.com>, "Xiong,Jie(BDD)" <xiongjie01@baidu.com>`)
	assert.Equal(t, email.Bcc, "")
	assert.Equal(t, email.ReplyTo, "")
	assert.NotEqual(t, email.Message, "")
	assert.NotEqual(t, email.IcalMessage, "")
	assert.NotNil(t, email.RawMessage)
}
