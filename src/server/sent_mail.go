package main

import (
	"fmt"
	"log"

	"./RFC2047"
	"./base"
	"./net/mail"
)

func main() {
	config, err := base.GetConfig("config.yml")
	if err != nil {
		log.Panic(err)
	}

	// the basics
	from := &mail.Address{"李玉北", "liyubei@baidu.com"}
	to := []*mail.Address{
		&mail.Address{"leeight", "liyubei@baidu.com"},
		&mail.Address{"李玉北", "liyubei@baidu.com"},
	}
	cc := []*mail.Address{
		&mail.Address{"leeight", "leeight@gmail.com"},
	}
	body := "this is the body line1.\nthis is the body line2.\nthis is the body line3.\n这个是邮件的正文"
	subject := "this is the subject line，这个是邮件的标题"

	// setup a map for the headers
	header := make(map[string]string)
	header["From"] = from.String()
	header["To"] = base.AddressToString(to)
	header["Cc"] = base.AddressToString(cc)
	header["Subject"] = RFC2047.Encode(subject)
	header["Content-Type"] = "text/plain; charset=\"utf-8\""

	// setup the message
	raw := base.EnvelopeMail(header, []byte(body))
	fmt.Println(string(raw))
	// return

	// setup the remote smtpserver & auth info
	smtpserver := config.Smtp.Hostname
	tls := config.Smtp.Tls
	auth := base.LoginAuth(config.Smtp.Username, config.Smtp.Password)

	err = base.SendMail(from, to, cc, raw, smtpserver, tls, auth)
	if err != nil {
		log.Panic(err)
	}
}
