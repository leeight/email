define('ef/UIModel', [
    'require',
    'er/Model',
    'eoo'
], function (require) {
    var Model = require('er/Model');
    var exports = {};
    function pad(s) {
        s = s + '';
        return s.length === 1 ? '0' + s : s;
    }
    var formatters = {
            date: function (date) {
                return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
            },
            dateRange: function (range) {
                return formatters.date(range.begin) + ',' + formatters.date(range.end);
            },
            time: function (time) {
                return formatters.date(time) + ' ' + pad(time.getHours()) + ':' + pad(time.getMinutes()) + ':' + pad(time.getSeconds());
            },
            timeRange: function (range) {
                return formatters.time(range.begin) + ',' + formatters.time(range.end);
            }
        };
    exports.formatters = {};
    exports.set = function (name, value, options) {
        if (this.formatters.hasOwnProperty(name)) {
            value = this.formatters[name](value);
        }
        this.$super([
            name,
            value,
            options
        ]);
    };
    exports.fill = function (extension, options) {
        for (var name in extension) {
            if (extension.hasOwnProperty(name) && this.formatters.hasOwnProperty(name)) {
                var formatter = this.formatters[name];
                var value = extension[name];
                extension[name] = formatter(value);
            }
        }
        this.$super(arguments);
    };
    exports.getPart = function (names) {
        if (Object.prototype.toString.call(names) !== '[object Array]') {
            names = [].slice.call(arguments);
        }
        var part = {};
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            part[name] = this.get(name);
        }
        return part;
    };
    var UIModel = require('eoo').create(Model, UIModel);
    UIModel.formatters = formatters;
    return UIModel;
});