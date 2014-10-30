/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var FormModel = require('bat-ria/mvc/FormModel');
    var api = require('common/config').api;
    var Deferred = require('er/Deferred');

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
     * @returns {Object} .
     */
    MailComposeModel.prototype.getDefaultArgs = function() {
        return {
            id: this.get('id')
        };
    };

    /**
     * 查询联系人的信息
     * @param {string} keyword 联系人的关键字
     * @returns {er.Deferred} .
     */
    MailComposeModel.prototype.getContacts = function(keyword) {
        return api.contactsList({keyword: keyword, pageSize: 6}).then(function(page) {
            return page.result || [];
        });
    };

    /**
     * 上传附件
     * @param {File} file 已经选择的文件.
     * @returns {er.Deferred} .
     */
    MailComposeModel.prototype.uploadAttachment = function(file) {
        var requesting = new Deferred();

        var xhr = new XMLHttpRequest();
        var fd = new FormData();

        fd.append('file', file, file.name);
        fd.append('type', 'ajax');

        xhr.open('POST', '/api/upload/controller?action=file', true);
        xhr.onload = function(e) {
            try {
                var json = JSON.parse(e.target.response);
                if (json.state === 'SUCCESS') {
                    requesting.resolve({
                        data: {
                            name: file.name,
                            url: json.url
                        }
                    });
                }
            }
            catch(ex) {
                requesting.reject(ex);
            }
        };
        xhr.send(fd);

        return requesting.promise;
    };

    /**
     * @inheritDoc
     * @returns {Object} .
     */
    MailComposeModel.prototype.getExtraData = function () {
        return {};
    };

    // return模块
    require('er/util').inherits(MailComposeModel, FormModel);
    return MailComposeModel;
});
