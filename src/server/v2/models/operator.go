package models

import (
	"strings"

	"../../net/mail"
)

// Operator 的接口，只有一个 Exec 需要去实现
type Operator interface {
	Exec(a interface{}, b string) bool
}

// IsOperator Is
type IsOperator struct{}

// ContainsOperator Contains
type ContainsOperator struct{}

// ExistsOperator Exists
type ExistsOperator struct{}

// NegativeOperator Negative
type NegativeOperator struct {
	wrapper Operator
}

// Exec 是 IsOperator 的接口实现
func (x IsOperator) Exec(a interface{}, b string) bool {
	return a == b
}

// Exec 是 ContainsOperator 的接口实现
func (x ContainsOperator) Exec(a interface{}, b string) bool {
	switch a.(type) {
	case []*mail.Address:
		for _, item := range a.([]*mail.Address) {
			if item.Address == b || strings.Contains(item.Address, b) {
				return true
			}
		}
		return false
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
}

// Exec 是 ExistsOperator 的接口实现
func (x ExistsOperator) Exec(a interface{}, b string) bool {
	return false
}

// Exec 是 NegativeOperator 的接口实现
func (x NegativeOperator) Exec(a interface{}, b string) bool {
	return !x.wrapper.Exec(a, b)
}

// NewOperator 创建一个新的 Operator 对象
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
