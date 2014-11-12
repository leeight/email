package storage

// Storage 是保存文件的接口，后续可以实现网络磁盘的存储或者本地文件的存储
type Storage interface {
	// 保存文件，如果失败了，error != nil
	Save() error
}
