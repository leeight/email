/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var BaseAction = require('bat-ria/mvc/BaseAction');

    /**
     * Action构造函数
     * 
     * @constructor
     */
    function ThreadView() {
        BaseAction.apply(this, arguments);
    }

    ThreadView.prototype.modelType = require('./ViewModel');
    ThreadView.prototype.viewType = require('./ViewView');

    /**
     * inheritDoc
     *
     * @protected
     * @override
     */
    ThreadView.prototype.initBehavior = function () {
        BaseAction.prototype.initBehavior.apply(this, arguments);

        // bind event handlers here
    };

    require('er/util').inherits(ThreadView, BaseAction);
    return ThreadView;
});
