define('esui/extension/AutoSort', [
    'require',
    'underscore',
    '../Table',
    '../Extension',
    '../lib',
    '../main'
], function (require) {
    var u = require('underscore');
    var Table = require('../Table');
    var Extension = require('../Extension');
    function AutoSort() {
        Extension.apply(this, arguments);
    }
    AutoSort.prototype.type = 'AutoSort';
    function sort(e) {
        var computeDiff = e.field.comparer;
        if (!computeDiff) {
            var fieldName = e.field.field;
            computeDiff = function (x, y) {
                if (fieldName) {
                    x = x[fieldName];
                    y = y[fieldName];
                }
                return u.isString(x) && u.isString(y) ? x.localeCompare(y) : x - y;
            };
        }
        function compare(x, y) {
            var diff = computeDiff(x, y);
            return e.order === 'asc' ? diff : -diff;
        }
        var datasource = this.datasource;
        datasource.sort(compare);
        this.setDatasource(datasource);
    }
    AutoSort.prototype.activate = function () {
        if (!(this.target instanceof Table)) {
            return;
        }
        this.target.on('sort', sort);
        Extension.prototype.activate.apply(this, arguments);
    };
    AutoSort.prototype.inactivate = function () {
        if (!(this.target instanceof Table)) {
            return;
        }
        this.target.un('sort', sort);
        Extension.prototype.inactivate.apply(this, arguments);
    };
    require('../lib').inherits(AutoSort, Extension);
    require('../main').registerExtension(AutoSort);
    return AutoSort;
});