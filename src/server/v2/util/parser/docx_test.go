package parser

import (
	// "fmt"
	"path"
	"strings"
	"testing"

	"github.com/PuerkitoBio/goquery"
	"github.com/stretchr/testify/assert"
)

func TestHtmlNode(t *testing.T) {
	n := NewHTMLNode("span")
	n.Attr["x-attr"] = "x-value"
	n.InlineStyles["font-size"] = "12px"
	assert.Equal(t, "<span x-attr=\"x-value\" style=\"font-size:12px\">", n.String())
}

func TestDOCX2Html(t *testing.T) {
	html, err := DOCX2Html(path.Join("data", "test.docx"))

	assert.Nil(t, err)
	assert.NotEqual(t, "", html)

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	assert.Nil(t, err)
	assert.NotNil(t, doc)

	for _, span := range doc.Find("span").Nodes {
		if span.Data == "侍宴无" || span.Data == "承" || span.Data == "欢" {
			assert.NotEmpty(t, span.Attr)
		}
	}
}

// 单独一个表格的情况
func TestDOCX2Html_Table(t *testing.T) {
	html, err := DOCX2Html(path.Join("data", "test_table.docx"))

	assert.Nil(t, err)
	assert.NotEqual(t, "", html)

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	assert.Nil(t, err)
	assert.NotNil(t, doc)

	nodes := doc.Find(`td[colspan="2"][rowspan="2"]`).Nodes
	assert.Equal(t, 1, len(nodes))

	// td > p > span > TEXT_NODE("A")
	assert.Equal(t, "A", nodes[0].FirstChild.FirstChild.FirstChild.Data)

	nodes = doc.Find(`td[rowspan="3"][colspan="2"]`).Nodes
	assert.Equal(t, 1, len(nodes))
	assert.Equal(t, "G", nodes[0].FirstChild.FirstChild.FirstChild.Data)

	nodes = doc.Find(`td[colspan="3"]`).Nodes
	assert.Equal(t, 1, len(nodes))
	assert.Equal(t, "M", nodes[0].FirstChild.FirstChild.FirstChild.Data)
}

// 表格嵌套表格的情况
func TestDOCX2Html_Table2(t *testing.T) {
	html, err := DOCX2Html(path.Join("data", "test_table2.docx"))

	assert.Nil(t, err)
	assert.NotEqual(t, "", html)

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	assert.Nil(t, err)
	assert.NotNil(t, doc)

	nodes := doc.Find("table").Nodes
	assert.Equal(t, 2, len(nodes))

	nodes = doc.Find(`table table td[colspan="2"][rowspan="2"]`).Nodes
	assert.Equal(t, 1, len(nodes))
	assert.Equal(t, "6", nodes[0].FirstChild.FirstChild.FirstChild.Data)
}
