package builder

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"mime"
	"mime/multipart"
	"net/textproto"
	"path"
	"strings"

	"../RFC2047"
)

// 我们发送的时候不考虑 text/plain 的情况了

// 纯HTML邮件
// Header
// Content-Type: text/html; charset="utf-8"
// Content-Transfer-Encoding: base64
//
// Body
// ...

// 纯HTML邮件，里面有图片之类的东东，没有附件
// Header
// Content-Type: multipart/related; boundary="--HELLO-WORLD--"
//
// Body
// Content-Type: text/html; charset="utf-8"
// Content-Transfer-Encoding: base64
// Content-Type: image/png; name="image001(05-30-18-14-05).png"
// Content-Transfer-Encoding: base64
// Content-Id: <123>
// Content-Type: image/png; name="image001(05-30-18-14-05).png"
// Content-Transfer-Encoding: base64
// Content-Id: <123>

// 纯HTML邮件，里面有图片之类的东东，还有一些其它的附件
// Header
// Content-Type: multipart/mixed; boundary="--HELLO-WORLD--"
//
// Body
// Content-Type: multipart/related; boundary=""
//   Content-Type: text/html; charset="utf-8"
//   Content-Transfer-Encoding: base64
//   Content-Type: image/png; name="image001(05-30-18-14-05).png"
//   Content-Transfer-Encoding: base64
//   Content-Type: image/png; name="image001(05-30-18-14-05).png"
//   Content-Transfer-Encoding: base64
// Content-Type: application/octet-stream; name="=?utf-8?B?1K3J+srVyOu31rK8LnBwdHg=?="
// Content-Transfer-Encoding: base64
// Content-Disposition: attachment; filename="=?utf-8?B?1K3J+srVyOu31rK8LnBwdHg=?="

// ResourceReader 读取资源的接口
// 例如 ioutil.ReadFile
type ResourceReader interface {
	Read(name string) ([]byte, error)
}

// Envelope 用来提供 Enclose 和 Headers 两个接口
// 不同类型的邮件体都会实现这两个接口
type Envelope interface {
	Enclose(rr ResourceReader) ([]byte, error)
	Headers() textproto.MIMEHeader
}

// SimpleEnvelope 用来封装最简单的邮件体，只有文本内容，没有内联的元素，没有附件
type SimpleEnvelope struct {
	Message string // HTML邮件的正文
}

// Enclose 用来对文本类型的邮件体进行 base64 编码
func (e *SimpleEnvelope) Enclose(rr ResourceReader) ([]byte, error) {
	message := []byte(e.Message)
	message64 := make([]byte, base64.StdEncoding.EncodedLen(len(message)))
	base64.StdEncoding.Encode(message64, message)

	return message64, nil
}

// Headers 返回额外的邮件头
func (e *SimpleEnvelope) Headers() textproto.MIMEHeader {
	var headers = make(textproto.MIMEHeader)

	headers.Set("Content-Type", "text/html; charset=\"utf-8\"")
	headers.Set("Content-Transfer-Encoding", "base64")

	return headers
}

// RelatedEnvelope 是对含有内联资源，以及文本的邮件体进行打包的数据结构
type RelatedEnvelope struct {
	Message    string   // HTML邮件的正文
	ContentIds []string // HTML邮件正文中所引用的资源，例如<img src="cid:...">
	boundary   string
}

// Enclose 对邮件体进行打包
func (e *RelatedEnvelope) Enclose(rr ResourceReader) ([]byte, error) {
	raw := &bytes.Buffer{}
	writer := multipart.NewWriter(raw)

	e.boundary = writer.Boundary()

	// TODO(user) 正则表达式的替换Message的内容
	se := SimpleEnvelope{Message: e.Message}
	body, _ := se.Enclose(rr)
	part, _ := writer.CreatePart(se.Headers())
	part.Write(body)

	for _, resource := range e.ContentIds {
		name := path.Base(resource)
		header := textproto.MIMEHeader{}
		// TODO(user) 如何识别文件的类型呢？后缀名貌似不太靠谱，都被隐藏到XXX里面去了
		header.Set("Content-Type", fmt.Sprintf(`%s; name="%s"`,
			GuessMimetype(name), RFC2047.Encode(name)))
		header.Set("Content-Id", fmt.Sprintf("<%s>", name))
		header.Set("Content-Disposition", fmt.Sprintf(`inline; filename="%s"`,
			RFC2047.Encode(name)))
		header.Set("Content-Transfer-Encoding", "base64")

		part, err := writer.CreatePart(header)
		if err != nil {
			continue
		}

		xyz, err := rr.Read(resource)
		if err != nil {
			continue
		}
		part.Write([]byte(base64.StdEncoding.EncodeToString(xyz)))
	}
	writer.Close()

	return raw.Bytes(), nil
}

