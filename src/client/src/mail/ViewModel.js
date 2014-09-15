/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var BaseModel = require('bat-ria/mvc/BaseModel');
    var api = require('common/config').api;
    var util = require('common/util');

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

    // return模块
    require('er/util').inherits(MailViewModel, BaseModel);
    return MailViewModel;
});
