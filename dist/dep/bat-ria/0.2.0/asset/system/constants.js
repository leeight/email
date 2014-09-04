define([
    'require',
    'underscore'
], function (require) {
    var u = require('underscore');
    var map = {};
    var VL_MAP_SUFFIX = '_MAP';
    var VL_DATASOURCE_SUFFIX = '_DATASOURCE';
    var exports = {
            get: function (key) {
                return map[key];
            },
            set: function (key, value) {
                map[key] = value;
            },
            remove: function (key) {
                delete map[key];
            },
            getMap: function (key) {
                return map[key + VL_MAP_SUFFIX];
            },
            getDatasource: function (key) {
                return map[key + VL_DATASOURCE_SUFFIX];
            },
            init: function (constants) {
                u.extend(map, constants);
                u.each(map, function (value, key) {
                    if (u.isArray(value) && !u.contains(u.pluck(value, 'v'), undefined) && !u.contains(u.pluck(value, 'l'), undefined)) {
                        var vlMap = map[key + VL_MAP_SUFFIX] = {};
                        var vlDatasource = map[key + VL_DATASOURCE_SUFFIX] = [];
                        u.each(value, function (item) {
                            vlMap[item.v] = item.l;
                            vlDatasource.push(u.mapKey(item, {
                                v: 'value',
                                l: 'text'
                            }));
                        });
                    }
                });
            }
        };
    return exports;
});