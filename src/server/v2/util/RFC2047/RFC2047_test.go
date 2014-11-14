package RFC2047

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"regexp"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestToTokens1(t *testing.T) {
	r := regexp.MustCompile(`(?i)=\?(?P<charset>[^\?]+)\?(?P<enc>[bq])\?(?P<data>[^\?]*)\?=`)
	s := "=?UTF-8?B?Y2hlLmJhaWR1LmNvbS3nmb7luqbnu5/orqHotovlir/liIbmnpDmiqXlkYpf?=  =?UTF-8?B?MjAxNDA5MDQtMjAxNDA5MDQ=?="
	ts := toTokens(s, r)

	assert.Equal(t, "=?UTF-8?B?Y2hlLmJhaWR1LmNvbS3nmb7luqbnu5/orqHotovlir/liIbmnpDmiqXlkYpf?=", ts[0])
	assert.Equal(t, "  ", ts[1])
	assert.Equal(t, "=?UTF-8?B?MjAxNDA5MDQtMjAxNDA5MDQ=?=", ts[2])
}

func TestToTokens2(t *testing.T) {
	r := regexp.MustCompile(`(?i)=\?(?P<charset>[^\?]+)\?(?P<enc>[bq])\?(?P<data>[^\?]*)\?=`)
	s := "=?UTF-8?B?Y2hlLmJhaWR1LmNvbS3nmb7luqbnu5/orqHotovlir/liIbmnpDmiqXlkYpf?==?UTF-8?B?MjAxNDA5MDQtMjAxNDA5MDQ=?="
	ts := toTokens(s, r)

	assert.Equal(t, "=?UTF-8?B?Y2hlLmJhaWR1LmNvbS3nmb7luqbnu5/orqHotovlir/liIbmnpDmiqXlkYpf?=", ts[0])
	assert.Equal(t, "=?UTF-8?B?MjAxNDA5MDQtMjAxNDA5MDQ=?=", ts[1])
}

func TestToTokens3(t *testing.T) {
	r := regexp.MustCompile(`(?i)=\?(?P<charset>[^\?]+)\?(?P<enc>[bq])\?(?P<data>[^\?]*)\?=`)
	s := "=?UTF-8?B?Y2hlLmJhaWR1LmNvbS3nmb7luqbnu5/orqHotovlir/liIbmnpDmiqXlkYpf?="
	ts := toTokens(s, r)

	assert.Equal(t, "=?UTF-8?B?Y2hlLmJhaWR1LmNvbS3nmb7luqbnu5/orqHotovlir/liIbmnpDmiqXlkYpf?=", ts[0])

	s = "=?GB2312?B?MjAxM8TqtLq5pNf3yvbWsF/W3MGrveA=?=.pptx"
	ts = toTokens(s, r)
	assert.Equal(t, 2, len(ts))
	assert.Equal(t, "=?GB2312?B?MjAxM8TqtLq5pNf3yvbWsF/W3MGrveA=?=", ts[0])
	assert.Equal(t, ".pptx", ts[1])
}

func BenchmarkDecode(*testing.B) {
	input := "Re: =?GB2312?B?x+u9zLnY09rHsLbLv/K83Le9w+a1xM7KzOI=?= =?utf-8?B?QWNjZXB0ZWQ6IOmCgOivt++8muWJjeerr+agh+WHhuWMlibmqKHlnZfljJY=?= =?utf-8?B?QWNjZXB0ZWQ6IOabtOaWsOmCgOivt++8muWJjeerr+agh+WHhuWMlibmqKE=?= =?UTF-8?B?44CQ56S+5oub566A5Y6G44CR5YyX5LqsRkUx5Lq64oCU4oCU5pyx6KOV57+U77yI?= =?UTF-8?B?6auY5b6377yJ?= [Cooder]baidu.array.=?ISO-2022-JP?B?ZWFjaBskQjtZO30bKEJOb2RlTGlzdA==?="
	Decode(input)
}

