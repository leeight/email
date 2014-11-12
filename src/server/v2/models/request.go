package models

// InboxControllerSchema 是邮件列表页面的请求提交的参数
type InboxControllerSchema struct {
	PageSize   int `form:"pageSize"`
	PageNo     int `form:"pageNo"`
	LabelID    int `form:"label"`
	UnRead     int `form:"unreadOnly"`
	IsDelete   int `form:"is_delete"`
	IsStar     int `form:"is_star"`
	IsSent     int `form:"is_sent"`
	IsCalendar int `form:"is_calendar"`
	Offset     int `form:"-"`
}

// Init 初始化请求参数的默认值
func (r *InboxControllerSchema) Init() {
	if r.PageSize == 0 {
		r.PageSize = 15
	}

	if r.PageNo == 0 {
		r.PageNo = 1
	}

	if r.LabelID == 0 {
		r.LabelID = -1
	}

	r.Offset = (r.PageNo - 1) * r.PageSize
	if r.Offset < 0 {
		r.Offset = 0
	}
}
