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
	Ascii string `xml:"ascii,attr"`
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
	var i int = 0
	for k, v := range n.Attr {
		attrs[i] = fmt.Sprintf(" %s=\"%s\"", k, v)
		i += 1
	}

	var styles = make([]string, len(n.InlineStyles))
	var j int = 0
	for k, v := range n.InlineStyles {
		styles[j] = fmt.Sprintf("%s:%s", k, v)
		j += 1
	}
	var inlineStyles = ""
	if j > 0 {
		inlineStyles = fmt.Sprintf(" style=\"%s\"", strings.Join(styles, ";"))
	}

	return fmt.Sprintf("<%s%s%s>", n.Name, strings.Join(attrs, ""), inlineStyles)
}

func NewHtmlNode(Name string) *htmlNode {
	return &htmlNode{
		Name:         Name,
		Dummy:        false,
		Attr:         make(map[string]string),
		InlineStyles: make(map[string]string),
	}
}

func getHtmlNode(array *ds.Array, idx int) *htmlNode {
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
