package storage

type Storage interface {
	// 保存文件，如果失败了，error != nil
	Save() error
}
