package base_test

import (
	// "fmt"
	"io/ioutil"
	"testing"

	"../base"
)

func TestStripUnnecessaryTags(t *testing.T) {
	input := `HELLO<!--[if gte mso 9]><xml>
    <o:shapedefaults v:ext="edit" spidmax="1026" />
    </xml><![endif]--><!--[if gte mso 9]><xml>
    <o:shapelayout v:ext="edit">
    <o:idmap v:ext="edit" data="1" />
    </o:shapelayout></xml><![endif]--><style>a{color:red}</STYLE>WORLD`

	output := base.StripUnnecessaryTags([]byte(input))
	if string(output) != "HELLOWORLD" {
		t.Error(string(output))
	}
}

func TestStripUnnecessaryTags2(t *testing.T) {
	input, _ := ioutil.ReadFile("body.html")
	// output :=
	base.StripUnnecessaryTags(input)
	// fmt.Println(string(output))
}

// <img border="0" width="77" height="18" id="_x0000_i1033" src="cid:image001.gif@01CFC77F.A9348840" alt="Description: Description: Description: Description: zz">
func TestStripUnnecessaryTags3(t *testing.T) {
	xyz := `<img border="0" width="77" height="18" id="_x0000_i1033" src="cid:image001.gif@01CFC77F.A9348840" alt="Description: Description: Description: Description: zz">`
	input := []byte(xyz)
	output := base.StripUnnecessaryTags(input)
	if xyz != string(output) {
		t.Errorf(xyz)
	}
}
