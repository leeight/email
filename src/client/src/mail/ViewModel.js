/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var BaseModel = require('bat-ria/mvc/BaseModel');
    var datasource = require('er/datasource');
    var api = require('common/config').api;
    var batUtil = require('bat-ria/util');
    var moment = require('moment');
    var u = require('underscore');
    var ical = require('common/ical');

    /**
     * [Please Input Model Description]
     *
     * @constructor
     */
    function MailViewModel() {
        BaseModel.apply(this, arguments);
    }


    /**
     * @inheritDoc
     */
    MailViewModel.prototype.datasource = {
        hostname: function(model) {
            return location.hostname;
        },
        email: function(model) {
            return api.readMail({id: model.get('id')}).then(function(email){
                email.date = moment(email.date).format('YYYY-MM-DD HH:mm:ss');
                if (!email.from) {
                    email.from = {
                        name: '未知来源',
                        address: '未知来源'
                    };
                }

                if (email.message.indexOf('BEGIN:VCALENDAR') != -1) {
                    try {
                        var calendar = ical.parse(email.message);
                        email.message = ical.format(calendar);
                        email.is_calendar = true;
                    }
                    catch(ex) {
                        email.message = '<pre><b>' + ex.toString() + '</b>\n' + email.message + '</pre>';
                    }
                } else {
                    // FIXME(user) 修复了 http://gitlab.baidu.com/baidu/email/issues/20 之后应该就不需要了
                    email.message = email.message.replace(/聽/g, '');
                }

                // FIXME(user) 修复查看附件url的地址
                u.each(email.attachments, function(item) {
                    if (/\.(doc|xls|ppt)x?$/i.test(item.name)) {
                        item.preview_url = 'http://' + location.hostname + ':8765/doc/viewer/' +
                            email.uidl + '/att/' + encodeURIComponent(item.name);
                    }
                    else {
                        item.preview_url = 'http://' + location.hostname + ':8765/downloads/' +
                            email.uidl + '/att/' + encodeURIComponent(item.name);
                    }
                });

                return email;
            })
        }
    };


    /**
     * @param {Array.<string>} ids 把ids的邮件标记为已删除
     */
    MailViewModel.prototype.deleteMails = function(ids) {
        return api.deleteMails({ids: ids});
    };

    // return模块
    require('er/util').inherits(MailViewModel, BaseModel);
    return MailViewModel;
});
