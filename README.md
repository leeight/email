nodejs 还是 golang 呢？

如果使用 golang，可以顺便熟悉这种语言，而且 golang 内置了 smtp 的库，不需要依赖第三方的东东了

发送邮件：<http://golang.org/pkg/net/smtp/>

解析邮件的内容（支持附件么？）：<http://golang.org/pkg/net/mail/>


数据结构的设计：

```
  Thread
    Message 1
    Message 2
    ...
    Message N

  Message
    List<Header>
    Body
    List<Attachment>

  Header
    Key
    Value

  Raw
```

这些字段是干啥的？

1. Message-Id
2. Thread-Topic
3. Thread-Index


一些规范的阅读

1. rfc 2045
2. rfc 2047
3. http://en.wikipedia.org/wiki/Post_Office_Protocol
4. http://support.microsoft.com/kb/216366/en-us
5. http://www.faqs.org/rfcs/rfc1939.html
6. http://en.wikipedia.org/wiki/SMTP_Authentication
7. http://kb.mozillazine.org/How_do_I_check_for_new_messages_in_other_folders
8. msgFilterRules.dat：<http://kb.mozillazine.org/Message_Filters>
9. http://wiki.babel.baidu.com/twiki/bin/view/Com/Client/POP%E5%8D%8F%E8%AE%AE%E5%92%8CIMAP%E5%8D%8F%E8%AE%AE

如果要通过POP3下载所有的邮件，需要一批一批的下载，STAT Command只会返回一部分的内容。
下载完毕之后，执行QUIT，然后开启新的Session，继续下载。参考：<http://markmail.org/message/ezkomyyw6vjiznrt#query:+page:1+mid:ezkomyyw6vjiznrt+state:results>

以为直接跟POP3和SMTP打交道太麻烦了，因此有了Exchange Web Service的封装。
后来发现EWS也是很麻烦，就有了EWS Managed API。
不过EWS是基于HTTPs + SOAP协议的，所以可以跨平台，但是EWS Managed API不是，被限定到了Windows下面。
