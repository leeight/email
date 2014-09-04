package handlers_test

import (
	"bytes"
	"encoding/base64"
	// "fmt"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"net/textproto"
	"net/url"
	// "net/url"
	// "strings"
	"testing"

	"github.com/stretchr/testify/assert"

	"../base"
	"../handlers"
	"../web"
)

func CreateMultipart(body string) ([]byte, string) {
	raw := &bytes.Buffer{}

	writer := multipart.NewWriter(raw)

	p1, _ := writer.CreateFormFile("data", "381288468.pdf")
	p1.Write([]byte(body))

	h2 := textproto.MIMEHeader{}
	h2.Set("Content-Disposition", `form-data; name="pages"`)
	p2, _ := writer.CreatePart(h2)
	p2.Write([]byte("0"))

	h3 := textproto.MIMEHeader{}
	h3.Set("Content-Disposition", `form-data; name="type"`)
	p3, _ := writer.CreatePart(h3)
	p3.Write([]byte("pdf"))

	writer.Close()

	return raw.Bytes(), writer.Boundary()
}

func TestDocFeedbackHandler(t *testing.T) {
	config, _ := base.GetConfig("../config.yml")
	context := web.NewContext(config)
	handler := handlers.DocFeedbackHandler{context}

	recorder := httptest.NewRecorder()
	body, boundary := CreateMultipart("hello world\n你好世界")
	// fmt.Println(string(body))
	docid := base64.StdEncoding.EncodeToString([]byte("uidl/att/你好.docx"))
	url, _ := url.ParseRequestURI("/api/doc/feedback?docid=" + docid)
	req := http.Request{
		Method: "POST",
		Proto:  "HTTP/1.1",
		Header: http.Header{
			"Content-Type": {
				`multipart/form-data; boundary="` + boundary + `"`,
			},
		},
		URL:           url,
		ContentLength: int64(len(body)),
		Body:          ioutil.NopCloser(bytes.NewReader(body)),
	}
	handler.ServeHTTP(recorder, &req)

	assert.Equal(t, 200, recorder.Code)
}
