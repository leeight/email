/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var BaseModel = require('bat-ria/mvc/BaseModel');
    var api = require('common/config').api;
    var util = require('common/util');
    var u = require('underscore');

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
        labels: function(model) {
            return api.labelList({});
        },
        navigators: function(model) {
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


            var referrer = model.get('referrer');
            var label = model.get('label');
            if (!label && referrer) {
                var url = '#' + referrer.getPath();
                var found = false;
                u.each(navigators, function(item) {
                    item.active = url.indexOf(item.path) === 0;
                    if (item.active) {
                        found = true;
                    }
                });
                if (!found) {
                    navigators[0].active = true;
                }
            } else if (!label && !referrer) {
                navigators[0].active = true;
            }

            return navigators;
        },
        hostname: function(model) {
            return location.hostname;
        },
        email: function(model) {
            return api.readMail({id: model.get('id')}).then(function(email){
                return util.applyEMailPath(email);
            })
        }
    };


    /**
     * @param {Array.<string>} ids 把ids的邮件标记为已删除
     */
    MailViewModel.prototype.deleteMails = function(ids) {
        return api.deleteMails({ids: ids});
    };

    /**
     * @param {Array.<string>} uidl 把 uidl 的邮件的附件重新上传
     */
    MailViewModel.prototype.pcsRetry = function(uidl) {
        return api.pcsRetry({uidl: uidl});
    };


    // return模块
    require('er/util').inherits(MailViewModel, BaseModel);
    return MailViewModel;
});
