package storage

import (
	"io/ioutil"
	"log"
	"os"
	"path"
)

type diskStorage struct {
	dst  string
	data []byte
	perm os.FileMode
}

func (s diskStorage) Save() error {
	os.MkdirAll(path.Dir(s.dst), 0755)
	var err = ioutil.WriteFile(s.dst, s.data, s.perm)
	if err == nil {
		log.Printf("Saved file %s\n", s.dst)
	}
	return err
}

// NewDiskStorage 本地文件的存储接口
func NewDiskStorage(dst string, data []byte, perm os.FileMode) Storage {
	log.Printf("Saving file %s", dst)
	return diskStorage{dst, data, perm}
}
