define('dev/Index', [
    'require',
    'bat-ria/mvc/BaseAction',
    './IndexModel',
    './IndexView',
    'er/util'
], function (require) {
    var BaseAction = require('bat-ria/mvc/BaseAction');
    function DevIndex() {
        BaseAction.apply(this, arguments);
    }
    DevIndex.prototype.modelType = require('./IndexModel');
    DevIndex.prototype.viewType = require('./IndexView');
    DevIndex.prototype.initBehavior = function () {
        BaseAction.prototype.initBehavior.apply(this, arguments);
    };
    require('er/util').inherits(DevIndex, BaseAction);
    return DevIndex;
});