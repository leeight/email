package models

import (
	"log"

	"../../net/mail"
)

// 过滤器要执行的动作
type actionType map[string]interface{}

// 过滤器的条件判断
type conditionType struct {
	Match string     `json:"match"`
	Rules [][]string `json:"rules"`
}

// 过滤器的配置
type Filter struct {
	Name      string        `json:"name"`
	Disable   bool          `json:"disable"`
	Stop      bool          `json:"stop"`
	Condition conditionType `json:"condition"`
	Action    actionType    `json:"action"`
}

// 判断邮件是否符合规则
func (filter *Filter) Match(email *Email) bool {
	match := filter.Condition.Match
	if match == "All" {
		// 全部条件都要满足
		for _, rule := range filter.Condition.Rules {
			if len(rule) <= 1 {
				// 至少需要2项
				continue
			}

			if !filter.CheckRule(email, rule[:]) {
				return false
			}
		}

		return true
	} else if match == "Any" {
		// 满足任意一个条件即可
		for _, rule := range filter.Condition.Rules {
			if len(rule) <= 1 {
				// 至少需要2项
				continue
			}

			if filter.CheckRule(email, rule[:]) {
				return true
			}
		}

		return false
	} else {
		// TODO(user) 暂不支持
		return false
	}
}

// 检查一封邮件是否符合某条规则，如果符合的话返回true，否则返回false
func (filter *Filter) CheckRule(email *Email, rule []string) bool {
	var msg = email.RawMessage
	var key = rule[0]

	operator := NewOperator(rule[1])
	if operator == nil {
		log.Printf("Can't support such operator = [%s]\n", rule[1])
		return false
	}

	switch key {
	case "From":
		from, err := mail.ParseAddress(email.From)
		if err != nil {
			return false
		}

		return operator.Exec(from.Address, rule[2])
	case "To":
		to, err := mail.ParseAddressList(email.To)
		if err != nil {
			return false
		}

		return operator.Exec(to, rule[2])
	case "Cc":
		cc, err := mail.ParseAddressList(email.Cc)
		if err != nil {
			return false
		}

		return operator.Exec(cc, rule[2])
	case "SentTo":
		to, err := mail.ParseAddressList(email.To)
		if err == nil {
			if operator.Exec(to, rule[2]) {
				return true
			}
			cc, err := mail.ParseAddressList(email.Cc)
			if err == nil {
				if operator.Exec(cc, rule[2]) {
					return true
				}
			}
		}

		return false
	case "Subject":
		return operator.Exec(email.Subject, rule[2])
	case "Body":
		return operator.Exec(email.Message, rule[2])
	case "SubjectOrBody":
		a := operator.Exec(email.Subject, rule[2])
		b := operator.Exec(email.Message, rule[2])
		return a || b
	case "Date":
		return operator.Exec(email.Date, rule[2])
	// case kHSize:
	//  break
	case "Attachments":
		// TODO(user) 这个判断准确么
		a := msg.Header.Get("X-Has-Attach") == "yes"
		b := msg.Header.Get("X-MS-Has-Attach") == "yes"
		return a || b
	default:
		return operator.Exec(msg.Header.Get(key), rule[2])
	}

	return false
}

// 如果符合规则的话，也就是通过Match判断的话，执行规则定义的动作
func (filter *Filter) TakeAction(email *Email) error {
	for k, v := range filter.Action {
		action := NewAction(k)
		if action != nil {
			err := action.Exec(email, v)
			if err != nil {
				log.Printf("Action Name = (%s), Error = (%v)\n", k, err)
				return err
			}
		}
	}
	return nil
}
