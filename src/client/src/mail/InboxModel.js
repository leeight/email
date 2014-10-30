/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var ListModel = require('bat-ria/mvc/ListModel');
    var api = require('common/config').api;
    var u = require('underscore');

    /**
     * [Please Input Model Description]
     *
     * @constructor
     */
    function MailInboxModel() {
        ListModel.apply(this, arguments);

        // 列表请求器 (*)
        this.listRequester = api.inboxList;
    }


    /**
     * @inheritDoc
     */
    MailInboxModel.prototype.datasource = {
        labels: function(model) {
            return api.labelList({});
        },
        navigators: function(model) {
            var index = location.href.indexOf('#');
            var url = index === -1 ? '' : location.href.slice(index);

            var navigators = [
                {
                    path: '#/mail/inbox',
                    name: 'All Mail',
                    active: false
                },
                {
                    path: '#/mail/starred',
                    name: 'Starred Mail',
                    active: false
                },
                // {
                //     path: '#/thread/list',
                //     name: 'All Thread',
                //     active: false
                // },
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

            var label = model.get('label');
            if (!label) {
                u.each(navigators, function(item) {
                    item.active = url.indexOf(item.path) === 0;
                });
            }

            return navigators;
        }
    };

    /**
     * @param {Array.<string>} ids 把ids的邮件标记为已读
     * @returns {er.Deferred} .
     */
    MailInboxModel.prototype.markAsRead = function(ids) {
        return api.markAsRead({ids: ids});
    };

    /**
     * @param {Array.<string>} ids 把ids的邮件标记为已删除
     * @returns {er.Deferred} .
     */
    MailInboxModel.prototype.deleteMails = function(ids) {
        return api.deleteMails({ids: ids});
    };

    /**
     * @param {Array.<string>} ids 把ids的邮件添加星标
     * @returns {er.Deferred} .
     */
    MailInboxModel.prototype.addStar = function(ids) {
        return api.addStar({ids: ids});
    };

    /**
     * @param {Array.<string>} ids 把ids的邮件删除星标
     * @returns {er.Deferred} .
     */
    MailInboxModel.prototype.removeStar = function(ids) {
        return api.removeStar({ids: ids});
    };

    /**
     * @inheritDoc
     */
    // MailInboxModel.prototype.defaultTimeRange = batUtil.getTimeRange();

    /**
     * @inheritDoc
     */
    MailInboxModel.prototype.defaultArgs = {
        order: 'desc',
        pageSize: 15
    };


    MailInboxModel.prototype.getExtraQuery = function () {
        var index = location.href.indexOf('#');
        var url = index === -1 ? '' : location.href.slice(index);

        if (url.indexOf('#/mail/deleted') === 0) {
            return {'is_delete': 1};
        } else if (url.indexOf('#/mail/sent') === 0) {
            return {'is_sent': 1};
        } else if (url.indexOf('#/calendar/list') === 0) {
            return {'is_calendar': 1};
        } else if (url.indexOf('#/mail/starred') === 0) {
            return {'is_star': 1};
        }

        return {};
    };

    // return模块
    require('er/util').inherits(MailInboxModel, ListModel);
    return MailInboxModel;
});
