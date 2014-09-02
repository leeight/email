define('mail/ViewModel', [
    'require',
    'bat-ria/mvc/BaseModel',
    'er/datasource',
    'common/config',
    'bat-ria/util',
    'moment',
    'er/util'
], function (require) {
    var BaseModel = require('bat-ria/mvc/BaseModel');
    var datasource = require('er/datasource');
    var api = require('common/config').api;
    var batUtil = require('bat-ria/util');
    var moment = require('moment');
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