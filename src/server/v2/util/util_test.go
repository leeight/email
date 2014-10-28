package util

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestStripInvalidCharacter(t *testing.T) {
	assert.Equal(t, "abc.gif", StripInvalidCharacter("    ...  .  a|:?*bc.g\"><if  ...     "))
}
