package models

// Inbox页面的请求提交的参数
type InboxControllerSchema struct {
	PageSize   int `form:"pageSize"`
	PageNo     int `form:"pageNo"`
	LabelId    int `form:"label"`
	UnRead     int `form:"unreadOnly"`
	IsDelete   int `form:"is_delete"`
	IsStar     int `form:"is_star"`
	IsSent     int `form:"is_sent"`
	IsCalendar int `form:"is_calendar"`
	Offset     int `form:"-"`
}

// 初始化请求参数的默认值
func (this *InboxControllerSchema) Init() {
	if this.PageSize == 0 {
		this.PageSize = 15
	}

	if this.PageNo == 0 {
		this.PageNo = 1
	}

	if this.LabelId == 0 {
		this.LabelId = -1
	}

	this.Offset = (this.PageNo - 1) * this.PageSize
	if this.Offset < 0 {
		this.Offset = 0
	}
}
