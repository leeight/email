package main

// 修复目录的结构，在 downloads/${uidl}/ 下面新增
// 一级目录，改成 downloads/${uidl}/{cid,att}，用来
// 存放 Content-Id 和 Attachments 的内容

import (
	// "io"
	// "io/ioutil"
	// "os"
	// "path"
	"regexp"

	"./base"
	"./web"
)

func main() {
	config, _ := base.GetConfig("config.yml")
	context := web.NewContext(config)

	log := context.GetLogger()
	db := context.GetDb()
	defer db.Close()

	re := regexp.MustCompile(`src="downloads/([^/]+)/([^"/]+)"`)
	affectedRows := make(map[int64]string)

	rows, _ := db.Query("SELECT id, uidl, message FROM mails")
	for rows.Next() {
		var id int64
		var uidl string
		var message string
		rows.Scan(&id, &uidl, &message)

		sm := re.FindAllSubmatch([]byte(message), -1)
		if len(sm) <= 0 {
			continue
		}
		affectedRows[id] = re.ReplaceAllString(message, `src="downloads/$1/cid/$3"`)
		// return

		// // 读取目录，获取所有的文件列表
		// fs, _ := ioutil.ReadDir(path.Join(config.DownloadDir(), uidl))
		// if len(fs) <= 0 {
		// 	continue
		// }

		// fm := make(map[string]bool)
		// for _, f := range fs {
		// 	if f.IsDir() {
		// 		continue
		// 	}
		// 	fm[f.Name()] = true
		// }

		// // 扫描Message，把Content-Id的内容放到cid目录，剩下的放到att目录
		// sm := re.FindAllSubmatch([]byte(message), -1)

		// // 把Content-Id的内容拷贝到cid目录
		// for _, match := range sm {
		// 	if string(match[1]) != uidl {
		// 		continue
		// 	}

		// 	name := string(match[3])
		// 	src := path.Join(config.DownloadDir(), uidl, name)
		// 	dst := path.Join(config.DownloadDir(), uidl, "cid", name)
		// 	if _, err := os.Stat(src); err == nil {
		// 		// 文件存在
		// 		os.MkdirAll(path.Dir(dst), 0755)
		// 		in, _ := os.Open(src)
		// 		defer in.Close()
		// 		defer os.Remove(src)
		// 		out, _ := os.Create(dst)
		// 		defer out.Close()
		// 		io.Copy(out, in)
		// 		delete(fm, name)
		// 	}
		// }

		// // 把剩下的放到att目录
		// for name, _ := range fm {
		// 	src := path.Join(config.DownloadDir(), uidl, name)
		// 	dst := path.Join(config.DownloadDir(), uidl, "att", name)
		// 	if _, err := os.Stat(src); err == nil {
		// 		// 文件存在
		// 		os.MkdirAll(path.Dir(dst), 0755)
		// 		in, _ := os.Open(src)
		// 		defer in.Close()
		// 		out, _ := os.Create(dst)
		// 		defer out.Close()
		// 		io.Copy(out, in)
		// 		os.Remove(src)
		// 	}
		// }

		// // affectedRows[id] = message
		// log.Info("%d, %s, %d", id, uidl, len(message))
	}

	for id, message := range affectedRows {
		// 更新SQL
		tx, _ := db.Begin()
		tx.Exec("UPDATE mails SET message = ? WHERE id = ?", message, id)
		err := tx.Commit()
		// _, err := db.Exec("UPDATE mails SET message = ? WHERE id = ?", message, id)
		if err != nil {
			log.Warning("%v", err)
		} else {
			log.Info("%d, %d", id, len(message))
		}
	}
}
