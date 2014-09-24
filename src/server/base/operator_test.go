package base

import (
	"testing"

	"../net/mail"
)

func TestNewOperator(t *testing.T) {
	var tests = []struct {
		t        string
		a        interface{}
		b        string
		expected bool
	}{
		{"Is", "x", "x", true},
		{"!Is", "x", "x", false},
		{"Is", "x", "y", false},
		{"!Is", "x", "y", true},

		{"Contains", []string{"x"}, "x", true},
		{"Contains", []string{"x"}, "y", false},
		{"!Contains", []string{"x"}, "y", true},

		{"Contains", []*mail.Address{
			{Name: "X", Address: "liyubei@baidu.com"},
			{Name: "X", Address: "leeight@gmail.com"},
		}, "@baidu.com", true},
		{"!Contains", []*mail.Address{
			{Name: "X", Address: "leeight@gmail.com"},
		}, "@baidu.com", true},
	}

	for _, item := range tests {
		o := NewOperator(item.t)
		x := o.Exec(item.a, item.b)
		if x != item.expected {
			t.Error("For", item, "expected", item.expected, "get", x)
		}
	}
}
