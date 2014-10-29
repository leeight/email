package builder

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"../../../RFC2047"
	"../../../net/mail"
	"../parser"
)

func TestSimpleMailBuilder(t *testing.T) {
	var mailer = MailBuilder{
		From: &mail.Address{Name: "leeight", Address: "leeight@stu.xjtu.edu.cn"},
		To: []*mail.Address{
			&mail.Address{Name: "liyubei", Address: "liyubei@baidu.com"},
		},
		Subject: "Hello World",
		Message: "<p>Hello World</p>",
	}

	raw, err := mailer.Enclose()
	assert.Nil(t, err)
	assert.NotNil(t, raw)

	email, err := parser.NewEmail(raw.Bytes())
	assert.Nil(t, err)
	assert.Equal(t, RFC2047.Decode(email.RawMessage.Header.Get("Subject")), ("Hello World"))
	assert.Equal(t, email.RawMessage.Header.Get("From"), "\"leeight\" <leeight@stu.xjtu.edu.cn>")
	assert.Equal(t, email.RawMessage.Header.Get("To"), "\"liyubei\" <liyubei@baidu.com>")
	assert.Equal(t, email.Message, mailer.Message)
}
