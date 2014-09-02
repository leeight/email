package base_test

import (
	"fmt"
	"mime"
	"mime/multipart"
	"strings"
	"testing"

	"../base"
)

func TestGuessMimetype(t *testing.T) {
	var tests = []struct {
		name     string
		expected string
	}{
		{"a.jpg", "image/jpeg"},
		{"a.jpeg", "image/jpeg"},
		{"a.png", "image/png"},
		{"a.gif", "image/gif"},
		{"a.txt", "text/plain; charset=utf-8"},
		{"a.html", "text/html; charset=utf-8"},
		{"a.htm", "text/html; charset=utf-8"},
		{"a.doc", "application/msword"},
		{"a.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"},
		{"a.xls", "application/vnd.ms-excel"},
		{"a.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
		{"a.ppt", "application/vnd.ms-powerpoint"},
		{"a.pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"},
		{"haha", "application/octet-stream"},
		{"haha.foo.bar", "application/octet-stream"},
	}
	for _, item := range tests {
		mt := base.GuessMimetype(item.name)
		if mt != item.expected {
			t.Error(item.name, "expected", item.expected, "but get ", mt)
		}
	}

	for _, item := range tests {
		mt := base.GuessMimetype(item.name + "@xxx")
		if mt != item.expected {
			t.Error(item.name+"@xxx.1213", "expected", item.expected, "but get ", mt)
		}
	}
}

func TestSimpleEnvelope(t *testing.T) {
	se := base.SimpleEnvelope{
		Message: "你好，世界",
	}

	raw, err := se.Enclose(nil)
	if err != nil {
		t.Errorf("%v", err)
	}

	headers := se.Headers()
	ct := headers.Get("Content-Type")
	if ct != "text/html; charset=\"utf-8\"" {
		t.Error("expected is text/html; charset=\"utf-8\" but got", ct)
	}
	cte := headers.Get("Content-Transfer-Encoding")
	if cte != "base64" {
		t.Error("expected is base64 but got", cte)
	}

	if string(raw) != "5L2g5aW977yM5LiW55WM" {
		t.Error("expected is 5L2g5aW977yM5LiW55WM", string(raw))
	}
}

type SimpleResourceReader struct{}

func (srr SimpleResourceReader) Read(name string) ([]byte, error) {
	raw := fmt.Sprintf("name=%s", name)
	return []byte(raw), nil
}

func TestRelatedEnvelope(t *testing.T) {
	re := base.RelatedEnvelope{
		Message:    "你好，世界",
		ContentIds: []string{"a.png", "b.gif", "c.docx@123"},
	}

	srr := SimpleResourceReader{}
	raw, err := re.Enclose(srr)
	if err != nil {
		t.Errorf("%v", err)
	}

	headers := re.Headers()
	ct := headers.Get("Content-Type")
	if strings.Index(ct, "multipart/related; boundary=") == -1 {
		t.Error("expected should begin with multipart/related; boundary= but got", ct)
	}
	// cte := headers.Get("Content-Transfer-Encoding")
	// if cte != "base64" {
	// 	t.Error("expected is base64 but got", cte)
	// }
	// fmt.Println(string(raw))

	_, params, err := mime.ParseMediaType(headers.Get("Content-Type"))
	if err != nil {
		t.Errorf("%v", err)
	}

	reader := strings.NewReader(string(raw))

	mr := multipart.NewReader(reader, params["boundary"])
	_, err = mr.NextPart()
	if err != nil {
		t.Errorf("%v", err)
	}

	_, err = mr.NextPart()
	if err != nil {
		t.Errorf("%v", err)
	}

	_, err = mr.NextPart()
	if err != nil {
		t.Errorf("%v", err)
	}

	_, err = mr.NextPart()
	if err != nil {
		t.Errorf("%v", err)
	}
}

func TestMixedEnvelope(t *testing.T) {
	me := base.MixedEnvelope{
		Message:     "你好，世界",
		ContentIds:  []string{"a.png", "b.gif", "c.docx@123"},
		Attachments: []string{"我的附件.txt", "请查收.png", "名单列表.xlsx"},
	}

	srr := SimpleResourceReader{}
	raw, err := me.Enclose(srr)
	if err != nil {
		t.Errorf("%v", err)
	}

	headers := me.Headers()
	ct := headers.Get("Content-Type")
	if strings.Index(ct, "multipart/mixed; boundary=") == -1 {
		t.Error("expected should begin with multipart/mixed; boundary= but got", ct)
	}

	_, params, err := mime.ParseMediaType(headers.Get("Content-Type"))
	if err != nil {
		t.Errorf("%v", err)
	}

	reader := strings.NewReader(string(raw))

	mr := multipart.NewReader(reader, params["boundary"])
	_, err = mr.NextPart()
	if err != nil {
		t.Errorf("%v", err)
	}

	_, err = mr.NextPart()
	if err != nil {
		t.Errorf("%v", err)
	}

	_, err = mr.NextPart()
	if err != nil {
		t.Errorf("%v", err)
	}

	_, err = mr.NextPart()
	if err != nil {
		t.Errorf("%v", err)
	}
}
