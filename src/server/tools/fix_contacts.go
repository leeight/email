package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"

	"../v2/util/RFC2047"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	raw, err := ioutil.ReadFile("subjects.txt")
	if err != nil {
		log.Fatal(err)
	}

	var subjects []string
	err = json.Unmarshal(raw, &subjects)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(len(subjects))

	for _, s := range subjects {
		var a = RFC2047.Decode(s)
		fmt.Printf("%+q\n", a)
	}
}
