package base

import (
	"bytes"
	"database/sql"
	"gopkg.in/yaml.v1"
	"io/ioutil"
	"log"
	"path"
	"strings"

	"../net/mail"
)

type Filter struct {
	Name      string
	Disable   bool
	Stop      bool
	Condition struct {
		Match string
		Rules [][]string
	}
	Action map[string]interface{}
}

func CheckRule(email *EMail, msg *mail.Message, rule []string) bool {
	key := rule[0]

	operator := NewOperator(rule[1])
	if operator == nil {
		log.Fatal("Can't support such operator = [" + rule[1] + "]")
		return false
	}

	switch key {
	case kFrom:
		from, err := mail.ParseAddress(email.From)
		if err != nil {
			return false
		}

		return operator.Exec(from.Address, rule[2])
	case kTo:
		to, err := mail.ParseAddressList(email.To)
		if err != nil {
			return false
		}

		return operator.Exec(to, rule[2])
	case kCc:
		cc, err := mail.ParseAddressList(email.Cc)
		if err != nil {
			return false
		}

		return operator.Exec(cc, rule[2])
	case kSentTo:
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
	case kSubject:
		return operator.Exec(email.Subject, rule[2])
	case kBody:
		return operator.Exec(email.Message, rule[2])
	case kSubjectOrBody:
		a := operator.Exec(email.Subject, rule[2])
		b := operator.Exec(email.Message, rule[2])
		return a || b
	case kDate:
		return operator.Exec(email.Date, rule[2])
	// case kHSize:
	// 	break
	case kAttachments:
		// TODO(user) 这个判断准确么
		a := msg.Header.Get("X-Has-Attach") == "yes"
		b := msg.Header.Get("X-MS-Has-Attach") == "yes"
		return a || b
	default:
		return operator.Exec(msg.Header.Get(key), rule[2])
	}

	return false
}

// 判断邮件是否符合规则
func (filter *Filter) Match(email *EMail, rawDir string) bool {
	raw, err := ioutil.ReadFile(path.Join(rawDir, email.Uidl+".txt"))
	if err != nil {
		log.Fatal(err)
		return false
	}

	msg, err := mail.ReadMessage(bytes.NewBuffer(raw))
	if err != nil {
		log.Fatal(err)
		return false
	}

	match := filter.Condition.Match
	if match == kMatchAll {
		// 全部条件都要满足
		for _, rule := range filter.Condition.Rules {
			if len(rule) <= 1 {
				// 至少需要2项
				continue
			}

			if !CheckRule(email, msg, rule[:]) {
				return false
			}
		}

		return true
	} else if match == kMatchAny {
		// 满足任意一个条件即可
		for _, rule := range filter.Condition.Rules {
			if len(rule) <= 1 {
				// 至少需要2项
				continue
			}

			if CheckRule(email, msg, rule[:]) {
				return true
			}
		}

		return false
	} else {
		// TODO(user) 暂不支持
		return false
	}
}

// 如果符合规则的话，也就是通过Match判断的话，执行规则定义的动作
func (filter *Filter) TakeAction(email *EMail, db *sql.DB) error {
	for k, v := range filter.Action {
		action := NewAction(k)
		if action != nil {
			err := action.Exec(email, v, db)
			if err != nil {
				log.Fatal("Action Name = (%s), Error = (%v)", k, err)
				return err
			}
		}
	}
	return nil
}

// 针对一封邮件，运行一边所有的Filter
func RunFilter(email *EMail, filters []Filter, rawDir string, db *sql.DB) error {
	names := make([]string, 0)
	for _, filter := range filters {
		if filter.Disable {
			continue
		}

		if filter.Match(email, rawDir) {
			err := filter.TakeAction(email, db)
			if err != nil {
				log.Fatal(err)
				return err
			}
			names = append(names, filter.Name)

			if filter.Stop {
				log.Printf("(%d, %s) => %v",
					email.Id, email.Uidl, strings.Join(names, " => "))
				// 匹配之后就停止，那么就不继续了
				return nil
			}
		}
	}

	if len(names) > 0 {
		log.Printf("(%d, %s) => %v",
			email.Id, email.Uidl, strings.Join(names, " => "))
	}

	return nil
}

func GetFilters(file string) ([]Filter, error) {
	data, err := ioutil.ReadFile(file)
	if err != nil {
		return nil, err
	}

	var filters []Filter
	err = yaml.Unmarshal(data, &filters)
	if err != nil {
		return nil, err
	}

	return filters, nil
}
