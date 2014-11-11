package ds

// 当遇到 w:tbl  开始的时候，就往栈里面 push 一个这样子的记录
// 当遇到 w:tbl  结束的时候，就从栈里面 pop 一个出来
// 当遇到 w:tc   开始的时候
// 1. output里面追加一个NewHtmlNode("td")
// 2. 更新一下cellIndex的值
// 3. 栈顶的 Grids[RowIndex][CellIndex] = output.Length()
// 当遇到 w:tcPr 开始的时候，可以构造一个 tcPrNode 节点
// 1. 如果存在 gridSpan 的数据，那么 CellIndex += gridSpan
type TableLayout struct {
	Grids     [][]int // 当前已经生成的布局结构，遍历的过程中逐渐完善
	RowIndex  int     // 当前遍历到的rowIndex
	CellIndex int     // 当前遍历到的cellIndex
}

func NewTableLayout() *TableLayout {
	return &TableLayout{
		Grids:     make([][]int, 0),
		RowIndex:  -1,
		CellIndex: -1,
	}
}

func (l *TableLayout) IncRow() {
	l.RowIndex += 1
	l.CellIndex = -1
	l.Grids = append(l.Grids, make([]int, 0))
}

// gridSpan默认是0
func (l *TableLayout) IncCell(gridSpan, v int) {
	l.IncCellAtRow(gridSpan, l.RowIndex, v)
}

func (l *TableLayout) IncCellAtRow(gridSpan, rowIndex, v int) {
	if gridSpan <= 1 {
		gridSpan = 1
	}

	l.CellIndex += gridSpan
	for i := 0; i < gridSpan; i++ {
		l.Grids[rowIndex] = append(l.Grids[rowIndex], v)
	}
}
