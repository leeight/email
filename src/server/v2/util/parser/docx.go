package parser

import (
	"archive/zip"
	"bytes"
	"encoding/xml"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"strconv"
	"strings"

	"../ds"
)

var kEmpty = ""

type gridSpanNode struct {
	Value string `xml:"val,attr"`
}

type vMergeNode struct {
	Value string `xml:"val,attr"`
}

type vAlignNode struct {
	Value string `xml:"val,attr"`
}

type tcPrNode struct {
	GridSpan *gridSpanNode `xml:"gridSpan"`
	VMerge   *vMergeNode   `xml:"vMerge"`
	VAlign   *vAlignNode   `xml:"vAlign"`
}

type tcNode struct {
	TcPr *tcPrNode `xml:"tcPr"`
}

type htmlNode struct {
	Name  string
	Dummy bool
	Attr  map[string]string
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

	return fmt.Sprintf("<%s%s>", n.Name, strings.Join(attrs, ""))
}

func NewHtmlNode(Name string) *htmlNode {
	return &htmlNode{
		Name:  Name,
		Dummy: false,
		Attr:  make(map[string]string),
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

// docx 2 html
func DOCX2Html(file string) (string, error) {
	inputs, err := ioutil.ReadFile(file)
	if err != nil {
		return kEmpty, err
	}

	r, err := zip.NewReader(bytes.NewReader(inputs), int64(len(inputs)))
	if err != nil {
		return kEmpty, err
	}

	for _, f := range r.File {
		if f.Name == "word/document.xml" {
			rc, err := f.Open()
			if err != nil {
				return kEmpty, err
			}
			defer rc.Close()
			return docxXml2Text(rc), nil
		}
	}

	return kEmpty, errors.New("Invalid docx format.")
}

// TODO <a:blip r:embed="rId8" cstate="print"/>

func xml2Text(input io.Reader, strict bool) string {
	output := ds.NewArray()
	tableStack := ds.NewStack()

	x := xml.NewDecoder(input)
	x.Strict = strict

	for {
		d, err := x.Token()
		if d == nil || err != nil {
			break
		}

		switch v := d.(type) {
		case xml.CharData:
			output.Push(string(v))
		case xml.StartElement:
			if v.Name.Local == "tcPr" {
				var tcPr = &tcPrNode{}
				x.DecodeElement(tcPr, &v)

				// 开始回溯

				// 先找到当前的行的 tc 节点
				if tableStack.IsEmpty() {
					log.Println("tableStack should not be empty when meet tcPr")
					break
				}

				var layout = tableStack.Peek().(*ds.TableLayout)
				var rowIndex = layout.RowIndex
				var cellIndex = layout.CellIndex
				if rowIndex >= len(layout.Grids) {
					log.Printf("Invalid rowIndex = %d, len(layout.Grids) = %d\n",
						rowIndex, len(layout.Grids))
					break
				} else if cellIndex >= len(layout.Grids[rowIndex]) {
					log.Printf("Invalid cellIndex = %d, len(layout.Grids[%d]) = %d\n",
						cellIndex, rowIndex, len(layout.Grids[rowIndex]))
					break
				}

				var idx = layout.Grids[rowIndex][cellIndex]
				if idx >= output.Length() {
					log.Printf("Invalid array index = %d, array length is %d\n",
						idx, output.Length())
					break
				}

				var n = getHtmlNode(output, idx)
				if n == nil {
					break
				}

				if tcPr.GridSpan != nil {
					n.Attr["colspan"] = tcPr.GridSpan.Value
					var gridSpan, _ = strconv.Atoi(tcPr.GridSpan.Value)
					if gridSpan > 1 {
						layout.IncCellAtRow(gridSpan-1, rowIndex, idx)
					}
				}

				if tcPr.VAlign != nil {
					n.Attr["valign"] = tcPr.VAlign.Value
				}

				if tcPr.VMerge != nil {
					if tcPr.VMerge.Value == "restart" {
						// 找到 output 里面 的 tc 节点，设置rowspan属性
						n.Attr["rowspan"] = "1"
					} else if tcPr.VMerge.Value == "" {
						// 找到本行 output 里面的 tc 节点，Dummy 设置为 true
						n.Dummy = true

						// 找到上一行 output 里面的 tc 节点，rowspan + 1
						// 上一行也可能是 Dummy 的节点，我们需要一直找下去，找到不是 Dummy 的节点为止
						rowIndex--
						for rowIndex >= 0 {
							if cellIndex >= len(layout.Grids[rowIndex]) {
								log.Printf("Invalid cellIndex = %d, len(layout.Grids[%d]) = %d\n",
									cellIndex, rowIndex, len(layout.Grids[rowIndex]))
								break
							}

							var idx = layout.Grids[rowIndex][cellIndex]
							var n = getHtmlNode(output, idx)
							if n == nil {
								break
							}

							if !n.Dummy {
								var rowspan, _ = strconv.Atoi(n.Attr["rowspan"])
								n.Attr["rowspan"] = fmt.Sprintf("%d", rowspan+1)
								break
							}
							rowIndex--
						}
					}
				}
			} else if v.Name.Local == "tr" {
				output.Push("<tr>\n")
				if !tableStack.IsEmpty() {
					// 0-based
					var layout = tableStack.Peek().(*ds.TableLayout)
					layout.IncRow()
				}
			} else if v.Name.Local == "tc" {
				output.Push(NewHtmlNode("td"))
				if !tableStack.IsEmpty() {
					// 0-based
					var layout = tableStack.Peek().(*ds.TableLayout)
					layout.IncCell(1, output.Length()-1)
				}
			} else if v.Name.Local == "tbl" {
				output.Push("<table>\n")
				tableStack.Push(ds.NewTableLayout())
			} else if v.Name.Local == "br" || v.Name.Local == "tab" {
				output.Push("\n")
			} else if v.Name.Local == "p" {
				output.Push("<p>")
			}
		case xml.EndElement:
			if v.Name.Local == "tr" {
				output.Push("</tr>\n")
			} else if v.Name.Local == "tc" {
				output.Push("</td>")
			} else if v.Name.Local == "tbl" {
				tableStack.Pop()
				output.Push("</table>\n")
			} else if v.Name.Local == "p" {
				output.Push("</p>\n")
			}
		}
	}

	return output.Join("")
}

func docxXml2Text(input io.Reader) string {
	return xml2Text(input, true)
}
