package parser

import (
	"fmt"
	"log"
	"regexp"
	"strings"

	"../ds"
)

// 格式化颜色的数值
func colorValue(v string) string {
	if regexp.MustCompile("(?i)^[0-9A-F]{3,6}$").MatchString(v) {
		return "#" + v
	}
	return v
}

type valueNode struct {
	Value string `xml:"val,attr"`
}

type dummyNode struct {
}

type rFontsNode struct {
	ASCII string `xml:"ascii,attr"`
}

type blipNode struct {
	Embed string `xml:"embed,attr"`
}

type docxRelations struct {
	Relationship []*struct {
		ID     string `xml:"Id,attr"`
		Type   string `xml:"Type,attr"`
		Target string `xml:"Target,attr"`
	}
}

// http://www.datypic.com/sc/ooxml/e-w_shd-3.html
// w:val,...
// w:color,w:fill,
type shdNode struct {
	Value string `xml:"val,attr"`
	Color string `xml:"color,attr"`
	Fill  string `xml:"fill,attr"`
}

type tcPrNode struct {
	GridSpan *valueNode `xml:"gridSpan"`
	VMerge   *valueNode `xml:"vMerge"`
	VAlign   *valueNode `xml:"vAlign"`
	Shd      *shdNode   `xml:"shd"`
}

type rPrNode struct {
	Color     *valueNode  `xml:"color"`
	B         *dummyNode  `xml:"b"`
	I         *dummyNode  `xml:"i"`
	U         *dummyNode  `xml:"u"`
	Highlight *valueNode  `xml:"highlight"`
	Sz        *valueNode  `xml:"sz"`
	RFonts    *rFontsNode `xml:"rFonts"`
}

type htmlNode struct {
	Name         string
	Dummy        bool
	Attr         map[string]string
	InlineStyles map[string]string
}

func (n *htmlNode) String() string {
	if n.Dummy {
		return ""
	}

	var attrs = make([]string, len(n.Attr))
	var i = 0
	for k, v := range n.Attr {
		attrs[i] = fmt.Sprintf(" %s=\"%s\"", k, v)
		i++
	}

	var styles = make([]string, len(n.InlineStyles))
	var j = 0
	for k, v := range n.InlineStyles {
		styles[j] = fmt.Sprintf("%s:%s", k, v)
		j++
	}
	var inlineStyles = ""
	if j > 0 {
		inlineStyles = fmt.Sprintf(" style=\"%s\"", strings.Join(styles, ";"))
	}

	return fmt.Sprintf("<%s%s%s>", n.Name, strings.Join(attrs, ""), inlineStyles)
}

// NewHTMLNode 用来创建一个新的 html 开始节点，对应的结束节点会再遇到 EndElement 的时候自动加上去
func NewHTMLNode(Name string) *htmlNode {
	return &htmlNode{
		Name:         Name,
		Dummy:        false, // 只是一个占位，不会输入具体的内容，这样子就避免删除 output 里面的元素了
		Attr:         make(map[string]string),
		InlineStyles: make(map[string]string),
	}
}

func getHTMLNode(array *ds.Array, idx int) *htmlNode {
	if idx >= array.Length() {
		return nil
	}

	var item = array.Get(idx)
	switch item.(type) {
	case *htmlNode:
		if item.(*htmlNode).Name != "td" {
			log.Printf("Invalid item name")
			return nil
		}
	default:
		log.Printf("Invalid item type")
		return nil
	}

	return item.(*htmlNode)
}
