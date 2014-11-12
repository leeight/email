package backend

import (
	"log"

	"../models"
)

// Key是email地址
type contactCache map[string]*models.Contact

// Receiver解析出来之后，通过这个channel传递过来
var contactQueue = make(chan *models.Contact, 100)

// FlushContacts 用来更新数据库中联系人的信息
// 因为一封邮件里面可能会有多个联系人，为了避免多次访问数据库，这里先在
// 内存中做一个缓存，然后定期刷新到数据里面去，即便有数据库不一致的情况也没关系
// 因为Count并不是一个关键的字段，只要有大小的区分即可
func FlushContacts(config *models.ServerConfig) error {
	var cache = make(contactCache)
	var dirtyCount = 0

	for {
		dirtyCount++

		var item = <-contactQueue
		if contact, ok := cache[item.Address]; !ok {
			// 不存在
			cache[item.Address] = &models.Contact{
				Name:    item.Name,
				Address: item.Address,
				Count:   1,
			}
		} else {
			// 存在，更新数据即可
			contact.Count++
			if len(item.Name) > len(contact.Name) {
				contact.Name = item.Name
			}
		}

		if dirtyCount >= 100 {
			flushToDb(cache, config)
			dirtyCount = 0
		}
	}
}

// 同步到数据库
func flushToDb(cache contactCache, config *models.ServerConfig) {
	var o = config.Ormer
	for _, contact := range cache {
		if contact.Count <= 0 {
			continue
		}

		// 如果读到了老的数据，Count的值就被覆盖了
		var inc = contact.Count

		log.Printf("Flushing contact %s, %d\n", contact.Address, inc)

		// 1. 更新数据库
		if created, _, err := o.ReadOrCreate(contact, "Address"); err == nil {
			if !created {
				contact.Count += inc
				_, err := o.Update(contact, "Count", "Name")
				if err != nil {
					log.Println(err)
				}
			} else {
				// 新增了一条记录，不需要处理了
			}
		} else {
			log.Println(err)
		}

		// 2. 重置Count的值
		contact.Count = 0
	}
}
