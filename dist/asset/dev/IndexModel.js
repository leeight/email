define('dev/IndexModel', [
    'require',
    'bat-ria/mvc/BaseModel',
    'er/datasource',
    'common/config',
    'bat-ria/util',
    'er/controller',
    'er/util'
], function (require) {
    var BaseModel = require('bat-ria/mvc/BaseModel');
    var datasource = require('er/datasource');
    var api = require('common/config').api;
    var batUtil = require('bat-ria/util');
    function DevIndexModel() {
        BaseModel.apply(this, arguments);
    }
    DevIndexModel.prototype.datasource = {
        actionList: function (model) {
            return Object.keys(require('er/controller').actionPathMapping);
        }
    };
    require('er/util').inherits(DevIndexModel, BaseModel);
    return DevIndexModel;
});