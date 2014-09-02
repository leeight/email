define('bat-ria/mvc/BaseModel', [
    'require',
    'underscore',
    'er/util',
    'ef/UIModel'
], function (require) {
    var u = require('underscore');
    var util = require('er/util');
    var UIModel = require('ef/UIModel');
    function BaseModel(context) {
        UIModel.call(this, context);
    }
    util.inherits(BaseModel, UIModel);
    BaseModel.prototype.mergeDefaultDatasource = function () {
        if (!this.datasource) {
            this.datasource = this.defaultDatasource;
            return;
        }
        var datasource = u.deepClone(this.datasource) || {};
        var defaultDatasource = u.deepClone(this.defaultDatasource);
        if (u.isArray(defaultDatasource)) {
            if (u.isArray(datasource)) {
                datasource = defaultDatasource.concat(datasource);
            } else {
                datasource = defaultDatasource.push(datasource);
            }
        } else {
            if (u.isArray(datasource)) {
                if (!u.contains(datasource, defaultDatasource)) {
                    datasource.unshift(defaultDatasource);
                }
            } else {
                u.defaults(datasource, defaultDatasource);
            }
        }
        this.datasource = datasource;
    };
    BaseModel.prototype.load = function () {
        this.mergeDefaultDatasource();
        return UIModel.prototype.load.apply(this, arguments);
    };
    return BaseModel;
});