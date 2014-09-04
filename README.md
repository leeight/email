Mac下面的Outlook总是弹登录框，无法忍受了。

最新版本：0.0.3-alpha.3，查看[变更记录](ChangeLog.md)

## 支持的功能

1. 通过POP3协议收取邮件，**不会删除服务器上的邮件**    
   因为协议的限制，只是收取Inbox的邮件，如果有过滤器把邮件放到其它的目录，是收取不了的（可以考虑在Outlook或者其它客户端里面把过滤器禁用掉，把所有邮件都放到Inbox即可）。
2. 通过SMTP协议发送邮件  
   1.  暂时只支持发送纯文本内容的邮件，如果需要添加附件或者邮件内添加图片，现在还不支持。
   2.  支持『回复』,『转发』邮件，回复和转发的时候，邮件中的图片内容和附件是可以正常被发送的，Outlook也可以正常处理（只测试了Mac下面的Outlook）
   
3. 可以通过配置`filters.yml`来自定义过滤器

## 环境准备

1. 安装 [golang](http://golang.org)
2. 检出依赖代码 `git clone http://gitlab.baidu.com/liyubei/gopath.git`
3. 设置环境变量 `export GOPATH=$(pwd)/gopath`
4. 检出项目代码 `git clone http://gitlab.baidu.com/baidu/email.git && cd email && git checkout 0.0.2-alpha.1`

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

`smtp`部分的用户名是`internal\username`，不是`username`。

配置更新之后，执行 `bin/main` 即可，此时会自动创建 `data/baidu.com/username` 目录来存放收取的邮件或者解析出来的附件

第一次收取邮件花费的时间比较久，请耐心等待。

### 联系人信息

邮件收取完毕之后，`cd src/server && go run tools/fix_contacts.go`来修复一下联系人列表，之后就可以撰写邮件的时候，看到联系人自动提示的功能了。

### 邮件浏览

邮件收取完毕之后，把`dist`目录的内容全部拷贝到`data/baidu.com/username`下面，然后执行 `bin/frontend` 就可以启动webserver来查看数据了。

正常启动之后，可以通过 <http://localhost:8765/index.html#/mail/inbox> 来查看邮件。
