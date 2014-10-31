test:
	go test -v ./config
	go test -v ./filter
	go test -v ./models
	go test -v ./util
	go test -v ./util/parser
	go test -v ./util/builder
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
	# go build \
		-o email \
		-ldflags '-X main.BUILD_VERSION $(shell git log --format="%H" -n 1) -X main.BUILD_DATE "$(shell date)"' \
		main.go

release:
	cd static && edp build -f && cd -
	../../../../gopath/bin/go-bindata \
		-prefix="static/output/" \
		-nomemcopy=true \
		-o bindata/bindata.go \
		-pkg bindata \
		static/output/...
	go build \
		-o email \
		-ldflags '-X main.BUILD_VERSION $(shell git log --format="%H" -n 1) -X main.BUILD_DATE "$(shell date)"' \
		main.go
	strip email
