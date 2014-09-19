package thread

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAddMessage1(t *testing.T) {
	messages := []*Message{
		&Message{"Subject 1", "msg-id-1", "msg-uidl-1", make([]string, 0)},
		&Message{"Subject 2", "msg-id-2", "msg-uidl-2", make([]string, 0)},
	}

	thrd := NewThread(messages)
	assert.Equal(t, 2, thrd.roots.Size())

	c3 := thrd.AddMessage(&Message{"Subject 3", "msg-id-3", "msg-uidl-3", make([]string, 0)})
	assert.Equal(t, (*Container)(nil), c3.parent)

	thrd.AddMessage(&Message{"Subject 4", "msg-id-4", "msg-uidl-4", make([]string, 0)})
	thrd.AddMessage(&Message{"Subject 5", "msg-id-5", "msg-uidl-5", make([]string, 0)})
	assert.Equal(t, 5, thrd.roots.Size())
}

func TestAddMessage3(t *testing.T) {
	m1 := &Message{
		"转发: [Hackthon]善存双屏",
		"35C4BCF2D250BC4C9EF4BF2D18BF90C1C16B4590@TC-MAIL-MB05.internal.baidu.com",
		"715085",
		make([]string, 0),
	}
	m2 := &Message{
		"答复: 转发: [Hackthon] 善存双屏",
		"35C4BCF2D250BC4C9EF4BF2D18BF90C1C16B45E2@TC-MAIL-MB05.internal.baidu.com",
		"715100",
		[]string{
			"35C4BCF2D250BC4C9EF4BF2D18BF90C1C16B4590@TC-MAIL-MB05.internal.baidu.com",
			"CFC4AD13.55B47%liyubei@baidu.com",
		},
	}
	m3 := &Message{
		"USER-FLOW. 答复: 转发: [Hackthon] 善存双屏",
		"35C4BCF2D250BC4C9EF4BF2D18BF90C1C16B47B8@TC-MAIL-MB05.internal.baidu.com",
		"715178",
		[]string{
			"35C4BCF2D250BC4C9EF4BF2D18BF90C1C16B4590@TC-MAIL-MB05.internal.baidu.com",
			"CFC4AD13.55B47%liyubei@baidu.com",
		},
	}

	thrd := NewThread(make([]*Message, 0))

	c1 := thrd.AddMessage(m1)
	assert.Equal(t, (*Container)(nil), c1.parent)

	c2 := thrd.AddMessage(m2)
	assert.NotEqual(t, (*Container)(nil), c2.parent)
	fmt.Println(c2.parent.String())

	c3 := thrd.AddMessage(m3)
	assert.NotEqual(t, (*Container)(nil), c3.parent)
	fmt.Println(c3.parent.String())
}

func TestAddMessage2(t *testing.T) {
	m1 := &Message{"Subject 1", "msg-id-1", "msg-uidl-1", make([]string, 0)}
	m2 := &Message{"Re: Subject 1", "msg-id-2", "msg-uidl-2", []string{m1.Id}}
	m3 := &Message{"Re: Subject 1", "msg-id-3", "msg-uidl-3", []string{m1.Id, m2.Id}}
	m4 := &Message{"Re: Subject 1", "msg-id-4", "msg-uidl-4", []string{m1.Id}}
	m5 := &Message{"Re: Re: Subject 1", "msg-id-5", "msg-uidl-5", []string{m1.Id, m4.Id}}

	thrd := NewThread(make([]*Message, 0))

	c1 := thrd.AddMessage(m1)
	assert.Equal(t, (*Container)(nil), c1.parent)

	c2 := thrd.AddMessage(m2)
	assert.NotEqual(t, (*Container)(nil), c2.parent)
	fmt.Println(c2.parent.String())

	c3 := thrd.AddMessage(m3)
	assert.NotEqual(t, (*Container)(nil), c3.parent)
	fmt.Println(c3.parent.String())

	c4 := thrd.AddMessage(m4)
	assert.NotEqual(t, (*Container)(nil), c4.parent)
	fmt.Println(c4.parent.String())

	c5 := thrd.AddMessage(m5)
	assert.NotEqual(t, (*Container)(nil), c5.parent)
	fmt.Println(c5.parent.String())

	r1 := thrd.roots
	assert.Equal(t, 1, r1.Size())

	st1 := thrd.groupBySubject(r1.children)
	assert.Equal(t, 1, len(st1))

	// 下面判断是否可以产生新的Thread，在subjectTable里面
	m6 := &Message{"Subject 6", "msg-id-6", "msg-uidl-6", make([]string, 0)}

	c6 := thrd.AddMessage(m6)
	assert.Equal(t, (*Container)(nil), c6.parent)

	r2 := &Container{message: nil}
	r2.addChild(c6)

	st2 := thrd.groupBySubject(r2.children)
	assert.Equal(t, 2, len(st2))

	assert.Equal(t, false, (st2["Subject 6"]).IsEmpty())
	assert.Equal(t, "Subject 6", (st2["Subject 6"]).message.Subject)
	assert.Equal(t, 0, len((st2["Subject 6"]).FlattenChildren()))

	assert.Equal(t, 4, len((st2["Subject 1"]).FlattenChildren()))

	// 再来一封邮件，这个是老的了
	m7 := &Message{"Re: Re: Subject 1", "msg-id-7", "msg-uidl-7", []string{m1.Id, m4.Id, m5.Id}}

	c7 := thrd.AddMessage(m7)
	assert.NotEqual(t, (*Container)(nil), c7.parent)
	fmt.Println(c7.parent.String())

	// 此时不需要重新计算应该就可以得到新的children集合了
	assert.Equal(t, 5, len((st2["Subject 1"]).FlattenChildren()))
	tp := c7.threadParent()
	assert.NotEqual(t, c7, tp)
	assert.Equal(t, c1, tp)
}