// Headers 返回额外的邮件头
func (e *RelatedEnvelope) Headers() textproto.MIMEHeader {
	var headers = make(textproto.MIMEHeader)

	// Content-Type: multipart/related; boundary="--HELLO-WORLD--"
	headers.Set("Content-Type",
		fmt.Sprintf("multipart/related; boundary=\"%s\"", e.boundary))

	return headers
}

// MixedEnvelope 对含有附件的邮件体进行打包的数据结构
type MixedEnvelope struct {
	Message     string   // HTML邮件的正文
	ContentIds  []string // HTML邮件正文中所引用的资源，例如<img src="cid:...">
	Attachments []string // 邮件中的附件
	boundary    string
}

// Enclose 对含有附件的邮件体进行打包
func (e *MixedEnvelope) Enclose(rr ResourceReader) ([]byte, error) {
	raw := &bytes.Buffer{}
	writer := multipart.NewWriter(raw)

	e.boundary = writer.Boundary()

	re := RelatedEnvelope{
		Message:    e.Message,
		ContentIds: e.ContentIds,
	}
	body, _ := re.Enclose(rr)
	part, _ := writer.CreatePart(re.Headers())
	part.Write(body)

	for _, attach := range e.Attachments {
		name := path.Base(attach)
		header := textproto.MIMEHeader{}
		// TODO(user) 如何识别文件的类型呢？后缀名貌似不太靠谱，都被隐藏到XXX里面去了
		header.Set("Content-Type", fmt.Sprintf("%s; name=\"%s\"",
			GuessMimetype(name), RFC2047.Encode(name)))
		header.Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"",
			RFC2047.Encode(name)))
		header.Set("Content-Transfer-Encoding", "base64")

		part, err := writer.CreatePart(header)
		if err != nil {
			continue
		}

		xyz, err := rr.Read(attach)
		if err != nil {
			continue
		}
		part.Write([]byte(base64.StdEncoding.EncodeToString(xyz)))
	}
	writer.Close()

	return raw.Bytes(), nil
}

// Headers 返回额外的邮件头
func (e *MixedEnvelope) Headers() textproto.MIMEHeader {
	var headers = make(textproto.MIMEHeader)

	// Content-Type: multipart/related; boundary="--HELLO-WORLD--"
	headers.Set("Content-Type",
		fmt.Sprintf("multipart/mixed; boundary=\"%s\"", e.boundary))

	return headers
}

// GuessMimetype 根据名字猜测资源的类型
// TODO 采用的方式不是很准确，应该采用其它更靠谱的方式
func GuessMimetype(name string) string {
	var ext, mtype string

	at := strings.Index(name, "@")
	if at != -1 {
		ext = path.Ext(name[:at])
	} else {
		ext = path.Ext(name)
	}

	if ext != "" {
		mtype = mime.TypeByExtension(ext)
	}

	if mtype == "" {
		mtype = "application/octet-stream"
	}

	return mtype
}

// EnvelopeMail 创建邮件的正文，发送出去
func EnvelopeMail(
	header map[string]string,
	message []byte,
) []byte {
	raw := &bytes.Buffer{}
	// writer := multipart.NewWriter(raw)

	for k, v := range header {
		raw.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}

	if _, ok := header["Content-Type"]; !ok {
		// 如果没有定义Content-Type的话，用默认的
		raw.WriteString(fmt.Sprintf("Content-Type: %s\r\n",
			"text/html; charset=\"utf-8\""))
	}

	if _, ok := header["Content-Transfer-Encoding"]; !ok {
		raw.WriteString(fmt.Sprintf("Content-Transfer-Encoding: %s\r\n",
			"base64"))

		// 把 message 用 base64 编码一下
		encoding := base64.StdEncoding
		message64 := make([]byte, encoding.EncodedLen(len(message)))
		encoding.Encode(message64, message)
		raw.WriteString("\r\n")
		raw.Write(message64)
	} else {
		raw.WriteString("\r\n")
		raw.Write(message)
	}

	// 邮件里面的这些邮件头，SMTP Server会自动加上
	// Received
	// Messsage-ID
	// Return-Path
	// Date
	// X-MS-Exchange-Organization-AuthSource
	// X-MS-Exchange-Organization-AuthAs
	// X-MS-Exchange-Organization-AuthMechanism
	// X-Originating-IP
	// MIME-Version

	return raw.Bytes()
}
