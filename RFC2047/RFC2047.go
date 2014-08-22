package RFC2047

import (
    "io"
    "io/ioutil"
    "strings"
    "encoding/base64"
    "errors"
    "fmt"
    "bytes"
    "strconv"

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

func decodeRFC2047Word(s string) (string, error) {
    fields := strings.Split(s, "?")
    if len(fields) != 5 || fields[0] != "=" || fields[4] != "=" {
        return "", errors.New("string not RFC 2047 encoded")
    }
    charset, enc := strings.ToLower(fields[1]), strings.ToLower(fields[2])
    if charset != "iso-8859-1" &&
       charset != "utf-8" &&
       charset != "gb2312" &&
       charset != "gbk" {
        return "", fmt.Errorf("charset not supported: %q", charset)
    }

    in := bytes.NewBufferString(fields[3])
    var r io.Reader
    switch enc {
    case "b":
        r = base64.NewDecoder(base64.StdEncoding, in)
    case "q":
        r = qDecoder{r: in}
    default:
        return "", fmt.Errorf("RFC 2047 encoding not supported: %q", enc)
    }

    dec, err := ioutil.ReadAll(r)
    if err != nil {
        return "", err
    }

    switch charset {
    case "iso-8859-1":
        b := new(bytes.Buffer)
        for _, c := range dec {
            b.WriteRune(rune(c))
        }
        return b.String(), nil
    case "gbk":
        cd, err := iconv.Open("utf-8", "gbk")
        if err != nil {
            return "", err
        }
        defer cd.Close()
        return cd.ConvString(string(dec)), nil
    case "gb2312":
        cd, err := iconv.Open("utf-8", "gb2312")
        if err != nil {
            return "", err
        }
        defer cd.Close()
        return cd.ConvString(string(dec)), nil
    case "utf-8":
        return string(dec), nil
    }
    panic("unreachable")
}

func Decode(s string) (ret string) {
    sep := ""
    for _, p := range strings.Split(s, " ") {
        r, err := decodeRFC2047Word(p)
        if err != nil {
            ret += sep + p
        } else {
            ret += sep + r
        }
        sep = " "
    }
    return
}
