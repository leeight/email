#!/usr/bin/env bash

find . -name '*.go' | grep -v bindata | while read f; do ../../../../gopath/bin/golint $f; done
go tool vet .
