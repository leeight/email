define('bat-ria/mvc/ForbiddenModel', [
    'require',
    'er/util',
    'er/Model'
], function (require) {
    var util = require('er/util');
    var Model = require('er/Model');
    function ForbiddenModel(context) {
        Model.call(this, context);
    }
    util.inherits(ForbiddenModel, Model);
    return ForbiddenModel;
});