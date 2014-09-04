define('mail/ViewModel', [
    'require',
    'bat-ria/mvc/BaseModel',
    'er/datasource',
    'common/config',
    'bat-ria/util',
    'moment',
    'underscore',
    'er/util'
], function (require) {
    var BaseModel = require('bat-ria/mvc/BaseModel');
    var datasource = require('er/datasource');
    var api = require('common/config').api;
    var batUtil = require('bat-ria/util');
    var moment = require('moment');
    var u = require('underscore');
    function MailViewModel() {
        BaseModel.apply(this, arguments);
    }
    MailViewModel.prototype.datasource = {
        email: function (model) {
            return api.readMail({ id: model.get('id') }).then(function (email) {
                email.date = moment(new Date(email.date)).format('YYYY-MM-DD HH:mm:ss');
                if (!email.from) {
                    email.from = {
                        name: '\u672A\u77E5\u6765\u6E90',
                        address: '\u672A\u77E5\u6765\u6E90'
                    };
                }
                if (email.message.indexOf('BEGIN:VCALENDAR') != -1) {
                    email.message = '<pre>' + email.message + '</pre>';
                }
                email.message = email.message.replace(/聽/g, '');
                u.each(email.attachments, function (item) {
                    if (/\.(doc|xls|ppt)x?$/i.test(item.name)) {
                        item.preview_url = 'http://127.0.0.1:8765/doc/viewer/' + email.uidl + '/att/' + encodeURIComponent(item.name);
                    } else {
                        item.preview_url = 'http://127.0.0.1:8765/downloads/' + email.uidl + '/att/' + encodeURIComponent(item.name);
                    }
                });
                return email;
            });
        }
    };
    MailViewModel.prototype.deleteMails = function (ids) {
        return api.deleteMails({ ids: ids });
    };
    require('er/util').inherits(MailViewModel, BaseModel);
    return MailViewModel;
});