package base

import (
	"bytes"
	"encoding/base64"
	"fmt"
	// "log"
	"mime"
	"mime/multipart"
	"net/textproto"
	"net/url"
	"path"
	"strings"

	"../RFC2047"
)

var (
	kDefaultContentType             = "text/html; charset=\"utf-8\""
	kDefaultContentTransferEncoding = "base64"
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

// 读取资源的接口
// 例如 ioutil.ReadFile
type ResourceReader interface {
	Read(uidl, name string) ([]byte, error)
}

type Envelope interface {
	Enclose(rr ResourceReader) ([]byte, error)
	Headers() textproto.MIMEHeader
}

//{{{

type SimpleEnvelope struct {
	Message string // HTML邮件的正文
}

func (this *SimpleEnvelope) Enclose(rr ResourceReader) ([]byte, error) {
	message := []byte(this.Message)
	message64 := make([]byte, base64.StdEncoding.EncodedLen(len(message)))
	base64.StdEncoding.Encode(message64, message)

	return message64, nil
}

func (this *SimpleEnvelope) Headers() textproto.MIMEHeader {
	var headers = make(textproto.MIMEHeader)

	headers.Set("Content-Type", kDefaultContentType)
	headers.Set("Content-Transfer-Encoding", kDefaultContentTransferEncoding)

	return headers
}

//}}}

//{{{

type RelatedEnvelope struct {
	Uidl       string   // 回复邮件的时候，需要有这个东东，这样次就可以从这个目录里面去寻找资源了
	Message    string   // HTML邮件的正文
	ContentIds []string // HTML邮件正文中所引用的资源，例如<img src="cid:...">
	boundary   string
}

func (this *RelatedEnvelope) Enclose(rr ResourceReader) ([]byte, error) {
	raw := &bytes.Buffer{}
	writer := multipart.NewWriter(raw)

	this.boundary = writer.Boundary()

	// TODO(user) 正则表达式的替换Message的内容
	se := SimpleEnvelope{Message: this.Message}
	body, _ := se.Enclose(rr)
	part, _ := writer.CreatePart(se.Headers())
	part.Write(body)

	for _, resource := range this.ContentIds {
		header := textproto.MIMEHeader{}
		// TODO(user) 如何识别文件的类型呢？后缀名貌似不太靠谱，都被隐藏到XXX里面去了
		header.Set("Content-Type", fmt.Sprintf("%s; name=\"%s\"",
			GuessMimetype(resource), RFC2047.Encode(resource)))
		header.Set("Content-Id", fmt.Sprintf("<%s>", url.QueryEscape(resource)))
		header.Set("Content-Transfer-Encoding", kDefaultContentTransferEncoding)

		part, err := writer.CreatePart(header)
		if err != nil {
			continue
		}

		xyz, err := rr.Read(this.Uidl, resource)
		if err != nil {
			continue
		}
		part.Write([]byte(base64.StdEncoding.EncodeToString(xyz)))
	}
	writer.Close()

	return raw.Bytes(), nil
}

func (this *RelatedEnvelope) Headers() textproto.MIMEHeader {
	var headers = make(textproto.MIMEHeader)

	// Content-Type: multipart/related; boundary="--HELLO-WORLD--"
	headers.Set("Content-Type",
		fmt.Sprintf("multipart/related; boundary=\"%s\"", this.boundary))

	return headers
}

//}}}

//{{{

type MixedEnvelope struct {
	Uidl        string   // 回复邮件的时候，需要有这个东东，这样次就可以从这个目录里面去寻找资源了
	Message     string   // HTML邮件的正文
	ContentIds  []string // HTML邮件正文中所引用的资源，例如<img src="cid:...">
	Attachments []string // 邮件中的附件
	boundary    string
}

func (this *MixedEnvelope) Enclose(rr ResourceReader) ([]byte, error) {
	raw := &bytes.Buffer{}
	writer := multipart.NewWriter(raw)

	this.boundary = writer.Boundary()

	re := RelatedEnvelope{
		Uidl:       this.Uidl,
		Message:    this.Message,
		ContentIds: this.ContentIds,
	}
	body, _ := re.Enclose(rr)
	part, _ := writer.CreatePart(re.Headers())
	part.Write(body)

	for _, attach := range this.Attachments {
		header := textproto.MIMEHeader{}
		// TODO(user) 如何识别文件的类型呢？后缀名貌似不太靠谱，都被隐藏到XXX里面去了
		header.Set("Content-Type", fmt.Sprintf("%s; name=\"%s\"",
			GuessMimetype(attach), RFC2047.Encode(attach)))
		header.Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"",
			RFC2047.Encode(attach)))
		header.Set("Content-Transfer-Encoding", kDefaultContentTransferEncoding)

		part, err := writer.CreatePart(header)
		if err != nil {
			continue
		}

		xyz, err := rr.Read(this.Uidl, attach)
		if err != nil {
			continue
		}
		part.Write([]byte(base64.StdEncoding.EncodeToString(xyz)))
	}
	writer.Close()

	return raw.Bytes(), nil
}

func (this *MixedEnvelope) Headers() textproto.MIMEHeader {
	var headers = make(textproto.MIMEHeader)

	// Content-Type: multipart/related; boundary="--HELLO-WORLD--"
	headers.Set("Content-Type",
		fmt.Sprintf("multipart/mixed; boundary=\"%s\"", this.boundary))

	return headers
}

//}}}

func GuessMimetype(name string) string {
	var ext, mtype string

	ext = path.Ext(name)

	if ext != "" {
		at := strings.Index(ext, "@")
		if at != -1 {
			ext = ext[:at]
		}
		mtype = mime.TypeByExtension(ext)
	}

	if mtype == "" {
		mtype = "application/octet-stream"
	}

	return mtype
}

// 创建邮件的正文，发送出去
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
			kDefaultContentType))
	}

	if _, ok := header["Content-Transfer-Encoding"]; !ok {
		raw.WriteString(fmt.Sprintf("Content-Transfer-Encoding: %s\r\n",
			kDefaultContentTransferEncoding))

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
