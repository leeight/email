package parser

import (
	"github.com/tealeg/xlsx"
)

type sheetType struct {
	Name string     `json:"name"`
	Data [][]string `json:"data"`
}

func XLSX2Html(file string) ([]*sheetType, error) {
	f, err := xlsx.OpenFile(file)
	if err != nil {
		return nil, err
	}

	sheets := make([]*sheetType, len(f.Sheets))

	for si, s := range f.Sheets {
		sheet := &sheetType{}
		sheet.Name = s.Name
		sheet.Data = make([][]string, len(s.Rows))

		for ri, r := range s.Rows {
			row := make([]string, len(r.Cells))
			for ci, cell := range r.Cells {
				row[ci] = cell.String()
				// row[ci] = cell.FormattedValue()
			}
			sheet.Data[ri] = row
		}

		sheets[si] = sheet
	}

	return sheets, nil
}
