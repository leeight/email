package base_test

import (
	"io/ioutil"
	"testing"

	"../base"
)

func TestCreateMail(t *testing.T) {
	raw, _ := ioutil.ReadFile("../testdata/2.txt")
	base.CreateMail(raw)
}
