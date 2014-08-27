package base_test

import (
	"testing"

	"../base"
)

func TestStripUnnecessaryTags(t *testing.T) {
	input := `HELLO<!--[if gte mso 9]><xml>
    <o:shapedefaults v:ext="edit" spidmax="1026" />
    </xml><![endif]--><!--[if gte mso 9]><xml>
    <o:shapelayout v:ext="edit">
    <o:idmap v:ext="edit" data="1" />
    </o:shapelayout></xml><![endif]-->WORLD`

	output := base.StripUnnecessaryTags([]byte(input))
	if string(output) != "HELLOWORLD" {
		t.Error(string(output))
	}
}
