package base

import (
	"strings"

	"../net/mail"
)

func AddressToString(list []*mail.Address) string {
	addresses := make([]string, len(list))
	for i, item := range list {
		addresses[i] = item.String()
	}

	return strings.Join(addresses, ", ")
}
