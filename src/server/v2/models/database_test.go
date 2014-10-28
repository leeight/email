package models

import (
	"testing"
	"time"

	"github.com/astaxie/beego/orm"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/mattn/go-sqlite3"
	"github.com/stretchr/testify/assert"
)

func init() {
	orm.RegisterDataBase("default", "sqlite3", ":memory:")
}

func TestInsert(t *testing.T) {
	orm.RunSyncdb("default", true, false)
	o := orm.NewOrm()

	email := Email{
		Uidl:    "uidl_123456",
		From:    "leeight@gmail.com",
		Date:    time.Now(),
		Subject: "This is the mail subject",
		Message: "This is the mail message body.",
	}

	id, err := o.Insert(&email)
	assert.Nil(t, err)
	assert.Equal(t, id > 0, true)

	x := Email{
		Uidl: "uidl_123456",
	}
	err = o.Read(&x, "Uidl")
	assert.Nil(t, err)
	assert.Equal(t, x.Id, id)
	assert.Equal(t, x.From, email.From)
	// assert.Equal(t, x.Date.String(), email.Date.String())
	assert.Equal(t, x.Subject, email.Subject)
	assert.Equal(t, x.Message, email.Message)
	assert.Equal(t, x.Status, 0)
	assert.Equal(t, x.IsRead, 0)
	assert.Equal(t, x.IsDelete, 0)
	assert.Equal(t, 0, len(x.Tags))
}

func TestInsertWithTags(t *testing.T) {
	// orm.RegisterDataBase("TestInsertWithTags", "sqlite3", "TestInsertWithTags.db")
	orm.RunSyncdb("default", true, false)

	o := orm.NewOrm()
	// o.Using("TestInsertWithTags")

	var tags = []*Tag{
		&Tag{Name: "tag1"},
		&Tag{Name: "tag2"},
		&Tag{Name: "tag3"},
		&Tag{Name: "tag4"},
		&Tag{Name: "tag5"},
		&Tag{Name: "tag6"},
	}
	// 初始化Tag的数据
	for _, tag := range tags {
		if _, id, err := o.ReadOrCreate(tag, "Name"); err == nil {
			tag.Id = id
		}
	}

	e1 := Email{
		Uidl:    "uidl_123456",
		From:    "leeight@gmail.com",
		Date:    time.Now(),
		Subject: "This is the mail subject",
		Message: "This is the mail message body.",
	}
	e1.Tags = []*Tag{
		tags[0],
		tags[2],
		tags[4],
	}
	id1, err := o.Insert(&e1)
	assert.Nil(t, err)
	assert.Equal(t, id1 > 0, true)

	// 开始修改Email.Tags相关的记录
	m2m1 := o.QueryM2M(&e1, "Tags")
	tagCount, err := m2m1.Add(e1.Tags)
	assert.Nil(t, err)
	assert.Equal(t, len(e1.Tags), tagCount)

	// 插入第二条记录
	e2 := Email{
		Uidl:    "uidl_654321",
		From:    "leeight@gmail.com",
		Date:    time.Now(),
		Subject: "This is the mail subject",
		Message: "This is the mail message body.",
	}
	e2.Tags = []*Tag{
		tags[1],
		tags[3],
		tags[4],
		tags[5],
	}

	id2, err := o.Insert(&e2)
	assert.Nil(t, err)
	assert.Equal(t, id2 > 0, true)

	m2m2 := o.QueryM2M(&e2, "Tags")
	tagCount, err = m2m2.Add(e2.Tags)
	assert.Nil(t, err)
	assert.Equal(t, len(e2.Tags), tagCount)

	// 检查 tag 和 email_tags 的表里面存储的数据是否正常
	tagCount, err = o.QueryTable("tag").Count()
	assert.Nil(t, err)
	assert.Equal(t, 6, tagCount)

	emailTagsCount, err := o.QueryTable("email_tags").Count()
	assert.Nil(t, err)
	assert.Equal(t, len(e1.Tags)+len(e2.Tags), emailTagsCount)

	// LoadRelated
	e3 := Email{Id: 1}
	err = o.Read(&e3)
	assert.Nil(t, err)

	tagCount, err = o.LoadRelated(&e3, "Tags")
	assert.Nil(t, err)
	assert.Equal(t, len(e1.Tags), tagCount)
	assert.Equal(t, "tag1", e3.Tags[0].Name)
	assert.Equal(t, "tag3", e3.Tags[1].Name)
	assert.Equal(t, "tag5", e3.Tags[2].Name)

	// 测试查询多条记录的情况
	var emails []Email
	num, err := o.QueryTable("email").Filter("From", "leeight@gmail.com").All(&emails)
	assert.Equal(t, 2, num)
	assert.Nil(t, err)

	num, err = o.QueryTable("email").Filter("Uidl", "uidl_654321").Filter("Id", 2).Count()
	assert.Equal(t, 1, num)
	assert.Nil(t, err)
}
