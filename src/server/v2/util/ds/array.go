package ds

import (
	"strings"
)

type ArrayItem interface {
	String() string
}

type Array struct {
	buffer []interface{}
}

func (a *Array) Push(v interface{}) {
	a.buffer = append(a.buffer, v)
}

func (a *Array) Last() interface{} {
	if len(a.buffer) <= 0 {
		return ""
	}
	return a.buffer[len(a.buffer)-1]
}

func (a *Array) Get(i int) interface{} {
	return a.buffer[i]
}

func (a *Array) Set(i int, v interface{}) {
	a.buffer[i] = v
}

func (a *Array) Length() int {
	return len(a.buffer)
}

func (a *Array) Join(sep string) string {
	var result = make([]string, a.Length())
	for idx, item := range a.buffer {
		switch item.(type) {
		case ArrayItem:
			result[idx] = item.(ArrayItem).String()
		default:
			result[idx] = item.(string)
		}
	}
	return strings.Join(result, sep)
}

func NewArray() *Array {
	return &Array{buffer: make([]interface{}, 0)}
}
