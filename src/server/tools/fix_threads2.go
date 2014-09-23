package main

import (
	"../thread"
)

func main() {
	thread.Debug()
}

// ➜  server git:(master) ✗ go run tools/fix_threads2.go -case1=1 -uidls=1406286880,1406528166,1406603723,1406605145,1406606371,1406606909,718284
// Https xsp调试问题 => 1406286880,1406528166
// Size => 2
// ➜  server git:(master) ✗ go run tools/fix_threads2.go -case1=0 -uidls=1406286880,1406528166,1406603723,1406605145,1406606371,1406606909,718284
// Https xsp调试问题 => 1406286880,1406528166,1406603723,1406605145,1406606371,1406606909,718284
// Size => 7
