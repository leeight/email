package ds

import (
	// "fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewTableLayout(t *testing.T) {
	var l = NewTableLayout()
	assert.Equal(t, -1, l.RowIndex)
	assert.Equal(t, -1, l.CellIndex)

	l.IncRow()
	assert.Equal(t, 0, l.RowIndex)
	l.IncRow()
	assert.Equal(t, 1, l.RowIndex)
	l.IncRow()
	assert.Equal(t, 2, l.RowIndex)

	l.CellIndex = -1
	l.IncCell(1, 10)
	l.IncCell(1, 20)
	l.IncCell(1, 30)
	l.IncCell(4, 40)
	assert.Equal(t, []int{10, 20, 30, 40, 40, 40, 40}, l.Grids[2])
	assert.Equal(t, 6, l.CellIndex)
	assert.Equal(t, []int{}, l.Grids[0])
	assert.Equal(t, []int{}, l.Grids[1])

	l.CellIndex = -1
	l.IncCellAtRow(1, 0, 10)
	l.IncCellAtRow(1, 0, 20)
	l.IncCellAtRow(1, 0, 30)
	l.IncCellAtRow(4, 0, 40)
	assert.Equal(t, []int{10, 20, 30, 40, 40, 40, 40}, l.Grids[0])
	assert.Equal(t, 6, l.CellIndex)

	assert.Equal(t, [][]int{
		[]int{10, 20, 30, 40, 40, 40, 40},
		[]int{},
		[]int{10, 20, 30, 40, 40, 40, 40},
	}, l.Grids)
}
