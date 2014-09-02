package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"regexp"
	// "net"

	// "code.google.com/p/go.net/publicsuffix"
	"gopkg.in/yaml.v1"

	"./base"
	// "./net/mail"
)

func main() {
	pattern := regexp.MustCompile(`src="(downloads/([^/]+)/([^"]+))"`)
	body, _ := ioutil.ReadFile("body.raw")
	log.Printf("%v", pattern.FindAllSubmatch(body, 10))
	return
	// domain, _ := publicsuffix.EffectiveTLDPlusOne("email.baidu.com")
	// log.Printf("Domain = %s\n", domain)

	// host, port, err := net.SplitHostPort("email.baidu.com:")
	// if err != nil {
	// 	log.Fatal(err)
	// }
	// log.Printf("host = [%s], port = [%s]\n", host, port)

	// from, err := mail.ParseAddress(`=?UTF-8?B?5p2O546J5YyX?=<liyubei@baidu.com>`)
	// if err != nil {
	// 	log.Panic(err)
	// }
	// log.Printf("%s, %s", from.Name, from.Address)
	// return

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
