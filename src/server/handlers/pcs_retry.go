package handlers

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"
	"path"

	"../base"
	"../base/netdisk"
	"../web"
)

type PcsRetryHandler struct {
	Context web.Context
}

// http://developer.baidu.com/wiki/index.php?title=docs/oauth/authorization
func (h PcsRetryHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	config := h.Context.GetConfig()
	log := h.Context.GetLogger()

	uidl := r.FormValue("uidl")
	downloadDir := path.Join(config.DownloadDir(), uidl, "att")

	if _, err := os.Stat(downloadDir); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// 读取文件列表，然后一次上传即可
	fileInfos, err := ioutil.ReadDir(downloadDir)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if config.Service.Netdisk.AccessToken == "" {
		http.Error(w, "Invalid AccessToken", http.StatusBadRequest)
		return
	}

	for _, item := range fileInfos {
		if item.IsDir() {
			continue
		}

		go func() {
			body, err := ioutil.ReadFile(path.Join(downloadDir, item.Name()))
			if err != nil {
				log.Warning("%s", err)
				return
			}

			err = netdisk.WriteFile(
				config.Service.Netdisk.AccessToken,
				config.NetdiskFile(item.Name(), uidl),
				body)
			if err != nil {
				log.Warning("%s", err)
			} else {
				log.Info("Successfully Uploaded %s", item.Name())
			}
		}()
	}

	s, _ := json.MarshalIndent(
		base.NewSimpleResponse("true"), "", "    ")
	w.Write(s)
}
