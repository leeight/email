package thread

import (
	// "log"
	// "fmt"
	"regexp"
)

type ContainerMap map[string]*Container

type Thread struct {
	idTable      ContainerMap
	subjectTable ContainerMap
}

func (t *Thread) createIdTable(messages []*Message) {
	// 初始化
	t.idTable = make(ContainerMap)

	for _, m := range messages {
		parentContainer, ok := t.idTable[m.Id]
		if ok {
			// 如果 id_table 包含这个 message-id 的话，检查一下是否是
			// empty container
			if parentContainer.IsEmpty() {
				parentContainer.message = m
			}
		} else {
			// id_table 不包含这个 message-id，那么创建一个新的
			parentContainer = &Container{message: m}
			t.idTable[m.Id] = parentContainer
		}

		// Link the References field's Containers together in the order
		// implied by the References header.
		// For each element in the message's References field:
		var prev *Container
		for _, ref := range m.References {
			container, ok := t.idTable[ref]
			if !ok {
				// If there's one in id_table use that;
				// Otherwise, make (and index) one with a null Message.
				container = &Container{message: nil}
				t.idTable[ref] = container
			}

			if prev != nil &&
				// If they are already linked, don't change the existing links.
				container.parent == nil &&
				// Do not add a link if adding that link would introduce a loop:
				// that is, before asserting A->B, search down the children of B
				// to see if A is reachable, and also search down the children of
				// A to see if B is reachable. If either is already reachable as
				// a child of the other, don't add the link.
				!container.hasDescendant(prev) {
				prev.addChild(container)
			}

			prev = container
		}

		// Set the parent of this message to be the last element in References.
		// Note that this message may have a parent already: this can happen because we saw this ID
		// in a References field, and presumed a parent based on the other entries in that field.
		// Now that we have the actual message, we can be more definitive, so throw away the old parent
		// and use this new one. Find this Container in the parent's children list, and unlink it.

		// Note that this could cause this message to now have no parent, if it has no references
		// field, but some message referred to it as the non-first element of its references.
		// (Which would have been some kind of lie...)

		// Note that at all times, the various ``parent'' and ``child'' fields must be
		// kept inter-consistent.
		if prev != nil && !parentContainer.hasDescendant(prev) {
			prev.addChild(parentContainer)
		}
	}
}

func (t *Thread) createSubjectTable(roots *Container) {
	// 初始化
	t.subjectTable = make(ContainerMap)

	// 先构造一个初级的subjectTable
	for _, this := range roots.children {
		subject := normalizeSubject(this.GetSubject())
		if subject == "" {
			continue
		}

		if old, ok := t.subjectTable[subject]; !ok {
			// There is no container in the table with this subject
			t.subjectTable[subject] = this
		} else {
			// 1. This one is an empty container and the old one is not:
			// the empty one is more interesting as a root, so put it in the table instead.
			//
			// 2. The container in the table has a ``Re:'' version of this subject,
			// and this container has a non-``Re:'' version of this subject.
			// The non-re version is the more interesting of the two.
			if !old.IsEmpty() {
				if this.IsEmpty() {
					t.subjectTable[subject] = this
				} else if isReplyOrForward(old.GetSubject()) &&
					!isReplyOrForward(this.GetSubject()) {
					t.subjectTable[subject] = this
				}
			}
		}
	}
}

func (t *Thread) GroupBySubject(roots *Container) ContainerMap {
	t.createSubjectTable(roots)

	l := len(roots.children)
	for i := l - 1; i >= 0; i-- {
		if i >= len(roots.children) {
			i = len(roots.children) - 1
		}

		this := roots.children[i]
		subject := normalizeSubject(this.GetSubject())

		that := t.subjectTable[subject]
		if that == nil || that == this {
			continue
		}

		if that.IsEmpty() && this.IsEmpty() {
			// If both are dummies, append one's children to the other,
			// and remove the now-empty container.

			for _, child := range this.children {
				that.addChild(child)
			}
			this.parent.removeChild(this)
		} else if that.IsEmpty() && !this.IsEmpty() {
			// If one container is a empty and the other is not,
			// make the non-empty one be a child of the empty,
			// and a sibling of the other ``real'' messages with
			// the same subject (the empty's children.)

			that.addChild(this)
		} else if !that.IsEmpty() && this.IsEmpty() {
			// If one container is a empty and the other is not,
			// make the non-empty one be a child of the empty,
			// and a sibling of the other ``real'' messages with
			// the same subject (the empty's children.)

			this.addChild(that)
			t.subjectTable[subject] = this
		} else {
			// Both are not empty container
			if isReplyOrForward(that.GetSubject()) &&
				!isReplyOrForward(this.GetSubject()) {
				// If that container is a non-empty, and that message's subject begins with ``Re:'',
				// but this message's subject does not, then make that be a child of this one --
				// they were misordered. (This happens somewhat implicitly, since if there are two
				// messages, one with Re: and one without, the one without will be in the hash table,
				// regardless of the order in which they were seen.)

				this.addChild(that)
				t.subjectTable[subject] = this
			} else if !isReplyOrForward(that.GetSubject()) &&
				isReplyOrForward(this.GetSubject()) {
				// If that container is a non-empty, and that message's
				// subject does not begin with ``Re:'', but this message's
				// subject does, then make this be a child of the other.

				that.addChild(this)
			} else {
				// Otherwise, make a new empty container and make both msgs be a child of it.
				// This catches the both-are-replies and neither-are-replies cases, and makes
				// them be siblings instead of asserting a hierarchical relationship which might
				// not be true.

				nc := &Container{message: nil}
				nc.addChild(that)
				nc.addChild(this)
				t.subjectTable[subject] = nc
			}
		}
	}

	return t.subjectTable
}

func (t *Thread) GetRoots() *Container {
	roots := &Container{message: nil}

	for _, child := range t.idTable {
		if child.parent == nil {
			roots.addChild(child)
		}
	}

	roots.pruneEmpties()

	return roots
}

func normalizeSubject(subject string) string {
	re := regexp.MustCompile(`(?i)((Re|Fwd|Fw|回复|答复)(\[[\d+]\])?[:：](\s*)?)*(.*)`)
	ss := re.FindStringSubmatch(subject)
	return ss[5]
}

func isReplyOrForward(subject string) bool {
	re := regexp.MustCompile(`^(?i)(Re|Fwd|Fw|回复|答复)\s*[:：]`)
	return re.MatchString(subject)
}

func NewThread(messages []*Message) *Thread {
	thread := &Thread{}
	thread.createIdTable(messages)

	return thread
}
