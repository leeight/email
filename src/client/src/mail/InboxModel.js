/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var ListModel = require('bat-ria/mvc/ListModel');
    var datasource = require('er/datasource');
    var api = require('common/config').api;
    var batUtil = require('bat-ria/util');

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
    MailInboxModel.prototype.datasource = null;

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


    // return模块
    require('er/util').inherits(MailInboxModel, ListModel);
    return MailInboxModel;
});
