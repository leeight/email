package main

import (
	"errors"
	"fmt"
	"net"
	// "time"
	// "io/ioutil"
	// "log"
	// "regexp"
	// "net"

	// "code.google.com/p/go.net/publicsuffix"
	"gopkg.in/yaml.v1"

	"./base"
	// "./task"
	// "./web"
	// "./net/mail"
)

func externalIP() (string, error) {
	ifaces, err := net.Interfaces()
	if err != nil {
		return "", err
	}
	for _, iface := range ifaces {
		if iface.Flags&net.FlagUp == 0 {
			continue // interface down
		}
		if iface.Flags&net.FlagLoopback != 0 {
			continue // loopback interface
		}
		addrs, err := iface.Addrs()
		if err != nil {
			return "", err
		}
		for _, addr := range addrs {
			var ip net.IP
			switch v := addr.(type) {
			case *net.IPNet:
				ip = v.IP
			case *net.IPAddr:
				ip = v.IP
			}
			if ip == nil || ip.IsLoopback() {
				continue
			}
			ip = ip.To4()
			if ip == nil {
				continue // not an ipv4 address
			}
			return ip.String(), nil
		}
	}
	return "", errors.New("are you connected to the network?")
}

func main() {
	// ip, _ := externalIP()
	// fmt.Println(ip)
	// return
	// pattern := regexp.MustCompile(`src="(downloads/([^/]+)/([^"]+))"`)
	// body, _ := ioutil.ReadFile("body.raw")
	// log.Printf("%v", pattern.FindAllSubmatch(body, 10))
	// return
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

	// config, err := base.GetConfig("config.yml")
	// context := web.NewContext(config)
	// task.NewDocTransferTask("720788/att/2014年第二期加速度面授课表-20120901.xlsx", context)
	// return

	// d, err := yaml.Marshal(&config.Service.Doc)
	// fmt.Println(string(d))
	// return
	// fmt.Printf("%d\n", time.Now().UnixNano())
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
