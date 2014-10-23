package handlers

import (
	"io/ioutil"
	"net/http"
	"path"

	"../web"
)

type PcsOAuthRedirectHandler struct {
	Context web.Context
}

// http://developer.baidu.com/wiki/index.php?title=docs/oauth/authorization
func (h PcsOAuthRedirectHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	config := h.Context.GetConfig()

	var code = r.URL.Query().Get("code")
	var url = "https://openapi.baidu.com/oauth/2.0/token?" +
		"grant_type=authorization_code&" +
		"code=" + code + "&" +
		"client_id=sO9daRmMp9hY6GZ0WfGTfZX1&" +
		"client_secret=a9pxdjaFb5jVSGt7HvStNwEfspP8NxoD&" +
		"redirect_uri=http%3A%2F%2F127.0.0.1%3A8848%2Fapi%2Fpcs%2Foauth_redirect"

	resp, err := http.Get(url)
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}

	if resp.StatusCode != 200 {
		http.Error(w, string(body), http.StatusServiceUnavailable)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(body)

	ioutil.WriteFile(path.Join(config.Dirs.Base, "netdisk.json"), body, 0644)
	// json.Unmarshal(body, &config.Service.Netdisk)
	// log.Info("%v", config.Service.Netdisk)

	// {
	//   "access_token": "1.a6b7dbd428f731035f771b8d15063f61.86400.1292922000-2346678-124328",
	//   "expires_in": 86400,
	//   "refresh_token": "2.385d55f8615fdfd9edb7c4b5ebdc3e39.604800.1293440400-2346678-124328",
	//   "scope": "basic email",
	//   "session_key": "ANXxSNjwQDugf8615OnqeikRMu2bKaXCdlLxn",
	//   "session_secret": "248APxvxjCZ0VEC43EYrvxqaK4oZExMB",
	// }
}
