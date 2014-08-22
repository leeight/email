package main

import (
    "log"
    "net/mail"
    "bytes"
    "io/ioutil"
    pop3 "github.com/bytbox/go-pop3"
)

func main() {
    client, err := pop3.DialTLS("email.baidu.com:995")
    if err != nil { panic(err) }

    err = client.Auth("liyubei", "zhenxixiaohui@^@262")
    if err != nil { panic(err) }

    count, size, err := client.Stat()
    if err != nil { panic(err) }

    log.Printf("Count = %d, Size = %d\n", count, size)

    size, err = client.List(10)
    if err != nil { panic(err) }

    log.Println(size)

    raw, err := client.Retr(count)
    if err != nil { panic(err) }

    ioutil.WriteFile("raw.txt", []byte(raw), 0644)

    log.Println(raw)
    msg, err := mail.ReadMessage(bytes.NewBuffer([]byte(raw)))
    if err != nil { panic(err) }

    log.Println(msg.Header)
    log.Println(msg.Header.Get("From"))
    log.Println(msg.Header.Get("Subject"))

    address, err := mail.ParseAddress(msg.Header.Get("From"))
    // if err != nil { panic(err) }

    log.Println(address.Name)
    log.Println(address.Address)

    body, err := ioutil.ReadAll(msg.Body)
    if err != nil { panic(err) }

    log.Println(string(body))
}