func TestDecode(t *testing.T) {
	input := "Re: =?GB2312?B?x+u9zLnY09rHsLbLv/K83Le9w+a1xM7KzOI=?= =?utf-8?B?QWNjZXB0ZWQ6IOmCgOivt++8muWJjeerr+agh+WHhuWMlibmqKHlnZfljJY=?= =?utf-8?B?QWNjZXB0ZWQ6IOabtOaWsOmCgOivt++8muWJjeerr+agh+WHhuWMlibmqKE=?= =?UTF-8?B?44CQ56S+5oub566A5Y6G44CR5YyX5LqsRkUx5Lq64oCU4oCU5pyx6KOV57+U77yI?= =?UTF-8?B?6auY5b6377yJ?= [Cooder]baidu.array.=?ISO-2022-JP?B?ZWFjaBskQjtZO30bKEJOb2RlTGlzdA==?="
	assert.Equal(t, "Re: 请教关于前端框架方面的问题Accepted: 邀请：前端标准化&模块化Accepted: 更新邀请：前端标准化&模【社招简历】北京FE1人——朱裕翔（高德） [Cooder]baidu.array.each支持NodeList", Decode(input))

	input = "=?UTF-8?B?Y2hlLmJhaWR1LmNvbS3nmb7luqbnu5/orqHotovlir/liIbmnpDmiqXlkYpf?=  =?UTF-8?B?MjAxNDA5MDQtMjAxNDA5MDQ=?="
	assert.Equal(t, "che.baidu.com-百度统计趋势分析报告_20140904-20140904",
		Decode(input))
	assert.Equal(t, "Re: che.baidu.com-百度统计趋势分析报告_20140904-20140904",
		Decode("Re: "+input))
	assert.Equal(t, "Re:che.baidu.com",
		Decode("Re:che.baidu.com"))
	assert.Equal(t, "2013年春工作述职_周莲洁.pptx",
		Decode("=?GB2312?B?MjAxM8TqtLq5pNf3yvbWsF/W3MGrveA=?=.pptx"))
	assert.Equal(t, "答复: Please tell me about VideoSearch UU(cookie) yesterday on LSP.",
		Decode("=?Big5?B?tarOYA==?=: Please tell me about VideoSearch UU(cookie) yesterday on LSP."))
	assert.Equal(t, "Re: 锦囊Localbuild近期规划",
		Decode("=?utf-8?Q?Re=3A_=E9=94=A6=E5=9B=8ALocalbuild=E8=BF=91=E6=9C=9F?= =?utf-8?Q?=E8=A7=84=E5=88=92?="))
	assert.Equal(t, "[����][LOG.BAIDU.COM][WARN]������ʱ������",
		Decode("[����][LOG.BAIDU.COM][WARN]������ʱ������"))
	assert.Equal(t, "Re: 答复:  短信文案修改",
		Decode("Re: =?Big5?B?tarOYA==?=: =?Big5?B?ILV1q0ik5a7Xrden7w==?="))
}

func TestDecodeSubject(t *testing.T) {
	input1 := "=?gb2312?Q?=5B=CC=E1=D0=D1=3A=D3=CA=BC=FE=C0=B4=D7=D4=CD=E2=B2=BF=5D__Re=3A_=CF=A3=CD?= =?gb2312?Q?=FB_WooYun-2014-82701_=D5=E2=B8=F6=CC=FB=D7=D3=B5=C4=C4=DA=C8=DD=B2=BB=D2?= =?gb2312?Q?=AA=B9=AB=BF=AA?="
	assert.Equal(t, "[提醒:邮件来自外部]  Re: 希望 WooYun-2014-82701 这个帖子的内容不要公开",
		Decode(input1))

	input2 := "=?gb2312?Q?=5B=CC=E1=D0=D1=3A=D3=CA=BC=FE=C0=B4=D7=D4=CD=E2=B2=BF=5D__Re=3A_=CF=A3=CD=FB_WooYun-2014-82701_=D5=E2=B8=F6=CC=FB=D7=D3=B5=C4=C4=DA=C8=DD=B2=BB=D2=AA=B9=AB=BF=AA?="
	assert.Equal(t, "[提醒:邮件来自外部]  Re: 希望 WooYun-2014-82701 这个帖子的内容不要公开",
		Decode(input2))
}

func BenchmarkDecode2(*testing.B) {
	var subjects = make([]string, 0)
	raw, _ := ioutil.ReadFile("../../subjects.txt")
	json.Unmarshal(raw, &subjects)
	for _, line := range subjects {
		e := Decode(line)
		if strings.Index(line, "?=") != -1 {
			fmt.Printf("%s\n", e)
		}
		if strings.Index(e, "?=") != -1 {
			fmt.Printf("%s => %s\n", line, e)
		}
	}
}
