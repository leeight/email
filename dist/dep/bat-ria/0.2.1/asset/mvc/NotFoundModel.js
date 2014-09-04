define('bat-ria/mvc/NotFoundModel', [
    'require',
    'er/util',
    'er/Model'
], function (require) {
    var util = require('er/util');
    var Model = require('er/Model');
    function NotFoundModel(context) {
        Model.call(this, context);
    }
    util.inherits(NotFoundModel, Model);
    return NotFoundModel;
});