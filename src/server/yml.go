package main

import (
	"fmt"
	"io/ioutil"

	"gopkg.in/yaml.v1"

	"./base"
)

func main() {
	data, err := ioutil.ReadFile("filters.yml")
	if err != nil {
		panic(err)
	}

	var filters []base.Filter
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
