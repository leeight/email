package base

import (
	"strings"

	"../net/mail"
)

type Operator interface {
	Exec(a interface{}, b string) bool
}

type IsOperator struct{}
type ContainsOperator struct{}
type ExistsOperator struct{}

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

func (this ExistsOperator) Exec(a interface{}, b string) bool {
	return a == b
}

func NewOperator(t string) Operator {
	switch t {
	case "Is":
		return IsOperator{}
	case "Contains":
		return ContainsOperator{}
	case "Exists":
		return ExistsOperator{}
	}
	return nil
}
