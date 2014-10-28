package storage

import (
	"bytes"
	"crypto/tls"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net"
	"net/http"
	"net/textproto"
	"net/url"
	"path"
	"time"
)

type netdiskStorage struct {
	token, dst string
	data       []byte
}

func (n netdiskStorage) Save() error {
	v := url.Values{}
	v.Add("method", "upload")
	v.Add("access_token", n.token)
	v.Add("path", n.dst)
	v.Add("ondup", "overwrite")

	raw := &bytes.Buffer{}
	writer := multipart.NewWriter(raw)

	header := make(textproto.MIMEHeader)
	header.Set("Content-Type", "application/octet-stream")
	header.Set("Content-Disposition",
		fmt.Sprintf("form-data; name=\"file\"; filename=\"%s\"", path.Base(n.dst)))

	part, err := writer.CreatePart(header)
	if err != nil {
		log.Println(err)
		return err
	}

	_, err = part.Write(n.data)
	if err != nil {
		log.Println(err)
		return err
	}

	contentType := writer.FormDataContentType()
	writer.Close()

	tr := &http.Transport{
		// 下面这三个配置是http模块里面的默认配置（Proxy, Dial, TLSHandshakeTimeout）
		Proxy: http.ProxyFromEnvironment,
		Dial: (&net.Dialer{
			Timeout:   30 * time.Second,
			KeepAlive: 30 * time.Second,
		}).Dial,
		TLSHandshakeTimeout: 10 * time.Second,

		// XXX 有时候发现证书是有问题的，很奇怪
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{Transport: tr}

	targetUrl := "https://c.pcs.baidu.com/rest/2.0/pcs/file?" + v.Encode()
	resp, err := client.Post(targetUrl, contentType, raw)
	if err != nil {
		log.Println(err)
		return err
	}
	defer resp.Body.Close()

	xyz, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println(err)
		return err
	}

	if resp.StatusCode != 200 {
		log.Println(string(xyz))
		return errors.New(string(xyz))
	}

	log.Printf("Uploaded file %s", n.dst)

	return nil
}

// 百度网盘的存储接口
func NewNetdiskStorage(token, dst string, data []byte) Storage {
	log.Printf("Uploading file %s", dst)
	return netdiskStorage{token, dst, data}
}
