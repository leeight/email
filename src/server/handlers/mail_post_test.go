package handlers_test

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"

	"../base"
	"../handlers"
	"../web"
)

func TestSimpleMailPostHandler(t *testing.T) {
	config, err := base.GetConfig("../config.yml")
	assert.Nil(t, err)

	context := web.NewContext(config)
	handler := handlers.MailPostHandler{context}

	recorder := httptest.NewRecorder()

	// http://golang.org/src/pkg/net/http/request_test.go
	params := url.Values{}
	params.Add("to", "=?utf-8?b?5p2O546J5YyX?= <liyubei@baidu.com>; =?utf-8?b?5p2O546J5YyX?= <leeight@126.com>")
	params.Add("cc", "=?utf-8?b?5p2O546J5YyX?= <leeight@gmail.com>")
	// params.Add("bcc", "=?utf-8?b?5p2O546J5YyX?= <leeight@gmail.com>")
	params.Add("subject", "HELLO WORLD FROM mail_post_test，邮件标题")
	params.Add("message", "THIS IS THE MESSAGE BODY.")

	req, _ := http.NewRequest("POST", "/", strings.NewReader(params.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; charset=utf-8")

	handler.ServeHTTP(recorder, req)

	assert.Equal(t, recorder.Code, 200)
	assert.Equal(t, recorder.Body.String(), "{\n    \"success\": \"true\",\n    \"message\": null,\n    \"result\": {}\n}")
}

// 发送一个带有附件的邮件
// 回复邮件的时候会有uidl的
func TestMixedMailPostHandler(t *testing.T) {
	config, err := base.GetConfig("../config.yml")
	assert.Nil(t, err)

	context := web.NewContext(config)
	handler := handlers.MailPostHandler{context}

	recorder := httptest.NewRecorder()

	// http://golang.org/src/pkg/net/http/request_test.go
	params := url.Values{}
	params.Add("to", "=?utf-8?b?5p2O546J5YyX?= <liyubei@baidu.com>; =?utf-8?b?5p2O546J5YyX?= <leeight@126.com>")
	params.Add("cc", "=?utf-8?b?5p2O546J5YyX?= <leeight@gmail.com>")
	// params.Add("bcc", "=?utf-8?b?5p2O546J5YyX?= <leeight@gmail.com>")
	params.Add("subject", "HELLO WORLD FROM mail_post_test，邮件标题")
	params.Add("message", "THIS IS THE MESSAGE BODY.")
	params.Add("uidl", "720793")
	params.Add("attachments", strings.Join([]string{
		"image001.jpg@01CFC5FC.225DB230",
		"image002.png@01CFC5FC.225DB230",
		"image003.png@01CFC5FC.225DB230",
		"image006.png@01CFC5FF.585065B0",
		"image011.jpg@01CFC608.BBE52B70",
		"image012.jpg@01CFC608.BBE52B70",
		"image013.jpg@01CFC608.BBE52B70",
		"上研跳蚤市场宝贝清单.xlsx",
	}, "; "))

	req, _ := http.NewRequest("POST", "/", strings.NewReader(params.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; charset=utf-8")

	handler.ServeHTTP(recorder, req)

	assert.Equal(t, recorder.Code, 200)
	assert.Equal(t, recorder.Body.String(), "{\n    \"success\": \"true\",\n    \"message\": null,\n    \"result\": {}\n}")
}
