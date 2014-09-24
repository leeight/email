package handlers

import (
	"crypto/md5"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path"

	// "../base"
	"../web"
)

type serverConfig struct {
	ImageMaxSize    int      `json:"imageMaxSize"`
	ImageAllowFiles []string `json:"imageAllowFiles"`
	ImageFieldName  string   `json:"imageFieldName"`
	ImageActionName string   `json:"imageActionName"`
	ImageUrlPrefix  string   `json:"imageUrlPrefix"`
}

// UploadControllerHandler 处理文件和图片上传的功能
type UploadControllerHandler struct {
	Context web.Context
}

func (h UploadControllerHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch r.URL.Query().Get("action") {
	case "config":
		h.sendServerConfig(w, r)
	case "image":
		h.receiveImageUpload(w, r)
	default:
		http.Error(w, "Invalid request", http.StatusBadRequest)
	}
}

// 收到上面图片的请求了
// Request Payload
// ------WebKitFormBoundaryHvs30S8h1wM7oosB
// Content-Disposition: form-data; name="image"; filename="blob.png"
// Content-Type: image/png

// ------WebKitFormBoundaryHvs30S8h1wM7oosB
// Content-Disposition: form-data; name="type"

// ajax
// ------WebKitFormBoundaryHvs30S8h1wM7oosB--
func (h UploadControllerHandler) receiveImageUpload(w http.ResponseWriter, r *http.Request) {
	log := h.Context.GetLogger()
	config := h.Context.GetConfig()

	if err := r.ParseMultipartForm(-1); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Warning("%s", err)
		return
	}

	for key, value := range r.MultipartForm.Value {
		// fmt.Fprintf(w, "%s:%s ", key, value)
		log.Info("%s:%s", key, value)
	}

	for _, fileHeaders := range r.MultipartForm.File {
		for _, fileHeader := range fileHeaders {
			file, _ := fileHeader.Open()
			buf, _ := ioutil.ReadAll(file)

			abspath := path.Join(
				config.DownloadDir(),
				"00000",
				"cid",
				fmt.Sprintf("%x%s",
					md5.Sum(buf),
					path.Ext(fileHeader.Filename),
				),
			)
			log.Info("Uploaded Image = [%s]", abspath)
			os.MkdirAll(path.Dir(abspath), 0755)

			err := ioutil.WriteFile(abspath, buf, 0644)
			if err != nil {
				log.Warning("%s", err)
			}

			w.Write([]byte(fmt.Sprintf(`{"state": "SUCCESS", "url": "downloads/00000/cid/%s"}`,
				path.Base(abspath))))
		}
	}
}

// 按照文档里面的规定：http://fex-team.github.io/ueditor/#server-deploy
// 这里应该通过JSON返回一些服务器的配置信息
func (h UploadControllerHandler) sendServerConfig(w http.ResponseWriter, r *http.Request) {
	var config = &serverConfig{
		2048 * 1024,
		[]string{".png", ".jpg", ".jpeg", ".gif", ".bmp"},
		"image",
		"image",
		"",
	}
	data, _ := json.Marshal(config)
	w.Write(data)
}
