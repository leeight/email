package ds

import (
	"strings"
)

// ArrayItem 具备一个 String() 接口
type ArrayItem interface {
	String() string
}

// Array 类似 JavaScript 中的 Array，可以 Push 和 Join
type Array struct {
	buffer []interface{}
}

// Push 往数组中新增一个元素
func (a *Array) Push(v interface{}) {
	a.buffer = append(a.buffer, v)
}

// Last 获取数组中最后一个元素，如果数组为空，返回 ""
func (a *Array) Last() interface{} {
	if len(a.buffer) <= 0 {
		return ""
	}
	return a.buffer[len(a.buffer)-1]
}

// Get 获取数组中指定的元素
func (a *Array) Get(i int) interface{} {
	return a.buffer[i]
}

// Set 设置数组中指定元素的值
func (a *Array) Set(i int, v interface{}) {
	a.buffer[i] = v
}

// Length 获取数组的长度
func (a *Array) Length() int {
	return len(a.buffer)
}

// Join 把数组中的各项用分隔符 sep 连接起来，返回字符串
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

// NewArray 创建一个新的数组
func NewArray() *Array {
	return &Array{buffer: make([]interface{}, 0)}
}
