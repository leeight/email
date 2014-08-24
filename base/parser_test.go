package base_test

import (
	"testing"

	"../base"
)

func TestParseContentDisposition(t *testing.T) {
	rv := base.ParseContentDisposition("hello")
	if rv["hello"] != "hello" {
		t.Errorf("base.ParseContentDisposition(%s): expected %s, actual %s",
			"hello", "hello", rv["hello"])
	}

	expected := "【知识推广】8.21入口开通名单.xlsx"
	input := "attachment; filename=\"=?gb2312?B?ob7Wqsq2zca546G/OC4yMcjrv9q/qs2ow/u1pS54bHN4?=\"; size=14296; creation-date=\"Thu, 21 Aug 2014 11:17:27 GMT\"; modification-date=\"Thu, 21 Aug 2014 11:19:56 GMT\""

	rv = base.ParseContentDisposition(input)

	if rv["filename"] != expected {
		t.Errorf("base.ParseContentDisposition(%s): expected %s, actual %s",
			input, expected, rv["filename"])
	}
}
