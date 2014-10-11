/**
 * @file 常量保存与转换
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
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

            // 先copy所有内容
            u.extend(map, constants);

            // 处理`VL`类型常量
            // 例如 [ { v: 'ACTIVE', l: '已启用' }, { v: 'INACTIVE', l: '未启用' } ]
            // 将生成如下几种形式的数据：
            // 1. 以v为key、以l为value的对象，命名为`[原始常量名]_MAP`
            //    如 { ACTIVE: '已启用', INACTIVE: '未启用' }
            // 2. 将v/l分别转换为value/text的数组，命名为`[原始常量名]_DATASOURCE`
            //    如 [ { value: 'ACTIVE', text: '已启用' }, { value: 'INACTIVE', text: '未启用' } ]
            u.each(map, function (value, key) {
                // 数组且只要数组元素都包含v、l两个key，就进行转换
                if (
                    u.isArray(value)
                    && !u.contains(u.pluck(value, 'v'), undefined)
                    && !u.contains(u.pluck(value, 'l'), undefined)
                ) {
                    var vlMap = map[key + VL_MAP_SUFFIX] = {};
                    var vlDatasource = map[key + VL_DATASOURCE_SUFFIX] = [];

                    u.each(value, function(item) {
                        vlMap[item.v] = item.l;
                        vlDatasource.push(u.mapKey(item, { v: 'value', l: 'text' }));
                    });
                }
            });
        }
    };
    
    // return模块
    return exports;
});
