package ds

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

type xNodeType struct {
	Name string
}

func (x *xNodeType) String() string {
	return fmt.Sprintf("<%s></%s>", x.Name, x.Name)
}

func TestNewArray(t *testing.T) {
	var a = NewArray()
	a.Push("1")
	a.Push("2")
	a.Push("3")

	assert.Equal(t, 3, a.Length())
	assert.Equal(t, "3", a.Last())
	assert.Equal(t, "3", a.Get(2))
	assert.Equal(t, "1,2,3", a.Join(","))

	a.Set(0, "x")
	assert.Equal(t, "x,2,3", a.Join(","))

	a.Push(&xNodeType{"td"})
	assert.Equal(t, "x,2,3,<td></td>", a.Join(","))
}
