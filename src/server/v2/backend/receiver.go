package backend

import (
	"fmt"
	"io/ioutil"
	"log"
	"path"
	"strings"
	"time"

	pop3 "github.com/bytbox/go-pop3"

	"../filter"
	"../models"
	"../util/parser"
	"../util/saver"
)

// 一次批量查询的个数
var (
	kMatchBatchNum = 256
	emailDateMap   = make(map[string]time.Time)
)

func Receiver(config *models.ServerConfig) error {
	if config.InitMode {
		log.Println("Under the init mode, Mail Receiver will do nothing.")
		return nil
	}

	log.Println("Receiving Mails...")

	var hostname = fmt.Sprintf("%s:%d", config.Pop3.Host, config.Pop3.Port)
	var client *pop3.Client
	var err error
	if config.Pop3.Tls {
		client, err = pop3.DialTLS(hostname)
	} else {
		client, err = pop3.Dial(hostname)
	}

	if err != nil {
		return err
	}
	defer client.Quit()

	err = client.Auth(config.Pop3.Username, config.Pop3.Password)
	if err != nil {
		return err
	}

	// 开始拉数据
	msgs, _, err := client.ListAll()
	if err != nil {
		return err
	}

	uidls, err := client.UidlAll()
	if err != nil {
		return err
	}

	// 在循环的过程中，如果有错误，打印出来，不要中断循环
	// 第一次收取完毕邮件之后，基本上就有一个全量的uidl了，后续再次收取的时候
	// 很多时候都是一些无效的查询，理论上可以在内存里面缓存所有的uidl,id,date的组合，不过
	// 貌似比较麻烦，所以简化一下，通过批量查询来提高一些效率

	var uidlMap = make(map[string][]int)

	for msgid, msg := range msgs {
		uidlMap[string(uidls[msg])] = []int{msgid, msg}
		if len(uidlMap) >= kMatchBatchNum {
			err := batchProcess(uidlMap, config, client)
			if err != nil {
				// 就算有错误，比如有些邮件没有收取下来，那么下一分钟还会继续收取的
				log.Println(err)
			}
			uidlMap = make(map[string][]int)
		}
	}

	if len(uidlMap) > 0 {
		err := batchProcess(uidlMap, config, client)
		if err != nil {
			// 就算有错误，比如有些邮件没有收取下来，那么下一分钟还会继续收取的
			log.Println(err)
		}
	}

	return nil
}

// 批量查询数据库，然后看情况从服务器删除一些邮件
// 再看情况收取一些邮件
func batchProcess(uidlMap map[string][]int,
	config *models.ServerConfig, client *pop3.Client) error {

	// 得到所有的uidl集合，然后从数据库批量查询状态
	uidls := make([]string, 0, len(uidlMap))
	for k := range uidlMap {
		uidls = append(uidls, k)
	}

	// 1. 从数据库里面查询结果
	var emails []*models.Email
	num, err := config.Ormer.
		QueryTable("email").
		Filter("Uidl__in", uidls).
		All(&emails, "Id", "Uidl", "Date")
	if err != nil {
		return err
	}

	if num > 0 {
		// 2. 如果有结果的话，看看是否需要从服务器删除邮件

		// 执行到这里说明数据库里面已经有邮件了，这里就开始检查是否需要删除服务器的信息
		var kmos = config.Pop3.KeepMailOnServer
		var msgids = make([]int, 0, len(emails))
		if kmos > 0 {
			// 配置文件的里面配置了，说是要从服务器中删除，那么就检查是否已经超过这么多天了
			for _, email := range emails {
				if time.Since(email.Date).Hours() > float64(24*kmos) {
					msgids = append(msgids, uidlMap[email.Uidl][0])
					log.Printf("[ DELETE] %d -> %s (%f)\n", uidlMap[email.Uidl][0],
						email.Uidl, time.Since(email.Date).Hours())
				}
			}
		}

		// 3. 开始执行删除的逻辑
		if kmos > 0 && len(msgids) > 0 {
			for _, msgid := range msgids {
				if msgid <= 0 {
					continue
				}
				client.Dele(msgid)
			}
		}

		// 4. 从uidlMap里面删除已经有结果的数据，删除之后，剩下的就是需要从邮件服务器里面接收的uidl了
		for _, email := range emails {
			delete(uidlMap, email.Uidl)
		}
	}

	// 5. 开始从邮件服务器接收邮件
	if len(uidlMap) > 0 {
		return fetchAndSaveMail(uidlMap, config, client)
	}

	return nil
}

