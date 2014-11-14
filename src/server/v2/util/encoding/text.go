package encoding

import (
	"bytes"
	"io/ioutil"
	"strings"

	"golang.org/x/text/encoding"
	// "golang.org/x/text/encoding/charmap"
	"golang.org/x/text/encoding/japanese"
	"golang.org/x/text/encoding/korean"
	"golang.org/x/text/encoding/simplifiedchinese"
	"golang.org/x/text/encoding/traditionalchinese"
	// "golang.org/x/text/encoding/unicode"
	"golang.org/x/text/transform"
)

var charsetMap map[string]encoding.Encoding

func init() {
	// 初始化 charsetMap
	charsetMap = make(map[string]encoding.Encoding)

	charsetMap["gb2312"] = simplifiedchinese.GB18030
	charsetMap["hz-gb2312"] = simplifiedchinese.GB18030
	charsetMap["hz-gb-2312"] = simplifiedchinese.GB18030
	charsetMap["gbk"] = simplifiedchinese.GB18030
	charsetMap["gb-18030"] = simplifiedchinese.GB18030
	charsetMap["gb18030"] = simplifiedchinese.GB18030
	charsetMap["big5"] = traditionalchinese.Big5
	charsetMap["shift-jis"] = japanese.ShiftJIS
	charsetMap["euc-jp"] = japanese.EUCJP
	charsetMap["iso-2022-jp"] = japanese.ISO2022JP
	charsetMap["windows-1252"] = simplifiedchinese.GB18030
	charsetMap["euc-kr"] = korean.EUCKR

	// TODO 其它的以后再说?
}

// DecodeString 对输入的文本 src 按照 e 的编码格式进行解码，返回 utf-8 编码的文本
// 如果有错误的话，一并返回
func DecodeString(src, e string) (string, error) {
	var t transform.Transformer
	if v, ok := charsetMap[strings.ToLower(e)]; ok {
		t = v.NewDecoder()
	} else {
		t = encoding.Nop.NewDecoder()
	}

	rInUTF8 := transform.NewReader(strings.NewReader(src), t)
	dst, err := ioutil.ReadAll(rInUTF8)
	return string(dst), err
}

// Decode 对输入的文本 src 按照 e 的编码格式进行解码，返回 utf-8 编码的文本
// 如果有错误的话，一并返回
func Decode(src []byte, e string) ([]byte, error) {
	var t transform.Transformer
	if v, ok := charsetMap[strings.ToLower(e)]; ok {
		t = v.NewDecoder()
	} else {
		t = encoding.Nop.NewDecoder()
	}

	rInUTF8 := transform.NewReader(bytes.NewReader(src), t)
	return ioutil.ReadAll(rInUTF8)
}
