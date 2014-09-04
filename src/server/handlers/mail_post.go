package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path"
	"regexp"
	"strings"
	"time"

	"../RFC2047"
	"../base"
	"../net/mail"
	"../web"
)

type RawResourceReader struct {
	config *base.ServerConfig
}

// name的格式可能是这样子的
// 123456/cid/a.gif
// abcdef/att/b.doc
// tmpdir/cid/aaa.gif
// tmpdir/att/aaa.gif
func (rrr RawResourceReader) Read(name string) ([]byte, error) {
	return ioutil.ReadFile(path.Join(rrr.config.DownloadDir(), name))
}

type MailPostHandler struct {
	Context web.Context
}

func (h MailPostHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := h.Context
	log := ctx.GetLogger()
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

	var attachments []string
	var contentIds []string
	var body []byte

	if r.FormValue("attachments") != "" {
		// TODO(user) 校验合法性
		attachments = strings.Split(r.FormValue("attachments"), "; ")
	}

	// 查找HTML邮件内容中是否存在Content-Id的引用
	re := regexp.MustCompile(`src="downloads/([^/]+)/cid/([^"]+)"`)
	sm := re.FindAllSubmatch([]byte(message), -1)
	for _, match := range sm {
		src := path.Join(string(match[1]), "cid", string(match[2]))
		if _, err := os.Stat(path.Join(config.DownloadDir(), src)); err == nil {
			contentIds = append(contentIds, src)
		}
	}
	if len(contentIds) > 0 {
		// 如果存在的话，替换HTML内容中的资源引用方式
		// 参考：https://www.ietf.org/rfc/rfc2392.txt
		message = re.ReplaceAllString(message, `src="cid:$2"`)
	}

	rrr := RawResourceReader{config}
	if len(contentIds) > 0 && len(attachments) <= 0 {
		re := base.RelatedEnvelope{
			Message:    message,
			ContentIds: contentIds,
		}
		body, err = re.Enclose(rrr)
		for k, v := range re.Headers() {
			header[k] = v[0]
		}
	} else if len(attachments) > 0 {
		me := base.MixedEnvelope{
			Message:     message,
			ContentIds:  contentIds,
			Attachments: attachments,
		}
		body, err = me.Enclose(rrr)
		for k, v := range me.Headers() {
			header[k] = v[0]
		}
	} else {
		se := base.SimpleEnvelope{message}
		body, err = se.Enclose(rrr)
		for k, v := range se.Headers() {
			header[k] = v[0]
		}
	}

	if err != nil {
		log.Warning("%v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 构造整个邮件的内容
	raw := &bytes.Buffer{}
	for k, v := range header {
		raw.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	raw.WriteString("\r\n")
	raw.Write(body)

	// ioutil.WriteFile("raw.txt", raw.Bytes(), 0644)
	// return

	// 开始发送邮件
	go sendMail(ctx, from, to, cc, raw.Bytes())

	s, _ := json.MarshalIndent(
		base.NewSimpleResponse("true"), "", "    ")
	w.Write(s)
}

func sendMail(ctx web.Context, from *mail.Address, to []*mail.Address, cc []*mail.Address, raw []byte) {
	log := ctx.GetLogger()
	config := ctx.GetConfig()

	smtpserver := config.Smtp.GetHostName()
	tls := config.Smtp.Tls
	auth := base.LoginAuth(config.Smtp.Username, config.Smtp.Password)

	err := base.SendMail(from, to, cc, raw, smtpserver, tls, auth)
	if err != nil {
		log.Warning(err.Error())
		return
	}

	// 保存发送之后的邮件到本地
	name := fmt.Sprintf("%d.txt", time.Now().UnixNano())
	os.MkdirAll(path.Join(config.RawDir(), "sent"), 0755)
	err = ioutil.WriteFile(path.Join(config.RawDir(), "sent", name), raw, 0644)
	if err != nil {
		log.Warning(err.Error())
		return
	}
	log.Info("Saved Sent mail = %s", name)
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
