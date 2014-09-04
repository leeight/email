define('bat-ria/mvc/ForbiddenAction', [
    'require',
    'er/util',
    'er/Action',
    './ForbiddenModel',
    './ForbiddenView'
], function (require) {
    var util = require('er/util');
    var Action = require('er/Action');
    function ForbiddenAction() {
        Action.apply(this, arguments);
    }
    util.inherits(ForbiddenAction, Action);
    ForbiddenAction.prototype.modelType = require('./ForbiddenModel');
    ForbiddenAction.prototype.viewType = require('./ForbiddenView');
    return ForbiddenAction;
});