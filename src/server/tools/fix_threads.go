package tools

// http://www.jwz.org/doc/threading.html

type Message struct {
	subject string
	id      string

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
	references []string
}

type Container struct {
	message *Message
	parent  *Container
	child   *Container
	next    *Container
}
