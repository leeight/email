define('ef/UIView', [
    'require',
    'underscore',
    'er/View',
    'ef/ActionDialog',
    'esui',
    'esui/Dialog',
    'esui/main',
    'esui/ViewContext',
    'eoo'
], function (require) {
    var u = require('underscore');
    var View = require('er/View');
    require('ef/ActionDialog');
    var exports = {};
    function getProperty(target, path) {
        var value = target;
        for (var i = 0; i < path.length; i++) {
            value = value[path[i]];
        }
        return value;
    }
    exports.replaceValue = function (value) {
        if (typeof value !== 'string') {
            return value;
        }
        if (value === '@@' || value === '**') {
            return this.model;
        }
        var prefix = value.charAt(0);
        var actualValue = value.substring(1);
        if (prefix === '@' || prefix === '*') {
            var path = actualValue.split('.');
            var value = this.model.get(path[0]);
            return path.length > 1 ? getProperty(value, path.slice(1)) : value;
        } else {
            return value;
        }
    };
    exports.get = function (id) {
        return this.viewContext.get(id);
    };
    exports.getSafely = function (id) {
        return this.viewContext.getSafely(id);
    };
    exports.getGroup = function (name) {
        return this.viewContext.getGroup(name);
    };
    exports.create = function (type, options) {
        options = options || {};
        if (!options.viewContext) {
            options.viewContext = this.viewContext;
        }
        return require('esui').create(type, options);
    };
    exports.alert = function (content, title) {
        var options = typeof content === 'string' ? {
                title: title || document.title,
                content: content
            } : u.clone(content);
        if (!options.viewContext) {
            options.viewContext = this.viewContext;
        }
        var Dialog = require('esui/Dialog');
        return Dialog.alert(options);
    };
    exports.confirm = function (content, title) {
        var options = typeof content === 'string' ? {
                title: title || document.title,
                content: content
            } : u.clone(content);
        if (!options.viewContext) {
            options.viewContext = this.viewContext;
        }
        var Dialog = require('esui/Dialog');
        return Dialog.confirm(options);
    };
    exports.popActionDialog = function (options) {
        var main = document.createElement('div');
        document.body.appendChild(main);
        var defaults = {
                width: 600,
                needFoot: false,
                draggable: true,
                closeOnHide: true,
                autoClose: true,
                main: main,
                viewContext: this.viewContext
            };
        options = u.defaults({}, options, defaults);
        var ui = require('esui/main');
        var dialog = ui.create('ActionDialog', options);
        dialog.render();
        dialog.show();
        return dialog;
    };
    exports.uiEvents = null;
    exports.getUIEvents = function () {
        return this.uiEvents || {};
    };
    exports.uiProperties = null;
    exports.getUIProperties = function () {
        return this.uiProperties;
    };
    function bindEventToControl(view, id, eventName, handler) {
        if (typeof handler === 'string') {
            handler = view[handler];
        }
        if (typeof handler !== 'function') {
            return handler;
        }
        var control = view.get(id);
        if (control) {
            control.on(eventName, handler, view);
        }
        return handler;
    }
    exports.bindEvents = function () {
        var events = this.getUIEvents();
        if (!events) {
            return;
        }
        for (var key in events) {
            if (!events.hasOwnProperty(key)) {
                continue;
            }
            var segments = key.split(':');
            if (segments.length > 1) {
                var id = segments[0];
                var type = segments[1];
                var handler = events[key];
                bindEventToControl(this, id, type, handler);
            } else {
                var map = events[key];
                if (typeof map !== 'object') {
                    return;
                }
                for (var type in map) {
                    if (map.hasOwnProperty(type)) {
                        var handler = map[type];
                        bindEventToControl(this, key, type, handler);
                    }
                }
            }
        }
    };
    var counter = 8785925;
    function getGUID() {
        return 'ef-' + counter++;
    }
    exports.getViewName = function () {
        if (this.name) {
            return this.name;
        }
        var name = this.constructor && this.constructor.name;
        if (!name && this.constructor) {
            var functionString = this.constructor.toString();
            var match = /function\s+([^\(]*)/.exec(functionString);
            name = match && match[1].replace(/\s+$/g, '');
        }
        if (!name) {
            name = getGUID();
        }
        name = name.replace(/View$/, '');
        name = name.replace(/[A-Z]{2,}/g, function (match) {
            return match.charAt(0) + match.slice(1, -1).toLowerCase() + match.charAt(match.length - 1);
        });
        name = name.replace(/[A-Z]/g, function (match) {
            return '-' + match.toLowerCase();
        });
        if (name.charAt(0) === '-') {
            name = name.substring(1);
        }
        return name;
    };
    exports.createViewContext = function () {
        var ViewContext = require('esui/ViewContext');
        var name = this.getViewName();
        return new ViewContext(name || null);
    };
    exports.enterDocument = function () {
        this.viewContext = this.createViewContext();
        var container = this.getContainerElement();
        var options = {
                viewContext: this.viewContext,
                properties: this.getUIProperties(),
                valueReplacer: u.bind(this.replaceValue, this)
            };
        try {
            require('esui').init(container, options);
        } catch (ex) {
            var error = new Error('ESUI initialization error on view ' + 'because: ' + ex.message);
            error.actualError = ex;
            throw error;
        }
        this.bindEvents();
    };
    exports.dispose = function () {
        if (this.viewContext) {
            this.viewContext.dispose();
            this.viewContext = null;
        }
        this.$super(arguments);
    };
    var UIView = require('eoo').create(View, exports);
    return UIView;
});