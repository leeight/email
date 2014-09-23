package RFC2047_test

// =?UTF-8?B?Y2hlLmJhaWR1LmNvbS3nmb7luqbnu5/orqHotovlir/liIbmnpDmiqXlkYpf?=  =?UTF-8?B?MjAxNDA5MDQtMjAxNDA5MDQ=?=

import (
	"fmt"
	"io/ioutil"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"

	"../RFC2047"
)

func TestDecode(t *testing.T) {
	input := "=?UTF-8?B?Y2hlLmJhaWR1LmNvbS3nmb7luqbnu5/orqHotovlir/liIbmnpDmiqXlkYpf?=  =?UTF-8?B?MjAxNDA5MDQtMjAxNDA5MDQ=?="
	assert.Equal(t, "che.baidu.com-百度统计趋势分析报告_  20140904-20140904",
		RFC2047.Decode2(input))
	assert.Equal(t, "Re: che.baidu.com-百度统计趋势分析报告_  20140904-20140904",
		RFC2047.Decode2("Re: "+input))
	assert.Equal(t, "Re:che.baidu.com",
		RFC2047.Decode2("Re:che.baidu.com"))
	assert.Equal(t, "2013年春工作述职_周莲洁.pptx",
		RFC2047.Decode2("=?GB2312?B?MjAxM8TqtLq5pNf3yvbWsF/W3MGrveA=?=.pptx"))
	assert.Equal(t, "答复: Please tell me about VideoSearch UU(cookie) yesterday on LSP.",
		RFC2047.Decode2("=?Big5?B?tarOYA==?=: Please tell me about VideoSearch UU(cookie) yesterday on LSP."))
	assert.Equal(t, "Re: 锦囊Localbuild近期 规划",
		RFC2047.Decode2("=?utf-8?Q?Re=3A_=E9=94=A6=E5=9B=8ALocalbuild=E8=BF=91=E6=9C=9F?= =?utf-8?Q?=E8=A7=84=E5=88=92?="))
	assert.Equal(t, "[����][LOG.BAIDU.COM][WARN]������ʱ������",
		RFC2047.Decode2("[����][LOG.BAIDU.COM][WARN]������ʱ������"))
	assert.Equal(t, "Re: 答复:  短信文案修改",
		RFC2047.Decode2("Re: =?Big5?B?tarOYA==?=: =?Big5?B?ILV1q0ik5a7Xrden7w==?="))
}

func TestDecode2(t *testing.T) {
	raw, _ := ioutil.ReadFile("i.txt")
	for _, line := range strings.Split(string(raw), "\n") {
		e := RFC2047.Decode2(line)
		if line == e || strings.Index(e, "?=") != -1 {
			fmt.Printf("%s => %s\n", line, e)
		}
	}
}
