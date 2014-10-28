package models

import (
	"strings"

	"../../net/mail"
)

type Operator interface {
	Exec(a interface{}, b string) bool
}

type IsOperator struct{}
type ContainsOperator struct{}
type ExistsOperator struct{}
type NegativeOperator struct {
	wrapper Operator
}

func (this IsOperator) Exec(a interface{}, b string) bool {
	return a == b
}

func (this ContainsOperator) Exec(a interface{}, b string) bool {
	switch a.(type) {
	case []*mail.Address:
		for _, item := range a.([]*mail.Address) {
			if item.Address == b || strings.Contains(item.Address, b) {
				return true
			}
		}
		return false
		break
	case []string:
		for _, item := range a.([]string) {
			if item == b || strings.Contains(item, b) {
				return true
			}
		}
		return false
	case string:
		item := a.(string)
		return item == b || strings.Contains(item, b)
	default:
		return false
	}
	return false
}

// TODO(user) 暂未实现
func (this ExistsOperator) Exec(a interface{}, b string) bool {
	return false
}

func (this NegativeOperator) Exec(a interface{}, b string) bool {
	return !this.wrapper.Exec(a, b)
}

func NewOperator(t string) Operator {
	var o Operator
	var negative = strings.HasPrefix(t, "!")

	if negative {
		t = strings.Replace(t, "!", "", 1)
	}

	switch t {
	case "Is":
		o = IsOperator{}
	case "Contains":
		o = ContainsOperator{}
	case "Exists":
		o = ExistsOperator{}
	default:
		return nil
	}

	if negative {
		o = NegativeOperator{wrapper: o}
	}

	return o
}
