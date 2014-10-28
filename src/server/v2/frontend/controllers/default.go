package controllers

import (
	"../../models"
)

// pkg级别公用的变量
var gSrvConfig *models.ServerConfig

func SetServerConfig(c *models.ServerConfig) {
	gSrvConfig = c
}
