package RFC2047

import (
	"bytes"
	"encoding/base64"
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

func Encode(s string) string {
	message := []byte(s)

	encoding := base64.StdEncoding
	message64 := make([]byte, encoding.EncodedLen(len(message)))
	encoding.Encode(message64, message)

	return "=?UTF-8?B?" + string(message64) + "?="
}

func Decode2(s string) string {
	// =?Big5?B?tarOYA==?=
	r := regexp.MustCompile(`(?i)=\?(?P<charset>[^\?]+)\?(?P<enc>[bq])\?(?P<data>[^\?]*)\?=`)
	return r.ReplaceAllStringFunc(s, func(m string) string {
		fields := strings.Split(m[2:len(m)-2], "?")
		if len(fields) != 3 {
			return m
		}

		if fields[2] == "" {
			return ""
		}

		charset, enc := strings.ToLower(fields[0]), strings.ToLower(fields[1])
		// http://w3techs.com/technologies/comparison/en-gb18030,en-gbk,en-windows1252
		if charset == "gbk" || charset == "gb2312" || charset == "windows-1252" {
			charset = "gb18030"
		}

		var in = bytes.NewBufferString(fields[2])
		var r io.Reader
		switch enc {
		case "b":
			r = base64.NewDecoder(base64.StdEncoding, in)
		case "q":
			r = qDecoder{r: in}
		default:
			return s
		}

		raw, err := ioutil.ReadAll(r)
		if err != nil {
			return s
		}

		if charset == "utf-8" {
			return string(raw)
		}

		cd, err := iconv.Open("utf-8", charset)
		if err != nil {
			return s
		}
		defer cd.Close()
		return cd.ConvString(string(raw))
	})
}

func Decode(s string) string {
	// ?=\s=? 替换一下?
	s = regexp.MustCompile(`\?=\s+=\?`).ReplaceAllString(s, "?==?")
	// 如果是 quoted-printed 编码，例如 ?==?gb2312?Q?，就删除之，把前后两部分联起来
	// ISSUE-729676
	s = regexp.MustCompile(`\?==\?([^\?]+)\?[Qq]\?`).ReplaceAllString(s, "")
	return strings.TrimSpace(Decode2(s))
}
