/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var FormModel = require('bat-ria/mvc/FormModel');
    var datasource = require('er/datasource');
    var api = require('common/config').api;
    var batUtil = require('bat-ria/util');

    /**
     * [Please Input Model Description]
     *
     * @constructor
     */
    function MailComposeModel() {
        FormModel.apply(this, arguments);

        // 表单数据请求器
        // this.formRequester = api.aa9659a0cDetail;

        // 表单提交请求器 (*)
        this.submitRequester = api.mailPost;
    }


    /**
     * @inheritDoc
     */
    MailComposeModel.prototype.datasource = null;


    /**
     * @inheritDoc
     */
    MailComposeModel.prototype.getDefaultArgs = function() {
        return {
            id: this.get('id')
        };
    };

    /**
     * 查询联系人的信息
     * @param {string} keyword 联系人的关键字
     */
    MailComposeModel.prototype.getContacts = function(keyword) {
        return api.contactsList({keyword: keyword}).then(function(page){
            return page.result || [];
        })
    };

    /**
     * @inheritDoc
     */
    MailComposeModel.prototype.getExtraData = function () {
        return {};
    };

    // return模块
    require('er/util').inherits(MailComposeModel, FormModel);
    return MailComposeModel;
});
