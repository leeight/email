package main

import (
	"bytes"
	"encoding/base64"
	// "encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"mime"
	"mime/multipart"
	"regexp"
	"strings"

	"./RFC2047"
	"./net/mail"
	// "./base"

	"github.com/alexcesaro/mail/quotedprintable"
	"github.com/qiniu/iconv"
)

func main() {
	cd, err := iconv.Open("utf-8", "gb2312")
	if err != nil {
		log.Fatal(err)
	}
	defer cd.Close()

	raw, _ := ioutil.ReadFile("raw.txt")
	msg, _ := mail.ReadMessage(bytes.NewBuffer(raw))

	// log.Println(msg.Header)
	fmt.Println(msg.Header.Get("From"))
	fmt.Println(RFC2047.Decode(msg.Header.Get("Subject")))

	from, err := mail.ParseAddress(msg.Header.Get("From"))
	if err != nil {
		log.Fatal(err)
		return
	}
	fmt.Printf("From: %s => %s\n", from.Name, from.Address)

	to, _ := msg.Header.AddressList("To")
	for _, item := range to {
		fmt.Printf("%s => %s\n", item.Name, item.Address)
	}

	mediaType, params, err := mime.ParseMediaType(msg.Header.Get("Content-Type"))
	if err != nil {
		panic(err)
	}

	fmt.Printf("MediaType = %s\n", mediaType)

	cte := msg.Header.Get("Content-Transfer-Encoding")
	// 普通的邮件，没有附件，没有截图之类的东东
	if strings.HasPrefix(mediaType, "text/") {
		var reader io.Reader
		if cte == "quoted-printable" {
			reader = quotedprintable.NewDecoder(msg.Body)
		} else if cte == "base64" {
			reader = base64.NewDecoder(base64.StdEncoding, msg.Body)
		} else {
			panic(reader)
		}

		body, _ := ioutil.ReadAll(reader)
		ioutil.WriteFile("body.html", body, 0644)
		// fmt.Printf(cd.ConvString(string(body)))
	}

	// 邮件里面可能有附件或者截图之类的东东
	if strings.HasPrefix(mediaType, "multipart/") {
		fmt.Printf("boundary = %s\n", params["boundary"])
		mr := multipart.NewReader(msg.Body, params["boundary"])
		for {
			p, err := mr.NextPart()
			if err == io.EOF {
				return
			}
			if err != nil {
				log.Fatal(err)
			}

			// slurp, err := ioutil.ReadAll(p)
			// if err != nil {
			// 	log.Fatal(err)
			// }

			ct := p.Header.Get("Content-Type")
			if strings.HasPrefix(ct, "text/") {
				cte := p.Header.Get("Content-Transfer-Encoding")
				cid := p.Header.Get("Content-ID")
				cdi := p.Header.Get("Content-Disposition")

				fmt.Printf("cte = %s, ct = %s, cid = %s, cdi = %s\n",
					cte, ct, cid, cdi)

				// quoted-printable 类型的内部已经处理过了
				var reader io.Reader
				if cte == "base64" {
					reader = base64.NewDecoder(base64.StdEncoding, p)
				} else {
					reader = p
				}

				body, _ := ioutil.ReadAll(reader)

				// src="cid:d3b11fe4b395a6995fcdb51988247200.png"
				var r = regexp.MustCompile(`src="cid:([^"]+)"`)
				body = r.ReplaceAll(body, []byte("src=\"$1\""))
				ioutil.WriteFile("body.html", body, 0644)
			} else if strings.HasPrefix(ct, "image/") {
				cte := p.Header.Get("Content-Transfer-Encoding")
				cid := p.Header.Get("Content-ID")
				cdi := p.Header.Get("Content-Disposition")

				fmt.Printf("cte = %s, ct = %s, cid = %s, cdi = %s\n",
					cte, ct, cid, cdi)
				var reader io.Reader
				if cte == "base64" {
					reader = base64.NewDecoder(base64.StdEncoding, p)
				}
				body, _ := ioutil.ReadAll(reader)

				filename := cid
				filename = strings.Replace(filename, "<", "", 1)
				filename = strings.Replace(filename, ">", "", 1)
				ioutil.WriteFile(filename, body, 0644)
			} else if p.Header.Get("Content-Disposition") != "" {
				cte := p.Header.Get("Content-Transfer-Encoding")
				cid := p.Header.Get("Content-ID")
				cdi := p.Header.Get("Content-Disposition")

				fmt.Printf("cte = %s, ct = %s, cid = %s, cdi = %s\n",
					cte, ct, cid, cdi)
				var reader io.Reader
				if cte == "base64" {
					reader = base64.NewDecoder(base64.StdEncoding, p)
				}
				body, _ := ioutil.ReadAll(reader)

				filename := RFC2047.Decode(p.FileName())
				ioutil.WriteFile(filename, body, 0644)
				fmt.Printf("p.FileName() = %s\n", filename)
			}

			// fmt.Printf("Part %q: %q\n", p.Header.Get("Content-Type"),
			// 	cd.ConvString(string(slurp)))
		}
	}
}
