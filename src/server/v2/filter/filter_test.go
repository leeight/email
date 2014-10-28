package filter

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewFilter(t *testing.T) {
	filters, err := NewFilters("filter_test.json")
	assert.Nil(t, err)
	assert.NotNil(t, filters)
	assert.Equal(t, filters[0].Name, "邮件列表/w3.org")
	assert.Equal(t, filters[0].Stop, true)
	assert.Equal(t, filters[0].Disable, false)
	assert.Equal(t, filters[0].Condition.Match, "Any")
	assert.Equal(t, len(filters[0].Condition.Rules), 2)
	assert.Equal(t, filters[0].Action["Label"], "邮件列表/w3.org")
	assert.Equal(t, filters[0].Action["MarkAsDelete"], true)
	assert.Equal(t, filters[0].Action["MarkAsSpam"], false)
	assert.Equal(t, filters[0].Action["Int"], 10)
	assert.Equal(t, filters[0].Action["Float"], 20.3)
}
