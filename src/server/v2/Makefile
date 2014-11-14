test:
	go test -v ./config
	go test -v ./filter
	go test -v ./models
	go test -v ./util
	go test -v ./util/builder
	go test -v ./util/ds
	go test -v ./util/parser
	go test -v ./util/storage

debug:
	../../../../gopath/bin/go-bindata \
		-prefix="static/" \
		-ignore="output" \
		-debug=true \
		-nomemcopy=true \
		-o bindata/bindata.go \
		-pkg bindata \
		static/...

fe:
	cd static && edp build -f && cd -
	../../../../gopath/bin/go-bindata \
		-prefix="static/output/" \
		-nomemcopy=true \
		-o bindata/bindata.go \
		-pkg bindata \
		static/output/...

darwin_amd64:
	GOOS=darwin GOARCH=amd64 go build \
		-o darwin_amd64_email \
		-ldflags '-X main.BuildVersion $(shell git log --format="%H" -n 1) -X main.BuildDate "$(shell date)"' \
		main.go
	strip darwin_amd64_email

darwin_386:
	GOOS=darwin GOARCH=386 go build \
		-o darwin_386_email \
		-ldflags '-X main.BuildVersion $(shell git log --format="%H" -n 1) -X main.BuildDate "$(shell date)"' \
		main.go
	strip darwin_386_email

release: fe darwin_amd64
