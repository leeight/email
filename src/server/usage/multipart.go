package main

import (
	"bytes"
	"fmt"
	// "io/ioutil"
	"log"
	"mime/multipart"
	"net/textproto"
	// "strings"
)

func main() {
	a := textproto.MIMEHeader{}
	a.Set("Content-Type", "HELLO")
	for k, v := range a {
		log.Printf("%s, %v", k, v)
	}
	return

	raw := &bytes.Buffer{}
	fileContents := []byte("my file contents")
	w := multipart.NewWriter(raw)

	part, err := w.CreateFormFile("myfile", "my-file.txt")
	if err != nil {
		log.Fatal(err)
	}
	part.Write(fileContents)

	err = w.WriteField("key", "val")
	if err != nil {
		log.Fatal(err)
	}
	part.Write([]byte("val"))

	err = w.Close()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(raw.String())

	// h := make(textproto.MIMEHeader)
	// h.Set("Content-Type", "text/html; charset=\"utf-8\"")
	// h.Set("Content-Transfer-Encoding", "base64")
	// writer.CreatePart(h)

	// writer.CreateFormFile("field名称", "file文件名")
	// writer.CreateFormField("CreateFormField名称")
	// writer.WriteField("WriteField名称", "WriteField的内容")
	// writer.Close()

	// Content-Type: multipart/mixed; boundary="--HELLO-WORLD--"
	//   Content-Type: multipart/related; boundary=""
	//     Content-Type: multipart/alternative; boundary=""
	//       Content-Type: text/plain; charset="gb2312"
	//       Content-Transfer-Encoding: base64
	//       Content-Type: text/html; charset="gb2312"
	//       Content-Transfer-Encoding: quoted-printable
	//     Content-Type: image/png; name="image001(05-30-18-14-05).png"
	//     Content-Transfer-Encoding: base64
	//     Content-ID: <_Foxmail.0@D318E215-3FA2-4333-84AA-68FAA8E02521>
	// 		 Content-Type: image/png; name="image002(05-30-18-14-05).png"
	// 		 Content-Transfer-Encoding: base64
	// 		 Content-ID: <_Foxmail.1@B96DCB4B-39DA-4E1F-AACA-A31B014D7764>
	//   Content-Type: application/octet-stream; name="=?gb2312?B?1K3J+srVyOu31rK8LnBwdHg=?="
	// 	 Content-Transfer-Encoding: base64
	//   Content-Disposition: attachment; filename="=?gb2312?B?1K3J+srVyOu31rK8LnBwdHg=?="

	// fmt.Println(string(raw.Bytes()))
}
