package sender

import (
	"net/smtp"
)

type loginAuth struct {
	username, password string
}

// NewLoginAuth 用来创建一个登录信息，供 smtp 来用
func NewLoginAuth(username, password string) smtp.Auth {
	return &loginAuth{username, password}
}

func (a *loginAuth) Start(server *smtp.ServerInfo) (string, []byte, error) {
	return "LOGIN", []byte(a.username), nil
}

func (a *loginAuth) Next(fromServer []byte, more bool) ([]byte, error) {
	if more {
		return []byte(a.password), nil
	}
	return nil, nil
}
