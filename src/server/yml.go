package main

import (
	"fmt"

	"gopkg.in/yaml.v1"

	"./base"
)

func main() {
	filters, err := base.GetFilters("filters.yml")
	if err != nil {
		panic(err)
	}
	fmt.Printf("Length = %d\n", len(filters))
	fmt.Printf("Name = %s\n", filters[0].Name)
	fmt.Printf("%s, %s, %s\n",
		filters[0].Condition.Rules[0][0],
		filters[0].Condition.Rules[0][1],
		filters[0].Condition.Rules[0][2],
	)
	fmt.Printf("Action[\"label\"] = %s\n", filters[0].Action["label"])
	fmt.Printf("Action[\"label\"] = %s\n", filters[1].Action["label"])
	d, err := yaml.Marshal(&filters)
	if err != nil {
		panic(err)
	}
	fmt.Printf("%s\n", string(d))
}
