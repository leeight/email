package main

import (
	"flag"
	"io/ioutil"
	"regexp"
)

func main() {
	var file = flag.String("file", "", "The file")
	flag.Parse()
	if *file == "" {
		return
	}

	raw, _ := ioutil.ReadFile(*file)

	raw = regexp.MustCompile("\r\n").ReplaceAll(raw, []byte("\r"))
	raw = regexp.MustCompile("\r").ReplaceAll(raw, []byte("\n"))

	ioutil.WriteFile(*file+".1", raw, 0644)
}
