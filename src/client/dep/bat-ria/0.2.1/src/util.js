/**
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file BAT工具模块
 * @author Justineo
 */
define(function (require) {
    var u = require('underscore');
    var moment = require('moment');
    var io = require('./io/serverIO');

    /**
     * 工具模块
     *
     * @class util
     * @singleton
     */
    var util = {};

    /**
     * 根据URL字符串生成请求发送器
     *
     * 传入一个字符串时，只返回一个发送器函数；传入数组或对象时，递归；传入函数时
     *
     * @param {string|Array.<string>|Object.<string, string>|Function} url 请求路径或多个请求路径的集合，或是取值函数
     * @param {Function(string):boolean} isRequester 判断是否是需要生成请求发送器的路径
     * @return {Function|Array.<Function>|Object.<string, Function>} 将对应的路径转换为发送器后返回
     */
    util.genRequesters = function (url, isRequester) {
        if (u.typeOf(url) === 'String') {
            // 只有一个URL，直接返回封装过的请求方法

            // 过滤掉不需要生成的URL
            isRequester = isRequester || function (path) {
                // 默认跳过以`/download`和`/upload`结尾的路径
                return !/\/(?:up|down)load$/.test(path);
            };

            if (!isRequester(url)) {
                return url;
            }

            return function (data, options) {
                return io.post(url, data, options);
            };
        }
        else if (u.typeOf(url) === 'Object' || u.typeOf(url) === 'Array') {
            // 是一个集合，那么递归封装一下
            var collection = u.clone(url);
            u.each(collection, function (url, key) {
                collection[key] = util.genRequesters(url);
            });
            return collection;
        }
        else if (u.typeOf(url) === 'Function') {
            // 是一个函数，不用封装
            return url;
        }
    };

    /**
     * 生成时间段数据
     *
     * 未指定`begin`及`end`时默认取最近7天
     *
     * 有两种重载：
     * 1. getTimeRange(options)
     * 2. getTimeRange(begin, end, options)
     *
     * @param {Date|string} [begin] 开始日期
     * @param {Date|string} [end] 结束日期
     * @param {Object} [options] 生成选项
     * @param {string} [options.inputFormat] 输入参数的格式，为`'Date'`时会当作`Date`对象，否则为格式字符串
     * @param {string} [options.outputFormat] 输出参数的格式，参见`inputFormat`
     * @param {string} [options.beginKey] 结果对象开始时间的键名
     * @param {string} [options.endKey] 结果对象结束时间的键名
     * @return {Object} 时间段的数据，格式由`options`参数决定
     */
    util.getTimeRange = function (begin, end, options) {

        // 只有一个参数时，认为是options
        if (arguments.length === 1) {
            options = begin;
        }

        var defaults = {
            inputFormat: 'YYYYMMDDHHmmss',
            outputFormat: 'Date'
        };

        options = u.defaults({}, options, defaults);

        // 解析输入，没有则使用默认时间
        if (begin && end) {
            begin = u.isString(begin)
                ? moment(begin, options.inputFormat)
                : moment(begin);
            end = u.isString(end)
                ? moment(end, options.inputFormat)
                : moment(end);
        }
        else {
            var now = moment().startOf('day');

            // 默认前七天
            begin = now.clone().subtract('days', 7);
            end = now.clone().subtract('day', 1).endOf('day');
        }

        // 处理输出
        if (options.outputFormat.toLowerCase() === 'date') {
            begin = begin.toDate();
            end = end.toDate();
        }
        else {
            begin = begin.format(options.outputFormat);
            end = end.format(options.outputFormat);
        }

        var keys = {
            begin: options.beginKey || 'begin',
            end: options.endKey || 'end'
        };

        return u.mapKey(
            {
                begin: begin,
                end: end
            },
            {
                begin: keys.begin,
                end: keys.end
            }
        );
    };

    /**
     * 将同构对象的数组转换为按对象中某个键值为键名的对象
     *
     * 可以定义转换器，来转换输出对象的内容
     * `converter`为函数时，接受的参数为输入数组的元素，返回值必须为`{ key: ..., value: ... }`格式，即结果对象的键值对
     * `converter`为字符串时，结果对象键值为数组元素对应键名的键值
     * `converter`缺失时，结果对象键值为数组元素
     *
     * 例如：
     * `list`为`[ { id: 1, name: 'Thor' }, { id: 2, name: 'Hulk' } ]，
     * `key`为`id`时，
     *
     * util.toMap(list, key, function(item) {
     *     return {
     *         key: '#' + item.id,
     *         value: item.name.toUpperCase()
     *     };
     * }) → { '#1': 'THOR', '#2': 'HULK' }
     *
     * util.toMap(list, key, 'name') → { '1': 'Thor', '2': 'Hulk' }
     *
     * util.toMap(list, key) → { '1': { id: 1, name: 'Thor' }, '2': { id: 2, name: 'Hulk' } }
     *
     * @param {Array.<Object>} list 同构对象的数组
     * @param {string} key 取对应键值为结果对象的键名
     * @param {Function|string} [converter] 转换器
     * @return {Object} 转换完毕的对象
     */
    util.toMap = function (list, key, converter) {
        var i;
        var item;
        var k;
        var map = {};
        var converter = converter;

        for (i = list.length; i--;) {
            item = list[i];
            k = item[key];
            if (k != null) {
                if (u.isFunction(converter)) {
                    var keyValue = converter(item);
                    map[keyValue.key] = keyValue.value;
                }
                else if (u.isString(converter)) {
                    map[k] = item[converter];
                }
                else {
                    map[k] = item;
                }
            }
        }
        return map;
    };

    /**
     * 根据生成在列表页中操作列中的链接HTML
     *
     * @param {Object} link 链接配置
     * @param {string} [link.className="list-operation"] 链接的className
     * @param {string} link.url 链接的目标URL
     * @param {string} [link.target] 链接的target属性
     * @param {string} link.text 链接文本
     * @param {Object} [link.extra] 附加属性对象，对应kv对会以data-key="value"形式附加到HTML上
     * @return {string} 生成的HTML内容
     */
    util.genListLink = function (link) {
        var defaults = {
            className: 'list-operation'
        };

        link = u.defaults(link, defaults);

        var attrs = {
            href: link.url,
            'class': link.className
        };

        if (link.target && link.target.toLowerCase() !== '_self') {
            attrs.target = link.target;
        }

        if (u.typeOf(link.extra) === 'Object') {
            u.each(link.extra, function (val, key) {
                attrs['data-' + key] = val;
            });
        }

        attrs = u.map(attrs, function (val, key) {
            return key + '="' + u.escape(val) + '"';
        });

        return '<a ' + attrs.join(' ') + '>'
            + u.escape(link.text) + '</a>';
    };

    /**
     * 根据生成在列表页中操作列中的操作按钮HTML
     *
     * @param {Object} command 操作配置
     * @param {string} [command.className="list-operation"] 操作按钮的className
     * @param {string} [command.tagName="span"] 操作按钮的HTML元素类型
     * @param {string} command.type 操作按钮点击时触发的事件类型
     * @param {string} [command.args] 操作按钮点击后触发事件所带的参数
     * @param {string} command.text 操作按钮显示的文本
     * @param {Object} [command.extra] 附加属性对象，对应kv对会以data-key="value"形式附加到HTML上
     * @return {string} 生成的HTML内容
     */
    util.genListCommand = function (command) {
        var defaults = {
            tagName: 'span',
            className: 'list-operation'
        };
        command = u.defaults(command, defaults);
        var attrs = {
            'class': command.className,
            'data-command': command.type
        };

        if (typeof command.args !== 'undefined') {
            attrs['data-command-args'] = '' + command.args;
        }

        if (u.typeOf(command.extra) === 'Object') {
            u.each(command.extra, function (val, key) {
                attrs['data-' + key] = val;
            });
        }

        attrs = u.map(attrs, function (val, key) {
            return key + '="' + u.escape(val) + '"';
        });

        var tagName = u.escape(command.tagName);
        return '<' + tagName + ' ' + attrs.join(' ') + '>'
            + u.escape(command.text) + '</' + tagName + '>';
    };

    /**
     * 生成列表页操作/链接列表的HTML
     *
     * @param {Array.<Object>} operations 操作/链接配置的数组
     * @param {Object} config 列表配置
     * @param {string} [config.separator="<span class=\"list-operation-separator\">|</span>"] 列表分隔符
     * @return {string} 生成的HTML内容
     */
    util.genListOperations = function (operations, config) {
        config = config || {};
        var html = u.chain(operations)
            .map(function (operation) {
                if (operation.url) {
                    return util.genListLink(operation);
                }
                else {
                    return util.genListCommand(operation);
                }
            })
            .compact()
            .value();

        return html.join(config.separator || '');
    };

    /**
     * 下载文件
     * @param {string} url 文件地址.
     */
    util.download = function (url) {
        var divId = '__DownloadContainer__';
        var formId = '__DownloadForm__';
        var iframeId = '__DownloadIframe__';
        var tpl = [
            '<form action="${url}" method="post" id="${formId}" ',
                'name="${formId}" target="${iframeId}"></form>',
            '<iframe src="about:blank" id="${iframeId}" name="${iframeId}">',
            '</iframe>'
        ].join('');

        function getUrlWithAderId() {
            var URI = require('urijs');
            var user = require('./system/user');
            var aderId = user.ader && user.ader.id
                || URI.parseQuery(document.location.search).aderId;
            var query = aderId ? { aderId: aderId } : {};
            return URI(url).addQuery(query).toString();
        }

        function getDownloadContainer() {
            var div = document.getElementById(divId);
            if (!div) {
                div = document.createElement('div');
                div.id = divId;
                div.style.display = 'none';
                document.body.appendChild(div);
            }
            return div;
        }

        var ctner = getDownloadContainer();
        var render = require('etpl').compile(tpl);
        ctner.innerHTML = render({
            url: getUrlWithAderId(url),
            formId: formId,
            iframeId: iframeId
        });
        document.getElementById(formId).submit();
    };

    return util;
});
