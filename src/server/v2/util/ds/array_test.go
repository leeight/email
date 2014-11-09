package ds

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

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
}
