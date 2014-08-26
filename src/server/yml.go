package main

import (
	"fmt"
	"io/ioutil"

	"gopkg.in/yaml.v1"
)

const (
	kOpIs             = "Is"
	kOpContains       = "Contains"
	KOpOnlyMe         = "Only Me"
	kOpMe             = "Me"
	kOpNotMe          = "Not Me"
	kOpCcMe           = "Cc Me"
	kOpToOrCcMe       = "To or Cc Me"
	kOpAfter          = "After"
	kOpBefore         = "Before"
	kOpHasAttachments = "HasAttachments"
	kOpGreater        = "Greater"
	kOpLess           = "Less"
)

type Filter struct {
	Name      string
	Disable   bool
	Stop      bool
	Condition struct {
		Match string
		Rules [][]string
	}
	Action map[string]string
}

func main() {
	data, err := ioutil.ReadFile("filters.yml")
	if err != nil {
		panic(err)
	}

	var filters []Filter
	err = yaml.Unmarshal(data, &filters)
	if err != nil {
		panic(err)
	}
	fmt.Printf("Length = %d\n", len(filters))
	fmt.Printf("Name = %s\n", filters[0].Name)
	fmt.Printf("Rules[0][0] = %s\n", filters[0].Condition.Rules[0][0])
	fmt.Printf("Action[\"label\"] = %s\n", filters[0].Action["label"])
	fmt.Printf("Action[\"label\"] = %s\n", filters[1].Action["label"])
	d, err := yaml.Marshal(&filters)
	if err != nil {
		panic(err)
	}
	fmt.Printf("%s\n", string(d))
}
