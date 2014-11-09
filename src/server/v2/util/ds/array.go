package ds

import (
	"strings"
)

type Array struct {
	buffer []string
}

func (a *Array) Push(v string) {
	a.buffer = append(a.buffer, v)
}

func (a *Array) Last() string {
	if len(a.buffer) <= 0 {
		return ""
	}
	return a.buffer[len(a.buffer)-1]
}

func (a *Array) Get(i int) string {
	return a.buffer[i]
}

func (a *Array) Set(i int, v string) {
	a.buffer[i] = v
}

func (a *Array) Length() int {
	return len(a.buffer)
}

func (a *Array) Join(sep string) string {
	return strings.Join(a.buffer, sep)
}

func NewArray() *Array {
	return &Array{buffer: make([]string, 0)}
}
