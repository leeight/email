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
    function ThreadListModel() {
        ListModel.apply(this, arguments);

        // 列表请求器 (*)
        this.listRequester = api.threadList;
    }


    /**
     * @inheritDoc
     */
    ThreadListModel.prototype.datasource = {
        navigators: function(model) {
            var navigators = [
                {
                    path: '#/mail/inbox',
                    name: 'All Mail',
                    active: false
                },
                {
                    path: '#/thread/list',
                    name: 'All Thread',
                    active: true
                },
                {
                    path: '#/mail/sent',
                    name: 'Search Mail',
                    active: false
                }
            ];

            return navigators;
        }
    };

    /**
     * @inheritDoc
     */
    // ThreadListModel.prototype.defaultTimeRange = batUtil.getTimeRange();

    /**
     * @inheritDoc
     */
    ThreadListModel.prototype.defaultArgs = {
        order: 'desc',
        pageSize: 15
    };


    // return模块
    require('er/util').inherits(ThreadListModel, ListModel);
    return ThreadListModel;
});
