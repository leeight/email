部署的方式

## 环境准备

1. 安装 [golang](http://golang.org)
2. 检出依赖代码 `git clone http://gitlab.baidu.com/liyubei/gopath.git`
3. 设置环境变量 `export GOPATH=$(pwd)/gopath`
4. 检出项目代码 `git clone http://gitlab.baidu.com/baidu/email.git`

## 项目BUILD

### 预编译依赖的模块

```
go install github.com/qiniu/iconv
go install github.com/op/go-logging
go install github.com/alexcesaro/mail/quotedprintable
go install github.com/mattn/go-sqlite3
go install github.com/bytbox/go-pop3
go install code.google.com/p/go.net/publicsuffix
go install gopkg.in/yaml.v1
```

### 编译项目的模块

```
cd email && make -C src/server
```

## 启动服务

### 邮件收取

将`email/config.example.yml`复制为`config.yml`，然后把用户名和密码替换为你的账户即可。

需要注意的是`smtp`部分的用户名是`internal\username`，不是`username`

配置更新之后，执行 `bin/main` 即可，此时会自动创建 `data/baidu.com/username` 目录来存放收取的邮件或者解析出来的附件

第一次收取邮件花费的时间比较久，请耐心等待

### 邮件浏览

邮件收取完毕之后，把`dist`目录的内容全部拷贝到`data/baidu.com/username`下面，然后执行 `bin/frontend` 就可以启动webserver来查看数据了。

正常启动之后，可以通过 <http://localhost:8765/index.html#/mail/inbox> 来查看邮件