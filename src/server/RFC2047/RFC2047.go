package RFC2047

import (
	"bytes"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"regexp"
	"strconv"
	"strings"

	"github.com/qiniu/iconv"
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

func decodeBuffer(s string) (string, []byte, error) {
	fields := strings.Split(s, "?")
	if len(fields) != 5 || fields[0] != "=" || fields[4] != "=" {
		return "", nil, errors.New("string not RFC 2047 encoded")
	}
	charset, enc := strings.ToLower(fields[1]), strings.ToLower(fields[2])
	if charset != "iso-8859-1" &&
		charset != "utf-8" &&
		charset != "gb18030" &&
		charset != "gb2312" &&
		charset != "gbk" {
		return "", nil, fmt.Errorf("charset not supported: %q", charset)
	}

	in := bytes.NewBufferString(fields[3])
	var r io.Reader
	switch enc {
	case "b":
		r = base64.NewDecoder(base64.StdEncoding, in)
	case "q":
		r = qDecoder{r: in}
	default:
		return "", nil, fmt.Errorf("RFC 2047 encoding not supported: %q", enc)
	}

	dec, err := ioutil.ReadAll(r)
	if err != nil {
		return "", nil, err
	}
	return charset, dec, nil
}

func decodeRFC2047Word(dec []byte, charset string) (string, error) {
	switch charset {
	case "iso-8859-1":
		b := new(bytes.Buffer)
		for _, c := range dec {
			b.WriteRune(rune(c))
		}
		return b.String(), nil
	case "gb18030":
		cd, err := iconv.Open("utf-8", "gb18030")
		if err != nil {
			return "", err
		}
		defer cd.Close()
		return cd.ConvString(string(dec)), nil
	default:
		return string(dec), nil
	}
	panic("unreachable")
}

func Decode(s string) string {
	// 正常情况下，应该是 ?= =?utf-8?B? 的
	// 但是有的邮件里面空格没有了，导致后面的逻辑
	// 运行不正常，我们这里处理一下，通过正则表达式检查一下是否
	// 有如下特征的字符串，有的话，我们删掉再处理
	// `(\?=)(=\?[^\?]+\?[BQbq]\?)`

	// raw/720430.txt 和 raw/720229.txt 是两种同样的场景但是
	// 用同样的方式解码是会失败的
	// =?UTF-8?B?6L+I55WM5Lit56eL6Iez6Ie75LmL56S8LeeRnuWjq0RlbGE=?==?UTF-8?B?ZsOpZS3kuJbnlYzpobbnuqfph5HnrpTmnb7pnLLlt6flhYvlipsg?=
	// =?utf-8?B?6ZiF5bqmwrDliIbkuqvkvJrmjqjojZDvvJrjgIrogYzlnLrigJznvo7kurrigJ3l?==?utf-8?B?hbvmiJDorrDjgItieeaXhea4uOWNq+inhue+juS4veS/j+S9s+S6uuS4k+WutuS+?==?utf-8?B?r+iBqu+8iDjmnIgyOeaXpe+8iQ==?=
	pattern := regexp.MustCompile(`(\?=)(=\?[^\?]+\?[BQbq]\?)`)
	if pattern.Match([]byte(s)) {
		s = string(pattern.ReplaceAll([]byte(s), []byte("$1 $2")))
	}

	var charset string
	var buffer, tb []byte
	var err error

	buffer = make([]byte, 0)
	for _, p := range strings.Split(s, " ") {
		charset, tb, err = decodeBuffer(p)
		if err != nil {
			return s
		} else {
			buffer = append(buffer, tb...)
		}
	}

	if charset == "gbk" || charset == "gb2312" {
		charset = "gb18030"
	}

	ret, err := decodeRFC2047Word(buffer, charset)
	if err != nil {
		return s
	}
	return ret
}
