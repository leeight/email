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
    function DevIndex() {
        BaseAction.apply(this, arguments);
    }

    DevIndex.prototype.modelType = require('./IndexModel');
    DevIndex.prototype.viewType = require('./IndexView');

    /**
     * inheritDoc
     *
     * @protected
     * @override
     */
    DevIndex.prototype.initBehavior = function () {
        BaseAction.prototype.initBehavior.apply(this, arguments);

        // bind event handlers here
    };

    require('er/util').inherits(DevIndex, BaseAction);
    return DevIndex;
});
