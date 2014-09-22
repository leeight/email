all:
	go build -gcflags "-N -l" -o ../../bin/frontend frontend.go
	go build -gcflags "-N -l" -o ../../bin/main main.go

test:
	go run tools/fix_threads2.go -case1=1 | sort > 1.txt
	go run tools/fix_threads2.go -case1=0 | sort > 0.txt

