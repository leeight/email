package base

type Action interface {
	Exec(value interface{}) error
}

// 过滤器要执行的动作
func NewAction(t string) Action {
	return nil
}
