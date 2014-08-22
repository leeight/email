package base

import (
  "strings"
  "regexp"

  "../RFC2047"
)

// 工具类
// Content-Disposition: attachment;
//        filename="=?gb2312?B?ob7Wqsq2zca546G/OC4yMcjrv9q/qs2ow/u1pS54bHN4?=";
//        size=14296; creation-date="Thu, 21 Aug 2014 11:17:27 GMT";
//        modification-date="Thu, 21 Aug 2014 11:19:56 GMT"

func ParseContentDisposition(cd string) (map[string]string) {
  var r = regexp.MustCompile(`^"|"$`)

  rv := make(map[string]string)
  for _, item := range strings.Split(cd, "; ") {
    var key string
    var value string

    chunks := strings.SplitN(item, "=", 2)
    key = chunks[0]

    if len(chunks) == 1 {
      value = key
    } else if len(chunks) == 2 {
      value = chunks[1]
    }

    if strings.HasPrefix(value, "\"") {
      value = string(r.ReplaceAll([]byte(value), []byte("")))
    }

    if key == "filename" {
      value = RFC2047.Decode(value)
    }

    rv[key] = value
  }

  return rv
}
