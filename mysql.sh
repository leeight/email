#!/usr/bin/env bash
mysql_install_db --basedir=$(brew --prefix mysql) --datadir=`pwd`/data/baidu.com/liyubei/db
mysqld --datadir=`pwd`/data/baidu.com/liyubei/db

# mysqladmin -u root -p shutdown
