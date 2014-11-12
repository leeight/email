package models

// Response 就是一个简单的接口而已，没有实际的作用
type Response interface {
	Ok() bool
}

// PageType 是在列表页面返回的部分数据的封装
type PageType struct {
	TotalCount int64       `json:"totalCount"`
	PageNo     int         `json:"pageNo"`
	PageSize   int         `json:"pageSize"`
	OrderBy    string      `json:"orderBy"`
	Order      string      `json:"order"`
	Result     interface{} `json:"result"`
}

// ListResponse 是对于列表页面返回数据的封装
type ListResponse struct {
	Success string      `json:"success"`
	Message interface{} `json:"message"`
	Page    PageType    `json:"page"`
}

// SimpleResponse 是对于普通ajax请求返回数据的封装
type SimpleResponse struct {
	Success string      `json:"success"`
	Message interface{} `json:"message"`
	Result  interface{} `json:"result"`
}

// Ok 简单啊的实现
func (e SimpleResponse) Ok() bool {
	return true
}

// Ok 简单啊的实现
func (e ListResponse) Ok() bool {
	return true
}

// DefaultResult 默认的的返回结果，比如
// { "success": "true", "message": null, "result": {} }
type DefaultResult struct{}
