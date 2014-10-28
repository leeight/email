package models

type Response interface {
	Ok() bool
}

type PageType struct {
	TotalCount int64       `json:"totalCount"`
	PageNo     int         `json:"pageNo"`
	PageSize   int         `json:"pageSize"`
	OrderBy    string      `json:"orderBy"`
	Order      string      `json:"order"`
	Result     interface{} `json:"result"`
}

type ListResponse struct {
	Success string      `json:"success"`
	Message interface{} `json:"message"`
	Page    PageType    `json:"page"`
}

type SimpleResponse struct {
	Success string      `json:"success"`
	Message interface{} `json:"message"`
	Result  interface{} `json:"result"`
}

func (this SimpleResponse) Ok() bool {
	return true
}

func (this ListResponse) Ok() bool {
	return true
}

type DefaultResult struct{}
