package base

import (
	"os"

	"github.com/op/go-logging"
)

var kLogFormat = "%{color}%{time:15:04:05.000000} %{level:.4s} %{id:03x}%{color:reset} %{message}"

func NewLogger(category string) *logging.Logger {
	var log = logging.MustGetLogger(category)

	logging.SetBackend(logging.NewLogBackend(os.Stderr, "", 0))
	logging.SetFormatter(logging.MustStringFormatter(kLogFormat))

	return log
}
