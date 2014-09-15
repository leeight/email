/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var ListAction = require('bat-ria/mvc/ListAction');

    /**
     * Action构造函数
     * 
     * @constructor
     */
    function ThreadList() {
        ListAction.apply(this, arguments);
    }

    ThreadList.prototype.modelType = require('./ListModel');
    ThreadList.prototype.viewType = require('./ListView');

    /**
     * inheritDoc
     *
     * @protected
     * @override
     */
    ThreadList.prototype.initBehavior = function () {
        ListAction.prototype.initBehavior.apply(this, arguments);

        // bind event handlers here
    };

    require('er/util').inherits(ThreadList, ListAction);
    return ThreadList;
});
