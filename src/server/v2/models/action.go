package models

// Action 是过滤器要执行动作的接口，只有一个 Exec 函数需要去实现
type Action interface {
	Exec(email *Email, args ...interface{}) error
}

// LabelAction 是给邮件打标记的动作
type LabelAction struct{}

// MarkAsReadAction 是把邮件标记为已读的动作
type MarkAsReadAction struct{}

// MarkAsDeleteAction 是把邮件标记为已删除的动作
type MarkAsDeleteAction struct{}

// ForwardAction 是转发邮件的动作，暂未实现
type ForwardAction struct{}

// ReplyAction 是自动邮件的动作，暂未实现
type ReplyAction struct{}

// MoveMessaeAction 暂未实现
type MoveMessaeAction struct{}

// CopyMessageAction 暂未实现
type CopyMessageAction struct{}

// ChangeStatusAction 暂未实现
type ChangeStatusAction struct{}

// Exec 给邮件打Tag
func (e LabelAction) Exec(email *Email, args ...interface{}) error {
	value := args[0]
	switch value.(type) {
	case string:
		label := value.(string)
		if email.Tags == nil {
			email.Tags = make([]*Tag, 0)
		}
		// 这里不会访问数据库，存储的事情放到 Receiver 里面去做
		email.Tags = append(email.Tags, &Tag{Name: label})
	}
	return nil
}

// Exec 是转发邮件的接口实现，暂未完成
func (e ForwardAction) Exec(email *Email, args ...interface{}) error {
	return nil
}

// Exec 是回复邮件的接口实现，暂未完成
func (e ReplyAction) Exec(email *Email, args ...interface{}) error {
	return nil
}

// Exec 是移动邮件的接口实现，暂未完成
func (e MoveMessaeAction) Exec(email *Email, args ...interface{}) error {
	return nil
}

// Exec 是拷贝邮件的接口实现，暂未完成
func (e CopyMessageAction) Exec(email *Email, args ...interface{}) error {
	return nil
}

// Exec 是 ChangeStatusAction 接口实现，暂未完成
func (e ChangeStatusAction) Exec(email *Email, args ...interface{}) error {
	return nil
}

// Exec 是 MarkAsReadAction 接口实现，暂未完成
func (e MarkAsReadAction) Exec(email *Email, args ...interface{}) error {
	email.IsRead = 1
	return nil
}

// Exec 是 MarkAsDeleteAction 接口实现，暂未完成
func (e MarkAsDeleteAction) Exec(email *Email, args ...interface{}) error {
	email.IsDelete = 1
	return nil
}

// NewAction 创建过滤器要执行的动作
func NewAction(t string) Action {
	switch t {
	case "Label":
		return LabelAction{}
	case "MarkAsRead":
		return MarkAsReadAction{}
	case "MarkAsDelete":
		return MarkAsDeleteAction{}
	}
	return nil
}
