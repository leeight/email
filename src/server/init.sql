DROP TABLE IF EXISTS 'mails';
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS mail_tags;

CREATE TABLE mails (
  'id' INTEGER NOT NULL PRIMARY KEY,  -- 自增的Id
  'uidl' VARCHAR(512),                -- 服务器端的Id
  'from' VARCHAR(1024),               -- 发件人
  'to' VARCHAR(1024),                 -- 收件人
  'cc' VARCHAR(1024),                 -- CC的人
  'bcc' VARCHAR(1024),                -- BCC的人
  'reply_to' VARCHAR(1024),           -- 邮件回复的人
  'date' DATETIME,                    -- 发送的日期
  'subject' VARCHAR(1024),            -- 邮件的标题
  'message' text,                     -- 邮件的征文，已经解析过了
  'status' INTEGER,                   -- 邮件的状态（程序里面去判断）
  'is_read' INTEGER,                  -- 是否已经读过了
  'is_delete' INTEGER,                -- 是否已经删除
  'is_spam' INTEGER                   -- 是否是垃圾邮件
);
CREATE TABLE tags (
  id INTEGER NOT NULL PRIMARY KEY,
  name VARCHAR(512)
);
CREATE TABLE mail_tags (
  id INTEGER NOT NULL PRIMARY KEY,
  mid INTEGER,
  tid INTEGER
);