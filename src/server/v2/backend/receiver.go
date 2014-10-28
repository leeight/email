package backend

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path"
	"regexp"
	"time"

	"github.com/astaxie/beego/orm"
	pop3 "github.com/bytbox/go-pop3"

	"../filter"
	"../models"
	"../parser"
	"../util"
	"../util/storage"
)

func Receiver(config *models.ServerConfig) error {
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

	filters, err := filter.NewFilters(config.Service.Filter.Config)
	if err != nil {
		log.Println(err)
	}

	uidls, err := client.UidlAll()
	if err != nil {
		return err
	}

	// 在循环的过程中，如果有错误，打印出来，不要中断循环
	for msgid, msg := range msgs {
		var uidl = uidls[msg]
		var email = &models.Email{Uidl: string(uidl)}
		var err = config.Ormer.Read(email, "Uidl")

		if err == nil && email.Id > 0 {
			// 存在记录
			var kmos = config.Pop3.KeepMailOnServer
			if kmos > 0 &&
				time.Since(email.Date).Hours() > float64(24*kmos) {
				// 判断 date 和 当前的日期差别，如果大于 config.Pop3.Delete_older_mails 的配置
				// 说明可以删除
				log.Printf("[ DELETE] %d -> %s (%f)\n", msgid, uidl,
					time.Since(email.Date).Hours())
				client.Dele(msgid)
			}
			continue
		} else if err != orm.ErrNoRows {
			// 肯定有其它错误了
			log.Println(err)
			continue
		}

		raw, err := client.Retr(msg)
		if err != nil {
			log.Println(err)
			continue
		}

		// 如果不存在的话，保存原始的文件
		var rawFile = path.Join(config.BaseDir, "raw", uidl+".txt")
		if _, err := os.Stat(rawFile); err != nil {
			err = ioutil.WriteFile(rawFile, []byte(raw), 0644)
			if err != nil {
				log.Println(err)
			}
		}

		// 解析邮件的正文，得到 Email 对象
		email, err = parser.NewEmail([]byte(raw))
		if err != nil {
			log.Println(uidl, err)
			continue
		}
		email.Uidl = string(uidl)

		// 执行过滤器
		if filters != nil {
			err = filter.RunFilter(email, filters[:])
			if err != nil {
				log.Println(uidl, err)
			}
		}

		// 保存到数据库
		emailSave(email, config)

		// 保存邮件的资源和附件
		emailResourceSave(email, config)

		log.Printf("[ SAVE] %d -> %s (%d)\n", msg, uidl, email.Id)
	}

	return nil
}

// 把邮件的保存到数据库，包括相关的Tags信息
func emailSave(email *models.Email, config *models.ServerConfig) {
	var err error

	email.Id, err = config.Ormer.Insert(email)
	if err != nil {
		log.Println(err)
		return
	}

	// 看看是否有Tags的信息，如果有的话，需要更新Tags
	if email.Tags != nil && len(email.Tags) > 0 {
		// 初始化Tag的信息，有的话，得到Id，没有的话，插入之后也得到了Id
		for _, tag := range email.Tags {
			_, tag.Id, _ = config.Ormer.ReadOrCreate(tag, "Name")
		}

		var m2m = config.Ormer.QueryM2M(email, "Tags")
		_, err = m2m.Add(email.Tags)
		if err != nil {
			log.Println("[ ADD TAG]", email.Uidl, err)
		}
	}
}

// 把邮件相关的资源保存下来，以本地文件或者网盘的文件的形式
func emailResourceSave(email *models.Email, config *models.ServerConfig) {
	re := regexp.MustCompile(`src="cid:([^"]+)"`)
	sm := re.FindAllSubmatch([]byte(email.Message), -1)

	// 先保存cid
	for _, match := range sm {
		var key = string(match[1])
		if value, ok := email.ResourceBundle[key]; ok {
			// 如果存在的话，那么这个文件需要写入cid目录
			var dst = path.Join(config.BaseDir, "downloads", email.Uidl, "cid", key)
			var data = value.Body
			storage.NewDiskStorage(dst, data, 0644).Save()

			// 写完之后删除，最后剩下的就放到att目录即可
			delete(email.ResourceBundle, key)
		}
	}

	// 再保存att
	if len(email.ResourceBundle) <= 0 {
		return
	}

	for _, value := range email.ResourceBundle {
		var filename string
		if value.Name != "" {
			filename = value.Name
		} else if value.ContentId != "" {
			filename = value.ContentId
		} else {
			continue
		}

		var dst = path.Join(config.BaseDir, "downloads", email.Uidl, "att", filename)
		var data = value.Body

		// TODO(user) 应该通过 chan 传递数据过去，而不是每次启动一个新的 goroutine
		go storage.NewDiskStorage(dst, data, 0644).Save()

		// dst需要重新计算
		var token = config.Service.Netdisk.AccessToken
		if token != "" {
			var uidl = util.StripInvalidCharacter(email.Uidl)
			var name = util.StripInvalidCharacter(filename)
			if uidl != "" && name != "" {
				// 一般不会超过1000个字节，所以不考虑超长的情况了
				var dst = fmt.Sprintf("/apps/dropbox/%s/%s/%s/%s",
					config.Pop3.Domain, config.Pop3.Username, uidl, name)
				if len([]byte(dst)) > 1000 {
					log.Println(dst, "was too long")
					continue
				}

				// TODO(user) 应该通过 chan 传递数据过去，而不是每次启动一个新的 goroutine
				go storage.NewNetdiskStorage(token, dst, data).Save()
			}
		}
	}
}
