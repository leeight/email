package main

import (
	"bytes"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path"
	"strings"

	"../net/mail"
)

// 根据邮件的发送时间，重新修改邮件的名字

var kNames = map[string]bool{
	"1404283793.txt": true,
	"1392370724.txt": true,
	"1390718021.txt": true,
	"1387524271.txt": true,
	"1385562367.txt": true,
	"1385362302.txt": true,
	"1384244965.txt": true,
	"1384244559.txt": true,
	"1384244292.txt": true,
	"1384243696.txt": true,
	"1384239589.txt": true,
	"1384135955.txt": true,
	"1383894933.txt": true,
	"1383894287.txt": true,
	"1383877534.txt": true,
	"1383807889.txt": true,
	"1383730054.txt": true,
	"1383729148.txt": true,
	"1383728563.txt": true,
	"1383631759.txt": true,
	"1383210744.txt": true,
	"1382669290.txt": true,
	"1382626558.txt": true,
	"1382598577.txt": true,
	"1382597016.txt": true,
	"1382595384.txt": true,
	"1382423825.txt": true,
	"1382148697.txt": true,
	"1378194523.txt": true,
	"1377763202.txt": true,
	"1377154220.txt": true,
	"1376442114.txt": true,
	"1376360020.txt": true,
	"1376014389.txt": true,
	"1375407304.txt": true,
	"1374114603.txt": true,
	"1374027005.txt": true,
	"1367909685.txt": true,
	"1367900824.txt": true,
	"1367857559.txt": true,
	"1367852513.txt": true,
	"1367818976.txt": true,
	"1367815339.txt": true,
	"1367813816.txt": true,
	"1367811266.txt": true,
	"1367734717.txt": true,
	"1366992997.txt": true,
	"1366983809.txt": true,
	"1366972829.txt": true,
	"1366960042.txt": true,
	"1366958616.txt": true,
	"1366958064.txt": true,
	"1366828824.txt": true,
	"1366780775.txt": true,
	"1366646419.txt": true,
	"1366365642.txt": true,
	"1366363859.txt": true,
	"1366356397.txt": true,
	"1366284043.txt": true,
	"1366282945.txt": true,
	"1365495421.txt": true,
	"1363681168.txt": true,
	"1363436228.txt": true,
	"1363328420.txt": true,
	"1363253520.txt": true,
	"1363163070.txt": true,
	"1362663407.txt": true,
	"1362563886.txt": true,
	"1362110462.txt": true,
	"1362016426.txt": true,
	"1360983449.txt": true,
	"1359990277.txt": true,
	"1359959239.txt": true,
	"1359714888.txt": true,
	"1357916349.txt": true,
	"1357906796.txt": true,
	"1357903594.txt": true,
	"1357898572.txt": true,
	"1357897708.txt": true,
	"1357896969.txt": true,
	"1357896489.txt": true,
	"1357896149.txt": true,
	"1357894800.txt": true,
	"1357815040.txt": true,
	"1357812986.txt": true,
	"1357812318.txt": true,
	"1357609063.txt": true,
	"1357535739.txt": true,
}

func main() {
	var dirptr = flag.String("dir", "", "The dir")
	flag.Parse()
	if *dirptr == "" {
		fmt.Fprintf(os.Stderr, "Usage of %s:\n", os.Args[0])
		flag.PrintDefaults()
		return
	}

	var dir = *dirptr
	fs, err := ioutil.ReadDir(dir)
	if err != nil {
		log.Fatal(err)
	}

	for _, item := range fs {
		if item.IsDir() {
			continue
		}

		if _, ok := kNames[item.Name()]; ok {
			os.Rename(
				path.Join(dir, item.Name()),
				path.Join(dir, strings.Replace(item.Name(), ".txt", fmt.Sprintf("-%d.txt", item.Size()), -1)),
			)
		}
		continue

		if strings.HasSuffix(item.Name(), ".txt") {
			continue
		}

		raw, err := ioutil.ReadFile(path.Join(dir, item.Name()))
		if err != nil {
			fmt.Fprintf(os.Stderr, "%s: %v\n", item.Name(), err)
			continue
		}

		msg, err := mail.ReadMessage(bytes.NewBuffer(raw))
		if err != nil {
			fmt.Fprintf(os.Stderr, "%s: %v\n", item.Name(), err)
			continue
		}

		date, err := msg.Header.Date()
		if err != nil {
			fmt.Fprintf(os.Stderr, "%s: %v\n", item.Name(), err)
			continue
		}

		os.Rename(
			path.Join(dir, item.Name()),
			path.Join(dir, fmt.Sprintf("%d.txt", date.Unix())),
		)
	}
}
