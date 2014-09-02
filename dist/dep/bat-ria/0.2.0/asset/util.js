define('bat-ria/util', [
    'require',
    'underscore',
    'moment',
    './io/serverIO',
    'urijs',
    './system/user',
    'etpl'
], function (require) {
    var u = require('underscore');
    var moment = require('moment');
    var io = require('./io/serverIO');
    var util = {};
    util.genRequesters = function (url, isRequester) {
        if (u.typeOf(url) === 'String') {
            isRequester = isRequester || function (path) {
                return !/\/(?:up|down)load$/.test(path);
            };
            if (!isRequester(url)) {
                return url;
            }
            return function (data, options) {
                return io.post(url, data, options);
            };
        } else if (u.typeOf(url) === 'Object' || u.typeOf(url) === 'Array') {
            var collection = u.clone(url);
            u.each(collection, function (url, key) {
                collection[key] = util.genRequesters(url);
            });
            return collection;
        } else if (u.typeOf(url) === 'Function') {
            return url;
        }
    };
    util.getTimeRange = function (begin, end, options) {
        if (arguments.length === 1) {
            options = begin;
        }
        var defaults = {
                inputFormat: 'YYYYMMDDHHmmss',
                outputFormat: 'Date'
            };
        options = u.defaults({}, options, defaults);
        if (begin && end) {
            begin = u.isString(begin) ? moment(begin, options.inputFormat) : moment(begin);
            end = u.isString(end) ? moment(end, options.inputFormat) : moment(end);
        } else {
            var now = moment().startOf('day');
            begin = now.clone().subtract('days', 7);
            end = now.clone().subtract('day', 1).endOf('day');
        }
        if (options.outputFormat.toLowerCase() === 'date') {
            begin = begin.toDate();
            end = end.toDate();
        } else {
            begin = begin.format(options.outputFormat);
            end = end.format(options.outputFormat);
        }
        var keys = {
                begin: options.beginKey || 'begin',
                end: options.endKey || 'end'
            };
        return u.mapKey({
            begin: begin,
            end: end
        }, {
            begin: keys.begin,
            end: keys.end
        });
    };
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
                } else if (u.isString(converter)) {
                    map[k] = item[converter];
                } else {
                    map[k] = item;
                }
            }
        }
        return map;
    };
    util.genListLink = function (link) {
        var defaults = { className: 'list-operation' };
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
        return '<a ' + attrs.join(' ') + '>' + u.escape(link.text) + '</a>';
    };
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
        if (u.typeOf(command.args) === 'String') {
            attrs['data-command-args'] = command.args;
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
        return '<' + tagName + ' ' + attrs.join(' ') + '>' + u.escape(command.text) + '</' + tagName + '>';
    };
    util.genListOperations = function (operations, config) {
        config = config || {};
        var html = u.map(operations, function (operation) {
                if (operation.url) {
                    return util.genListLink(operation);
                } else {
                    return util.genListCommand(operation);
                }
            });
        return html.join(config.separator || '<span class="list-operation-separator">|</span>');
    };
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
            var aderId = user.ader && user.ader.id || URI.parseQuery(document.location.search).aderId;
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