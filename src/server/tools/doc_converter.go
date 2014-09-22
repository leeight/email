package main

import (
	"bytes"
	"flag"
	"fmt"
	"log"
	"os/exec"
)

const kCmd = "/Volumes/HDD/Users/leeight/Applications/LibreOffice.app/Contents/MacOS/soffice"

func main() {
	var fileptr = flag.String("file", "", "The file will be convert to preview html")
	flag.Parse()

	if *fileptr == "" {
		return
	}

	// /Volumes/HDD/Users/leeight/Applications/LibreOffice.app/Contents/MacOS/soffice \
	// --headless \
	// --convert-to html \
	// ../../data/baidu.com/liyubei/downloads/723474/att/使用无障碍平台认证评测记录表-xx平台.xlsx \
	// --help
	var out bytes.Buffer

	p := exec.Command(kCmd, "--headless", "--convert-to", "html", "--outdir", "tmp", *fileptr)
	p.Stdout = &out
	err := p.Start()
	if err != nil {
		log.Fatal(err)
	}

	err = p.Wait()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("%q\n", out.String())
}
