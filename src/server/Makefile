all:
	go build -o ../../bin/frontend frontend.go
	go build -o ../../bin/main main.go
	go build -o ../../bin/searcher searcher.go

test:
	go run tools/fix_threads2.go -case1=1 | sort > 1.txt
	go run tools/fix_threads2.go -case1=0 | sort > 0.txt

