RFC2047 for Go
==============
An RFC2047 Decoder package for Golang

Usage
-----

Just import "github.com/famz/RFC2047", then call "RFC2047.Decode" with your
encoded string and get it decoded! See below for an example.

Install
-------

Simple as `go get github.com/famz/RFC2047`

Example
-------

```go
package main
import (
    "github.com/famz/RFC2047"
    "fmt"
)

func main() {
    fmt.Println(RFC2047.Decode("=?UTF-8?B?5YmN5Y+w5pyJ5L2g5L+h?="))
}
```
