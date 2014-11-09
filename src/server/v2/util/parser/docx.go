package parser

import (
	"archive/zip"
	"bytes"
	"encoding/xml"
	"errors"
	"fmt"
	"io"
	"io/ioutil"

	"../ds"
)

var kEmpty = ""

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

type tag struct {
	b, e string
}

// w:tbl -> html:table
// w:tr -> html:tr
// w:tc -> html:td
// w:p -> html:p
var kTagMap = map[string]tag{
	"tbl": tag{"<table cellspacing=\"0\" cellpadding=\"0\" border=\"1\">\n", "</table>\n"},
	"tr":  tag{"<tr>", "</tr>\n"},
	"tc":  tag{"<td>", "</td>"},
	"p":   tag{"<p>", "</p>\n"},
	// "body": tag{"<div class=\"container\"><div class=\"row\"><div class=\"col-md-12\">\n", "</div></div></div>"},
}

// TODO <a:blip r:embed="rId8" cstate="print"/>

func xml2Text(input io.Reader, breaks []string, skip []string, strict bool) string {
	o := ds.NewArray()
	s := ds.NewStack()

	x := xml.NewDecoder(input)
	x.Strict = strict

	// o.Push("<!doctype html>\n")
	// o.Push("<html>\n")
	// o.Push("<head><meta charset=\"utf-8\" /><link rel=\"stylesheet\" type=\"text/css\" href=\"http://libs.useso.com/js/bootstrap/3.2.0/css/bootstrap.css\" /></head>\n")
	// o.Push("<body>\n")
	for d, err := x.Token(); d != nil && err == nil; d, err = x.Token() {
		switch v := d.(type) {
		case xml.CharData:
			o.Push(string(v))
		case xml.StartElement:
			if t, ok := kTagMap[v.Name.Local]; ok {
				if v.Name.Local == "p" {
					if s.Length() > 0 && s.Peek().(string) == "tc" {
						continue
					}
				}
				s.Push(v.Name.Local)
				o.Push(t.b)
			} else if v.Name.Local == "gridSpan" && s.Length() > 0 && s.Peek().(string) == "tc" {
				for _, attr := range v.Attr {
					if attr.Name.Local == "val" {
						var colspan = attr.Value
						// Reverse iteration `o`, and find the <td> element
						for i := 1; i <= 3; i++ {
							if o.Get(o.Length()-i) == kTagMap["tc"].b {
								o.Set(o.Length()-i, fmt.Sprintf("<td colspan=\"%s\">", colspan))
								break
							}
						}
						break
					}
				}
			}

			for _, breakElement := range breaks {
				if v.Name.Local == breakElement {
					o.Push("\n")
				}
			}

			for _, skipElement := range skip {
				if v.Name.Local == skipElement {
					var depth = 1
					for d, err := x.Token(); d != nil && err == nil; d, err = x.Token() {
						switch d.(type) {
						case xml.StartElement:
							depth++
						case xml.EndElement:
							depth--
						}
						if depth == 0 {
							break
						}
					}
				}
			}
		case xml.EndElement:
			if t, ok := kTagMap[v.Name.Local]; ok {
				if v.Name.Local == "p" {
					if s.Length() > 0 && s.Peek().(string) == "tc" {
						continue
					}
				}
				s.Pop()
				o.Push(t.e)
			}
		}
	}

	return o.Join("")
}

func docxXml2Text(input io.Reader) string {
	return xml2Text(input, []string{"br", "tab"}, []string{"instrText", "script"}, true)
}
