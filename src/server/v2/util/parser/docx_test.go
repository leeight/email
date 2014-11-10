package parser

import (
	"fmt"
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

func TestDOCX2Html_Table(t *testing.T) {
	html, err := DOCX2Html(path.Join("data", "test_table.docx"))

	assert.Nil(t, err)
	assert.NotEqual(t, "", html)
	fmt.Println(html)
}
