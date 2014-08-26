package base

import (
	"bytes"
	"encoding/base64"
	"fmt"
	// "log"
	// "mime/multipart"
	// "net/mail"
	// "net/smtp"
)

var (
	kDefaultContentType             = "text/html; charset=\"utf-8\""
	kDefaultContentTransferEncoding = "base64"
)

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
