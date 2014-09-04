define('bat-ria/mvc/NotFoundAction', [
    'require',
    'er/util',
    'er/Action',
    './NotFoundModel',
    './NotFoundView'
], function (require) {
    var util = require('er/util');
    var Action = require('er/Action');
    function NotFoundAction() {
        Action.apply(this, arguments);
    }
    util.inherits(NotFoundAction, Action);
    NotFoundAction.prototype.modelType = require('./NotFoundModel');
    NotFoundAction.prototype.viewType = require('./NotFoundView');
    return NotFoundAction;
});