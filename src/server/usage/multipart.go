package main

import (
	"bytes"
	"fmt"
	// "io/ioutil"
	"log"
	"mime/multipart"
	// "net/textproto"
	// "strings"
)

func main() {
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

	// fmt.Println(string(raw.Bytes()))
}
