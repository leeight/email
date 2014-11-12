package ds

// Stack 是堆栈的数据结构
type Stack struct {
	top  *Node
	size int
}

// Node 是 Stack 中每一项的元素
type Node struct {
	value interface{}
	next  *Node
}

// Length 返回堆栈的长度
func (s *Stack) Length() int {
	return s.size
}

// IsEmpty 返回堆栈是否为空
func (s *Stack) IsEmpty() bool {
	return s.size == 0
}

// Push 往堆栈中新增一项
func (s *Stack) Push(val interface{}) {
	s.top = &Node{val, s.top}
	s.size++
}

// Peek 返回栈顶的元素
func (s *Stack) Peek() interface{} {
	return s.top.value
}

// Pop 从堆栈中移除一项
func (s *Stack) Pop() (val interface{}) {
	if s.size > 0 {
		val, s.top = s.top.value, s.top.next
		s.size--
		return
	}
	return ""
}

// NewStack 创建新的堆栈
func NewStack() *Stack {
	return &Stack{}
}
