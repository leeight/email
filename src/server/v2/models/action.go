package models

type Action interface {
	Exec(email *Email, args ...interface{}) error
}

type LabelAction struct{}
type MarkAsReadAction struct{}
type MarkAsDeleteAction struct{}
type ForwardAction struct{}
type ReplyAction struct{}
type MoveMessaeAction struct{}
type CopyMessageAction struct{}
type ChangeStatusAction struct{}

// 给邮件打Tag
func (this LabelAction) Exec(email *Email, args ...interface{}) error {
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

func (this ForwardAction) Exec(email *Email, args ...interface{}) error {
	return nil
}

func (this ReplyAction) Exec(email *Email, args ...interface{}) error {
	return nil
}

func (this MoveMessaeAction) Exec(email *Email, args ...interface{}) error {
	return nil
}

func (this CopyMessageAction) Exec(email *Email, args ...interface{}) error {
	return nil
}

func (this ChangeStatusAction) Exec(email *Email, args ...interface{}) error {
	return nil
}

func (this MarkAsReadAction) Exec(email *Email, args ...interface{}) error {
	email.IsRead = 1
	return nil
}

func (this MarkAsDeleteAction) Exec(email *Email, args ...interface{}) error {
	email.IsDelete = 1
	return nil
}

// 过滤器要执行的动作
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
