define('mail/InboxModel', [
    'require',
    'bat-ria/mvc/ListModel',
    'er/datasource',
    'common/config',
    'bat-ria/util',
    'er/util'
], function (require) {
    var ListModel = require('bat-ria/mvc/ListModel');
    var datasource = require('er/datasource');
    var api = require('common/config').api;
    var batUtil = require('bat-ria/util');
    function MailInboxModel() {
        ListModel.apply(this, arguments);
        this.listRequester = api.inboxList;
    }
    MailInboxModel.prototype.datasource = {
        labels: function (model) {
            return api.labelList({});
        }
    };
    MailInboxModel.prototype.markAsRead = function (ids) {
        return api.markAsRead({ ids: ids });
    };
    MailInboxModel.prototype.deleteMails = function (ids) {
        return api.deleteMails({ ids: ids });
    };
    MailInboxModel.prototype.defaultArgs = {
        order: 'desc',
        pageSize: 15
    };
    require('er/util').inherits(MailInboxModel, ListModel);
    return MailInboxModel;
});