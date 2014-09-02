define('er/datasource', [
    'require',
    './util',
    './ajax',
    './permission'
], function (require) {
    var datasource = {};
    datasource.constant = function (value) {
        return function () {
            return value;
        };
    };
    datasource.remote = function (url, options) {
        return function (model) {
            options = require('./util').mix({
                url: url,
                dataType: 'json'
            }, options);
            if (typeof options.data === 'function') {
                options.data = options.data(model);
            }
            var ajax = require('./ajax');
            return ajax.request(options);
        };
    };
    datasource.permission = function (name) {
        return function () {
            var permission = require('./permission');
            return permission.isAllow(name);
        };
    };
    datasource.defaultValue = function (defaultValue, name) {
        return function (model, options) {
            if (!options.name && !name) {
                throw new Error('No property name specified to determine whether value exists in this model');
            }
            var propertyName = name || options.name;
            return model.hasValue(propertyName) ? model.get(propertyName) : defaultValue;
        };
    };
    datasource.convertTo = function (type, name) {
        return function (model, options) {
            if (!options.name && !name) {
                throw new Error('No property name specified to convert');
            }
            var property = name || options.name;
            var value = model.get(property);
            switch (type) {
            case 'number':
                return parseInt(value, 10);
            case 'string':
                return value + '';
            case 'boolean':
                return !!value;
            default:
                return value;
            }
        };
    };
    return datasource;
});