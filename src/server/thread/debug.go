package thread

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"regexp"
	"runtime/pprof"
	"sort"
	"strings"
)

func readAllMessages() []*Message {
	messages := make([]*Message, 0)

	raw, _ := ioutil.ReadFile("messages.json")
	json.Unmarshal(raw, &messages)

	return messages
}

func Debug() {
	var cpuprofile = flag.String("cpuprofile", "", "write cpu profile to file")
	var case1 = flag.Int("case1", 0, "switch the branch")
	var uidlsptr = flag.String("uidls", "", "only care about this uidl, separated with commas or space")
	flag.Parse()

	if *cpuprofile != "" {
		f, err := os.Create(*cpuprofile)
		if err != nil {
			log.Fatal(err)
		}
		pprof.StartCPUProfile(f)
		defer pprof.StopCPUProfile()
	}

	var uidls = make(map[string]bool)
	if *uidlsptr != "" {
		for _, uidl := range regexp.MustCompile(`[,\s]+`).Split(*uidlsptr, -1) {
			uidls[uidl] = true
		}
	}

	thrd := NewThread(make([]*Message, 0))
	for _, msg := range readAllMessages() {
		if len(uidls) > 0 {
			// 如果指定了uidl的列表，但是当前这个msg不再这个列表里面，那么就忽略之
			if _, ok := uidls[msg.Uidl]; !ok {
				continue
			}
		}

		if *case1 == 0 {
			thrd.addMessage1(msg)
		} else {
			// 自动调用expandSubjectTable
			thrd.addMessage2(msg)
		}
	}

	if *case1 == 0 {
		for _, container := range thrd.idTable {
			if container.parent == nil {
				thrd.roots.addChild(container)
			}
		}
		thrd.expandSubjectTable(thrd.roots.children)

		thrd.groupBySubject(thrd.roots.children)
	} else {
		// 已经自动调用过
		// 1. roots.addChild
		// 2. expandSubjectTable
		// 3. groupBySubject
	}
	return
	for subject, container := range thrd.subjectTable {
		messages := container.flattenChildren()
		if !container.IsEmpty() {
			newmsg := make([]*Message, len(messages)+1)
			copy(newmsg[1:], messages[0:])
			newmsg[0] = container.message
			messages = newmsg
		}

		mids := make([]string, len(messages))
		for idx, msg := range messages {
			mids[idx] = msg.Uidl
		}
		sort.Strings(mids)
		fmt.Printf("%s => %s\n", subject, strings.Join(mids, ","))
	}
}
