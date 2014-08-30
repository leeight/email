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
        email: function(model) {
            return api.readMail({id: model.get('id')}).then(function(email){
                email.date = moment(new Date(email.date)).format('YYYY-MM-DD HH:mm:ss');
                if (!email.from) {
                    email.from = {
                        name: '未知来源',
                        address: '未知来源'
                    };
                }
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
