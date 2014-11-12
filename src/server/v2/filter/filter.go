package filter

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"strings"

	"../models"
)

// RunFilter 对单个邮件执行一遍过滤器，如果出错或者遇到Stop:true的情况，就停止执行
func RunFilter(email *models.Email, filters []models.Filter) error {
	var names []string
	for _, filter := range filters {
		if filter.Disable {
			continue
		}

		if filter.Match(email) {
			err := filter.TakeAction(email)
			if err != nil {
				log.Println(email.Uidl, filter.Name, err)
				return err
			}
			names = append(names, filter.Name)

			if filter.Stop {
				log.Printf("(%d, %s) => %v\n",
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

// NewFilters 从 filters.json 构造新的过滤器
func NewFilters(file string) ([]models.Filter, error) {
	data, err := ioutil.ReadFile(file)
	if err != nil {
		return nil, err
	}

	var filters []models.Filter
	err = json.Unmarshal(data, &filters)
	if err != nil {
		return nil, err
	}

	return filters, nil
}
