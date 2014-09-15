package thread

import (
	"encoding/json"
)

// http://www.jwz.org/doc/threading.html
type Message struct {
	// 过滤掉Re:，回复:，答复:之类的内容之后再进行比较
	Subject string `json:"subject"`
	Id      string `json:"id"`
	Uidl    string `json:"uidl"`

	// The References field is populated from the
	// ``References'' and/or ``In-Reply-To'' headers.
	//
	// If both headers exist, take the first thing
	// in the In-Reply-To header that looks like a Message-ID,
	// and append it to the References header.
	//
	// If there are multiple things in In-Reply-To that look
	// like Message-IDs, only use the first one of them: odds
	// are that the later ones are actually email addresses, not IDs.
	References []string `json:"references"`
}

func (m *Message) String() string {
	raw, err := json.Marshal(m)
	if err != nil {
		return err.Error()
	}
	return string(raw)
}
