package parser

import (
	"path"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDOCX2Html(t *testing.T) {
	html, err := DOCX2Html(path.Join("data", "test.docx"))

	assert.Nil(t, err)
	assert.NotEqual(t, "", html)
	assert.Contains(t, html, "<p>汉皇重色思倾国，御宇多年求不得。杨家有女初长成，养在深闺人未识。</p>")
	assert.Contains(t, html, "<p>天生丽质难自弃，一朝选在君王侧。回眸一笑百媚生，六宫粉黛无颜色。</p>")
	assert.Contains(t, html, "<p>春寒赐浴华清池，温泉水滑洗凝脂。侍儿扶起娇无力，始是新承恩泽时。</p>")
	assert.Contains(t, html, "<p>云鬓花颜金步摇，芙蓉帐暖度春宵。春宵苦短日高起，从此君王不早朝。</p>")
	assert.Contains(t, html, "<p>金屋妆成娇侍夜，玉楼宴罢醉和春。姊妹弟兄皆列土，可怜光彩生门户。</p>")
	assert.Contains(t, html, "<p>遂令天下父母心，不重生男重生女。骊宫高处入青云，仙乐风飘处处闻。</p>")
	assert.Contains(t, html, "<p>缓歌谩舞凝丝竹，尽日君王看不足。渔阳鼙鼓动地来，惊破霓裳羽衣曲。</p>")
	assert.Contains(t, html, "<p>九重城阙烟尘生，千乘万骑西南行。翠华摇摇行复止，西出都门百余里。</p>")
}

// 单独一个表格的情况
func TestDOCX2Html_Table(t *testing.T) {
	html, err := DOCX2Html(path.Join("data", "test_table.docx"))

	assert.Nil(t, err)
	assert.NotEqual(t, "", html)
	// 因为标签的属性顺序每次都会有变化，为了避免case失败，我们只是比较了两个字符串的长度
	assert.Equal(t, len(`
<table>
<tr>
<td colspan="2" valign="center" rowspan="2"><p>A</p>
</td><td><p>B</p>
</td><td><p>C</p>
</td><td><p>D</p>
</td></tr>
<tr>
<p></p>
</td><td valign="center" rowspan="3" colspan="2"><p>G</p>
</td><td><p>H</p>
</td></tr>
<tr>
<td><p>E</p>
</td><td><p>F</p>
</td><p></p>
</td><td><p>K</p>
</td></tr>
<tr>
<td><p>I</p>
</td><td><p>J</p>
</td><p></p>
</td><td><p>L</p>
</td></tr>
<tr>
<td colspan="3"><p>M</p>
</td><td colspan="2"><p>N</p>
</td></tr>
</table>
<p></p>
`), len(html))
}

// 表格嵌套表格的情况
func TestDOCX2Html_Table2(t *testing.T) {
	html, err := DOCX2Html(path.Join("data", "test_table2.docx"))

	assert.Nil(t, err)
	assert.NotEqual(t, "", html)
	// 因为标签的属性顺序每次都会有变化，为了避免case失败，我们只是比较了两个字符串的长度
	assert.Equal(t, len(`
<table>
<tr>
<td colspan="2" valign="center" rowspan="2"><p>A</p>
</td><td><p>B</p>
</td><td><p>C</p>
</td><td><p>D</p>
</td></tr>
<tr>
<p></p>
</td><td colspan="2" valign="center" rowspan="3"><table>
<tr>
<td><p>1</p>
</td><td><p>2</p>
</td><td><p>3</p>
</td><td><p>4</p>
</td></tr>
<tr>
<td rowspan="2" valign="center"><p>5</p>
</td><td colspan="2" valign="center" rowspan="2"><p>6</p>
</td><td><p>7</p>
</td></tr>
<tr>
<p></p>
</td><p></p>
</td><td><p>8</p>
</td></tr>
<tr>
<td colspan="2"><p>9</p>
</td><td colspan="2"><p>10</p>
</td></tr>
</table>
<p>G</p>
</td><td><p>H</p>
</td></tr>
<tr>
<td><p>E</p>
</td><td><p>F</p>
</td><p></p>
</td><td><p>K</p>
</td></tr>
<tr>
<td><p>I</p>
</td><td><p>J</p>
</td><p></p>
</td><td><p>L</p>
</td></tr>
<tr>
<td colspan="3"><p>M</p>
</td><td colspan="2"><p>N</p>
</td></tr>
</table>
<p></p>
`), len(html))
}
