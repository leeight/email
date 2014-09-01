package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"../RFC2047"
	"../base"
	"../net/mail"
	"../web"
)

type MailPostHandler struct {
	Context web.Context
}

func (h MailPostHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := h.Context
	config := ctx.GetConfig()

	// 准备参数
	from, err := mail.ParseAddress(RFC2047.Encode(config.Frontend.Name) +
		" <" + config.Frontend.From + ">")
	if err != nil || from == nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	to := getAddressList(r.FormValue("to"))
	cc := getAddressList(r.FormValue("cc"))

	subject := r.FormValue("subject")
	message := r.FormValue("message")

	// 准备Header
	header := make(map[string]string)
	header["From"] = from.String()
	header["To"] = base.AddressToString(to)
	header["Cc"] = base.AddressToString(cc)
	header["Subject"] = RFC2047.Encode(subject)

	// 要发送的原始数据
	raw := base.EnvelopeMail(header, []byte(message))
	fmt.Println(string(raw))

	// 开始发送邮件
	smtpserver := config.Smtp.GetHostName()
	tls := config.Smtp.Tls
	auth := base.LoginAuth(config.Smtp.Username, config.Smtp.Password)

	err = base.SendMail(from, to, cc, raw, smtpserver, tls, auth)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	s, _ := json.MarshalIndent(
		base.NewSimpleResponse("true"), "", "    ")
	w.Write(s)
}

func getAddressList(value string) []*mail.Address {
	list := make([]*mail.Address, 0)
	for _, item := range strings.Split(value, "; ") {
		v, err := mail.ParseAddress(item)
		if err == nil {
			list = append(list, v)
		}
	}
	return list
}
