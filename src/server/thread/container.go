package thread

import (
// "fmt"
)

type Container struct {
	message  *Message
	parent   *Container
	children []*Container
}

func (c *Container) Size() int {
	return len(c.children)
}

func (c *Container) GetMessage() *Message {
	return c.message
}

func (c *Container) GetSubject() string {
	if c.IsEmpty() {
		if len(c.children) > 0 {
			if c.children[0].IsEmpty() {
				return ""
			}
			return c.children[0].message.Subject
		}
		return ""
	} else {
		return c.message.Subject
	}
}

func (c *Container) IsEmpty() bool {
	return c.message == nil
}

func (c *Container) hasDescendant(container *Container) bool {
	if c == container {
		return true
	}

	if len(c.children) < 1 {
		return false
	}

	var descendantPresent bool
	for _, child := range c.children {
		if child.hasDescendant(container) {
			descendantPresent = true
			break
		}
	}

	return descendantPresent
}

func (c *Container) addChild(container *Container) {
	if container.parent != nil {
		container.parent.removeChild(container)
	}
	container.parent = c
	c.children = append(c.children, container)
}

func (c *Container) removeChild(container *Container) {
	for idx, child := range c.children {
		if child == container {
			c.children = append(c.children[:idx], c.children[idx+1:]...)
			break
		}
	}
}

func (c *Container) promoteChildren(container *Container) {
	for i := len(container.children) - 1; i >= 0; i-- {
		child := container.children[i]
		c.addChild(child)
	}
	c.removeChild(container)
}

func (c *Container) GetConversation(msgid string) []*Message {
	messages := make([]*Message, 0)
	container := c.getSpecificChild(msgid)
	if container == nil {
		return messages
	}

	messages = container.FlattenChildren()
	if !container.IsEmpty() {
		newmsg := make([]*Message, len(messages)+1)
		copy(newmsg[1:], messages[0:])
		newmsg[0] = container.message
		return newmsg
	}

	return messages
}

func (c *Container) getSpecificChild(msgid string) *Container {
	if !c.IsEmpty() && c.message.Id == msgid {
		return c
	}

	var specificChild *Container
	for _, child := range c.children {
		found := child.getSpecificChild(msgid)
		if found != nil {
			return found
		}
	}

	return specificChild
}

func (c *Container) threadParent() *Container {
	if c.IsEmpty() || c.parent == nil {
		return c
	}

	next := c.parent
	top := next
	for next != nil {
		next = next.parent
		if next != nil {
			if next.IsEmpty() {
				return top
			} else {
				top = next
			}
		}
	}

	return top
}

func (c *Container) FlattenChildren() []*Message {
	messages := make([]*Message, 0)
	for _, child := range c.children {
		if !child.IsEmpty() {
			messages = append(messages, child.message)
		}
		messages = append(messages, child.FlattenChildren()...)
	}
	return messages
}

// Recursively walk all containers under the root set.
// For each container:
func (c *Container) pruneEmpties() {
	for i := len(c.children) - 1; i >= 0; i-- {
		container := c.children[i]
		container.pruneEmpties()

		// A. If it is an empty container with no children, nuke it.
		if container.IsEmpty() && len(container.children) == 0 {
			c.removeChild(container)
		} else if container.IsEmpty() && len(container.children) > 0 {
			// B. If the Container has no Message, but does have children,
			// remove this container but promote its children to this level
			// (that is, splice them in to the current child list.)
			if c.parent == nil && len(container.children) == 1 {
				c.promoteChildren(container)
			} else if c.parent == nil && len(container.children) > 1 {
				// IGNORE
				// Do not promote the children if doing so would promote them
				// to the root set -- unless there is only one child, in which case, do.
			} else {
				c.promoteChildren(container)
			}
		}
	}
}
