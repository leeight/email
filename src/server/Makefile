all:
	go build -gcflags "-N -l" -o ../../bin/frontend frontend.go
	go build -gcflags "-N -l" -o ../../bin/main main.go

test:
	go run tools/fix_threads2.go -case1=0 | sort > 0.txt
	go run tools/fix_threads2.go -case1=1 | sort > 1.txt

lint:
	@../../../gopath/bin/golint .
	@../../../gopath/bin/golint base
	@../../../gopath/bin/golint base
	@../../../gopath/bin/golint backend
	@../../../gopath/bin/golint RFC2047
	@../../../gopath/bin/golint handlers
	@../../../gopath/bin/golint net
	@../../../gopath/bin/golint thread
	@../../../gopath/bin/golint tools
	@../../../gopath/bin/golint web

