package base_test

import (
	"testing"

	"../base"
)

func TestGetConfig(t *testing.T) {
	base.GetConfig("../config.yml")
}
