package base

import (
	"os"

	"github.com/op/go-logging"
)

func NewLogger(category string) *logging.Logger {
	var log = logging.MustGetLogger(category)

	logging.SetBackend(logging.NewLogBackend(os.Stderr, "", 0))
	logging.SetFormatter(logging.MustStringFormatter(kLogFormat))

	return log
}
