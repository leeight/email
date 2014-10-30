/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var ListModel = require('bat-ria/mvc/ListModel');
    var api = require('common/config').api;

    /**
     * [Please Input Model Description]
     *
     * @constructor
     */
    function MailSearchModel() {
        ListModel.apply(this, arguments);

        // 列表请求器 (*)
        this.listRequester = api.mailSearch;
    }


    /**
     * TODO(user) 重复的配置 InboxModel.js
     * @inheritDoc
     */
    MailSearchModel.prototype.datasource = {
        navigators: function(model) {
            var navigators = [
                {
                    path: '#/mail/inbox',
                    name: 'All Mail',
                    active: false
                },
                {
                    path: '#/mail/sent',
                    name: 'Search Mail',
                    active: true
                },
                {
                    path: '#/calendar/list',
                    name: 'All Calendar',
                    active: false
                },
                {
                    path: '#/mail/sent',
                    name: 'Sent Mail',
                    active: false
                },
                {
                    path: '#/mail/deleted',
                    name: 'Deleted Mail',
                    active: false
                }
            ];

            return navigators;
        }
    };

    /**
     * @inheritDoc
     */
    // MailSearchModel.prototype.defaultTimeRange = batUtil.getTimeRange();

    /**
     * @inheritDoc
     */
    MailSearchModel.prototype.defaultArgs = {
        order: 'desc',
        pageSize: 15
    };


    /**
     * @param {Array.<string>} ids 把ids的邮件标记为已读
     * @returns {er.Deferred} .
     */
    MailSearchModel.prototype.markAsRead = function(ids) {
        return api.markAsRead({ids: ids});
    };

    /**
     * @param {Array.<string>} ids 把ids的邮件标记为已删除
     * @returns {er.Deferred} .
     */
    MailSearchModel.prototype.deleteMails = function(ids) {
        return api.deleteMails({ids: ids});
    };


    // return模块
    require('er/util').inherits(MailSearchModel, ListModel);
    return MailSearchModel;
});
