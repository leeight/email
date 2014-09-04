package task

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net"
	"net/http"
	"net/url"
	"os"
	"path"
	"strconv"
	"strings"

	"../web"
)

type taskResponse struct {
	Errno  int64 `json:"errno"`
	Errmsg int64 `json:"errmsg"`
	Logid  int64 `json:"logid"`
}

// http://play.golang.org/p/BDt3qEQ_2H
func externalIP() (string, error) {
	ifaces, err := net.Interfaces()
	if err != nil {
		return "", err
	}
	for _, iface := range ifaces {
		if iface.Flags&net.FlagUp == 0 {
			continue // interface down
		}
		if iface.Flags&net.FlagLoopback != 0 {
			continue // loopback interface
		}
		addrs, err := iface.Addrs()
		if err != nil {
			return "", err
		}
		for _, addr := range addrs {
			var ip net.IP
			switch v := addr.(type) {
			case *net.IPNet:
				ip = v.IP
			case *net.IPAddr:
				ip = v.IP
			}
			if ip == nil || ip.IsLoopback() {
				continue
			}
			ip = ip.To4()
			if ip == nil {
				continue // not an ipv4 address
			}
			return ip.String(), nil
		}
	}
	return "", errors.New("are you connected to the network?")
}

// 启动一个文档转码的服务
// name的格式应该是 uidl/att/xxx.docx
func NewDocTransferTask(name string, ctx web.Context) {
	log := ctx.GetLogger()
	config := ctx.GetConfig()

	// 转码服务的配置信息
	docsrv := config.Service.Doc

	// 当前webserver的IP和端口信息
	srvip, err := externalIP()
	if err != nil {
		log.Warning(err.Error())
		return
	}

	shost := fmt.Sprintf("http://%s:%d", srvip, config.Http.Port)

	// 计算文档的ID
	docid := base64.StdEncoding.EncodeToString([]byte(name))

	// 计算wurl的内容
	wurl := fmt.Sprintf("%s/api/doc/feedback?docid=%s",
		shost, url.QueryEscape(docid))

	// 计算rurl的内容
	// 因为文件名出现中文的可能性很大，所以把中文的编码一下
	parts := strings.Split(name, string(os.PathSeparator))
	rurl := fmt.Sprintf("%s/downloads/%s/%s/%s",
		shost,
		url.QueryEscape(parts[0]),
		url.QueryEscape(parts[1]),
		url.QueryEscape(parts[2]))

	// 计算nurl的内容
	nurl := fmt.Sprintf("%s/api/doc/notify?docid=%s",
		shost, url.QueryEscape(docid))

	queries := url.Values{}
	queries.Set("pid", strconv.Itoa(docsrv.Pid))
	queries.Set("token", docsrv.Token)
	queries.Set("rurl", rurl)
	queries.Set("wurl", wurl)
	queries.Set("nurl", nurl)
	queries.Set("did", docid)
	queries.Set("sformat", path.Ext(name)[1:])
	queries.Set("tformat", docsrv.Tformat)

	// log.Info("%s", queries.Encode())
	// return
	apiUrl := docsrv.Url + "?" + queries.Encode()
	log.Info("%s", apiUrl)
	// return

	response, err := http.Get(apiUrl)
	if err != nil {
		log.Warning("%s, %s", name, err.Error())
	} else {
		defer response.Body.Close()
		contents, err := ioutil.ReadAll(response.Body)
		if err != nil {
			log.Warning("%s, %s", name, err.Error())
		}

		var result taskResponse
		json.Unmarshal(contents, &result)
		if result.Errno != 0 {
			log.Warning("%s, %s", name, string(contents))
		}
		log.Info("OK %s, %s", name, string(contents))
	}
}