func fetchAndSaveMail(uidlMap map[string][]int,
	config *models.ServerConfig, client *pop3.Client) error {

	var fc = config.Service.Filter.Config
	if fc == "" {
		fc = path.Join(config.BaseDir, "filters.json")
	} else {
		fc = path.Join(path.Dir(config.ConfigPath), fc)
	}

	filters, err := filter.NewFilters(fc)
	if err != nil {
		log.Println(err)
	}

	for uidl, array := range uidlMap {
		var msg = array[1]

		if shouldSkip(msg, uidl, config, client) {
			continue
		}

		var raw []byte
		var rawFile = path.Join(config.BaseDir, "raw", uidl+".txt")
		res, err := client.Retr(msg)
		if err != nil {
			log.Println(err)
			continue
		}

		raw = []byte(res)
		err = ioutil.WriteFile(rawFile, raw, 0644)
		if err != nil {
			log.Println(err)
		}

		// 解析邮件的正文，得到 Email 对象
		email, err := parser.NewEmail(raw)
		if err != nil {
			log.Println(uidl, err)
			saver.EmailSaveFallback(raw, string(uidl), err.Error(), config)
			continue
		}
		email.Uidl = string(uidl)

		emailDateMap[uidl] = email.Date

		// 执行过滤器
		if filters != nil {
			err = filter.RunFilter(email, filters[:])
			if err != nil {
				log.Println(uidl, err)
			}
		}

		// 保存到数据库
		saver.EmailSave(email, config)

		// 保存邮件的资源和附件
		saver.EmailResourceSave(email, config)

		// 同步联系人的信息
		flushContact(email)

		log.Printf("[ SAVE] %d -> %s (%d)\n", msg, uidl, email.Id)
	}

	return nil
}

// 判断一下是否应该调整这封邮件，主要是从邮件头中的Date字段来判断的
func shouldSkip(msg int, uidl string,
	config *models.ServerConfig, client *pop3.Client) bool {

	if config.Pop3.RecentMails <= 0 {
		return false
	}

	// 如果配置了 RecentMails 参数，先收取邮件头，检查一下日期
	// 如果 Date >= (time.Now() - RecentMails) 才可以收取
	var deadline = time.Now().Add(
		time.Duration(-24*config.Pop3.RecentMails) * time.Hour)

	if date, ok := emailDateMap[uidl]; ok {
		if date.Before(deadline) {
			log.Printf("(cache) Skip %s, %d\n", uidl, msg)
			return true
		}
	}

	// 开始收取邮件头
	_, err := client.Cmd("TOP %d %d\r\n", msg, 0)
	if err != nil {
		log.Println(err)
		return false
	}

	lines, err := client.ReadLines()
	if err != nil {
		log.Println(err)
		return false
	}

	var emailHeaders = strings.Join(lines, "\n")
	email, err := parser.NewEmailFallback([]byte(emailHeaders))
	if email != nil {
		// 记录一下cache，这样子下次就不需要重新读取邮件头了
		emailDateMap[uidl] = email.Date

		if email.Date.Before(deadline) {
			log.Printf("Skip %s, %d\n", uidl, msg)
			return true
		}
	}

	return false
}

func flushContact(email *models.Email) {
	// 修复from,to,cc,bcc,reply_to这5个字段的值
	email.FixMailAddressFields()

	if email.FromField != nil {
		contactQueue <- email.FromField
	}
	if email.ReplyToField != nil && len(email.ReplyToField) > 0 {
		for _, c := range email.ReplyToField {
			contactQueue <- c
		}
	}
	if email.ToField != nil && len(email.ToField) > 0 {
		for _, c := range email.ToField {
			contactQueue <- c
		}
	}
	if email.CcField != nil && len(email.CcField) > 0 {
		for _, c := range email.CcField {
			contactQueue <- c
		}
	}
}
