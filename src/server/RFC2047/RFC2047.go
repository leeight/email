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
	var charset string

	r := regexp.MustCompile(`(?i)=\?(?P<charset>[^\?]+)\?(?P<enc>[bq])\?(?P<data>[^\?]*)\?=`)
	t := r.ReplaceAllStringFunc(s, func(m string) string {
		fields := strings.Split(m[2:len(m)-2], "?")
		if len(fields) != 3 {
			return m
		}

		c, e, d := strings.ToLower(fields[0]), strings.ToLower(fields[1]), fields[2]
		if d == "" {
			return ""
		}

		// http://w3techs.com/technologies/comparison/en-gb18030,en-gbk,en-windows1252
		if c == "gbk" || c == "gb2312" || c == "windows-1252" {
			c = "gb18030"
		}
		charset = c

		var in = bytes.NewBufferString(d)
		var r io.Reader
		switch e {
		case "b":
			r = base64.NewDecoder(base64.StdEncoding, in)
		case "q":
			r = qDecoder{r: in}
		default:
			return d
		}

		raw, err := ioutil.ReadAll(r)
		if err != nil {
			return d
		}

		return string(raw)
	})

	if charset == "" {
		return t
	}

	cd, err := iconv.Open("utf-8", charset)
	if err != nil {
		return t
	}
	defer cd.Close()
	return cd.ConvString(t)
}

func Decode(s string) string {
	// ?=\s=? 替换一下?
	s = regexp.MustCompile(`\?=\s+=\?`).ReplaceAllString(s, "?==?")
	return strings.TrimSpace(Decode2(s))
}
