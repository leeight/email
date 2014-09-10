package base

import (
	"database/sql"
)

type Action interface {
	Exec(email *EMail, args ...interface{}) error
}

type LabelAction struct{}
type MarkAsReadAction struct{}
type ForwardAction struct{}
type ReplyAction struct{}
type MoveMessaeAction struct{}
type CopyMessageAction struct{}
type ChangeStatusAction struct{}

// 给邮件打Tag
func (this LabelAction) Exec(email *EMail, args ...interface{}) error {
	value := args[0]
	switch value.(type) {
	case string:
		label := value.(string)
		db := args[1].(*sql.DB)
		return email.AddLabel(label, db)
	}
	return nil
}

func (this ForwardAction) Exec(email *EMail, args ...interface{}) error {
	return nil
}

func (this ReplyAction) Exec(email *EMail, args ...interface{}) error {
	return nil
}

func (this MoveMessaeAction) Exec(email *EMail, args ...interface{}) error {
	return nil
}

func (this CopyMessageAction) Exec(email *EMail, args ...interface{}) error {
	return nil
}

func (this ChangeStatusAction) Exec(email *EMail, args ...interface{}) error {
	return nil
}

func (this MarkAsReadAction) Exec(email *EMail, args ...interface{}) error {
	db := args[1].(*sql.DB)
	email.IsRead = 1
	_, err := email.Store(db)
	return err
}

// 过滤器要执行的动作
func NewAction(t string) Action {
	switch t {
	case kActionLabel:
		return LabelAction{}
	case kActionMarkAsRead:
		return MarkAsReadAction{}
	}
	return nil
}
