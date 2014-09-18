package backend

import (
	"fmt"
	// "strconv"
	"strings"

	"../base"
	"../web"
)

var threadChannel = make(chan *base.EMail, 20)

// 1. 从数据库中加载数据，在内存中构建 Message-Id -> Thread-Id 的映射
// 2. 新邮件到来之后，根据 References 或者 In-Reply-To 来判断所属的 Thread
//    a. 如果能找到对应的 Thread-Id，那么说明这封邮件也属于当前的 Thread
//    b. 如果没有找到对应的 Thread-Id，那么说明这封邮件是一个新的 Thread，创建之
// 3. 离线计算 Thread 的逻辑依旧采用 tools/fix_threads.go 的方案即可？
func AddToThread(ctx web.Context) {
	for {
		email := <-threadChannel
		addToThreadImpl(ctx, email)
	}
}

func addToThreadImpl(ctx web.Context, email *base.EMail) {
	// return
	log := ctx.GetLogger()
	db := ctx.GetDb()
	defer db.Close()

	if email.Refs == "" {
		// 没有Refs，那么就创建一个新的Thread即可
		// TODO(user) 此时判断一下Thead-Index值的长度是不是更靠谱一些?
		// db.Exec("INSERT INTO threads (`from`, `date`, `subject`,"+
		// 	"`mids`, `is_read`, `is_delete`, `is_spam`) VALUES (?, ?, ?, ?, ?, 0, 0)",
		// 	email.From, email.Date, email.Subject, strconv.FormatUint(email.Id, 10),
		// 	email.IsRead)
		// log.Info("[CREATE-THREAD-ID] eid = %d, tid = ?", email.Id)
		return
	}

	sql := fmt.Sprintf("SELECT `thread_id` FROM `mails` WHERE `msg_id` IN ('0',%s)",
		"'"+strings.Replace(email.Refs, ",", "','", -1)+"'")
	log.Info(sql)
	rows, err := db.Query(sql)
	if err != nil {
		log.Warning("%s", err)
		return
	}

	var threadId int
	for rows.Next() {
		var id int
		rows.Scan(&id)

		if threadId == 0 && id > 0 {
			threadId = id
		} else if threadId > 0 && id != threadId {
			log.Warning("%d != %d", threadId, id)
			return
		}
	}

	if threadId == 0 {
		// TODO(user)
		threadId = -1
		log.Warning("Can not find the Thread-Id by refs: %s",
			email.Refs)
	}

	// 更新这个邮件的 Thread-Id
	_, err = db.Exec("UPDATE `mails` SET `thread_id` = ? WHERE `id` = ?",
		threadId, email.Id)
	log.Info("[SET-THREAD-ID] %d -> %d", email.Id, threadId)
	if err != nil {
		log.Warning("%s", err)
		return
	}

	if threadId > 0 {
		// 更新Thread的from, date信息
		_, err = db.Exec("UPDATE `threads` SET `from` = ?, `date` = ?, `is_read` = 0 WHERE `id` = ?",
			email.From, email.Date, threadId)
		if err != nil {
			log.Warning("%s", err)
		}
	}
}
