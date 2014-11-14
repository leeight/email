package RFC2047

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"regexp"
	"strconv"
	"strings"

	"../encoding"
)

type qDecoder struct {
	r       io.Reader
	scratch [2]byte
}

func (qd qDecoder) Read(p []byte) (n int, err error) {
	// This method writes at most one byte into p.
	if len(p) == 0 {
		return 0, nil
	}
	if _, err := qd.r.Read(qd.scratch[:1]); err != nil {
		return 0, err
	}
	switch c := qd.scratch[0]; {
	case c == '=':
		if _, err := io.ReadFull(qd.r, qd.scratch[:2]); err != nil {
			return 0, err
		}
		x, err := strconv.ParseInt(string(qd.scratch[:2]), 16, 64)
		if err != nil {
			return 0, fmt.Errorf("mail: invalid RFC 2047 encoding: %q", qd.scratch[:2])
		}
		p[0] = byte(x)
	case c == '_':
		p[0] = ' '
	default:
		p[0] = c
	}
	return 1, nil
}

// Encode Encode
func Encode(s string) string {
	message := []byte(s)

	encoding := base64.StdEncoding
	message64 := make([]byte, encoding.EncodedLen(len(message)))
	encoding.Encode(message64, message)

	return "=?UTF-8?B?" + string(message64) + "?="
}

// 把输入 s 按照 r 的特征切分为多个字符串
func toTokens(s string, r *regexp.Regexp) []string {
	var tokens []string
	var i = -1
	for _, xk := range r.FindAllStringIndex(s, -1) {
		if (i + 1) != xk[0] {
			tokens = append(tokens, s[i+1:xk[0]])
		}
		tokens = append(tokens, s[xk[0]:xk[1]])
		i = xk[1] - 1
	}
	if i+1 != len(s) {
		tokens = append(tokens, s[i+1:len(s)])
	}
	return tokens
}

// Decode 输入的格式可能是各种各样的
// 例如："Re: =?GB2312?B?x+u9zLnY09rHsLbLv/K83Le9w+a1xM7KzOI=?= =?utf-8?B?QWNjZXB0ZWQ6IOmCgOivt++8muWJjeerr+agh+WHhuWMlibmqKHlnZfljJY=?= =?utf-8?B?QWNjZXB0ZWQ6IOabtOaWsOmCgOivt++8muWJjeerr+agh+WHhuWMlibmqKE=?= =?UTF-8?B?44CQ56S+5oub566A5Y6G44CR5YyX5LqsRkUx5Lq64oCU4oCU5pyx6KOV57+U77yI?= =?UTF-8?B?6auY5b6377yJ?= [Cooder]baidu.array.=?ISO-2022-JP?B?ZWFjaBskQjtZO30bKEJOb2RlTGlzdA==?="
// 里面存在不太的编码类型，gb2312，utf-8，ISO-2022-JP等等
func Decode(s string) string {
	r := regexp.MustCompile(`(?i)=\?(?P<charset>[^\?]+)\?(?P<enc>[bq])\?(?P<data>[^\?]*)\?=`)
	if !r.MatchString(s) {
		// 如果没有需要 Decode 的特征字符串，就什么也不需要搞了，直接返回即可
		return s
	}

	var tokens = toTokens(s, r)

	// result里面的都是utf-8的东东
	var result []byte

	// 如果是多个 gbk gb2312 gb18030 的 token，就需要连接到一起，然后一起来decode
	var tmpbuf []byte

	// 默认是空字符串，用来判断是否需要把多个 token 连到一起
	var tmpflg = false

	var usetmp = func() {
		if tmpflg {
			x, err := encoding.Decode(tmpbuf, "gb18030")
			if err != nil {
				log.Printf("%s, %v", s, err)
			}
			result = append(result, x[:]...)
		}
		tmpflg = false
	}

	for _, token := range tokens {
		if r.MatchString(token) {
			m := r.FindStringSubmatch(token)
			c, e, d := strings.ToLower(m[1]), strings.ToLower(m[2]), m[3]

			var in = bytes.NewBufferString(d)
			var r io.Reader
			switch e {
			case "b":
				r = base64.NewDecoder(base64.StdEncoding, in)
				break
			case "q":
				r = qDecoder{r: in}
				break
			default:
				// TODO
				break
			}

			raw, err := ioutil.ReadAll(r)
			if err != nil {
				log.Printf("%s, %v", token, err)
				continue
			}

			if regexp.MustCompile(`(gbk|gb2312|gb18030)`).MatchString(c) {
				tmpflg = true
				tmpbuf = append(tmpbuf, raw[:]...)
			} else {
				usetmp()

				x, err := encoding.Decode(raw, c)
				if err != nil {
					log.Printf("%s, %v", token, err)
				}
				result = append(result, x[:]...)
			}
		} else if strings.TrimSpace(token) != "" {
			usetmp()

			x := []byte(token)
			result = append(result, x[:]...)
		}
	}
	usetmp()

	return strings.TrimSpace(string(result))
}

// func Decode(s string) string {
// 	// ?=\s=? 替换一下?
// 	// s = regexp.MustCompile(`\?=\s+=\?`).ReplaceAllString(s, "?==?")
// 	return strings.TrimSpace(Decode2(s))
// }
