define('esui/Control', [
    'require',
    './lib',
    'underscore',
    './main',
    './Helper',
    './SafeWrapper',
    'mini-event/EventTarget'
], function (require) {
    var lib = require('./lib');
    var u = require('underscore');
    var ui = require('./main');
    var Helper = require('./Helper');
    function Control(options) {
        options = options || {};
        this.helper = new Helper(this);
        this.helper.changeStage('NEW');
        this.children = [];
        this.childrenIndex = {};
        this.currentStates = {};
        this.domEvents = {};
        this.main = options.main ? options.main : this.createMain(options);
        if (!this.id && !options.id) {
            this.id = lib.getGUID();
        }
        this.initOptions(options);
        this.helper.initViewContext();
        this.helper.initExtensions();
        this.helper.changeStage('INITED');
        this.fire('init');
    }
    Control.prototype = {
        constructor: Control,
        ignoreStates: ['disabled'],
        getCategory: function () {
            return 'control';
        },
        initOptions: function (options) {
            options = options || {};
            this.setProperties(options);
        },
        createMain: function () {
            if (!this.type) {
                return document.createElement('div');
            }
            var name = this.type.replace(/([A-Z])/g, function (match, ch) {
                    return '-' + ch.toLowerCase();
                });
            return document.createElement(ui.getConfig('customElementPrefix') + '-' + name.slice(1));
        },
        initStructure: function () {
        },
        initEvents: function () {
        },
        render: function () {
            if (this.helper.isInStage('INITED')) {
                this.fire('beforerender');
                this.domIDPrefix = this.viewContext.id;
                this.initStructure();
                this.initEvents();
                if (!this.main.id) {
                    this.main.id = this.helper.getId();
                }
                this.main.setAttribute(ui.getConfig('instanceAttr'), this.id);
                this.main.setAttribute(ui.getConfig('viewContextAttr'), this.viewContext.id);
                this.helper.addPartClasses();
                if (this.states) {
                    this.states = typeof this.states === 'string' ? this.states.split(' ') : this.states;
                    u.each(this.states, this.addState, this);
                }
            }
            this.repaint();
            if (this.helper.isInStage('INITED')) {
                this.helper.changeStage('RENDERED');
                this.fire('afterrender');
            }
        },
        repaint: function (changes, changesIndex) {
            if (!changesIndex || changesIndex.hasOwnProperty('disabled')) {
                var method = this.disabled ? 'addState' : 'removeState';
                this[method]('disabled');
            }
            if (!changesIndex || changesIndex.hasOwnProperty('hidden')) {
                var method = this.hidden ? 'addState' : 'removeState';
                this[method]('hidden');
            }
        },
        appendTo: function (wrap) {
            if (wrap instanceof Control) {
                wrap = wrap.main;
            }
            wrap.appendChild(this.main);
            if (this.helper.isInStage('NEW') || this.helper.isInStage('INITED')) {
                this.render();
            }
        },
        insertBefore: function (reference) {
            if (reference instanceof Control) {
                reference = reference.main;
            }
            reference.parentNode.insertBefore(this.main, reference);
            if (this.helper.isInStage('NEW') || this.helper.isInStage('INITED')) {
                this.render();
            }
        },
        dispose: function () {
            if (!this.helper.isInStage('DISPOSED')) {
                this.helper.beforeDispose();
                this.helper.dispose();
                this.helper.afterDispose();
            }
        },
        destroy: function () {
            var main = this.main;
            this.dispose();
            lib.removeNode(main);
        },
        get: function (name) {
            var method = this['get' + lib.pascalize(name)];
            if (typeof method == 'function') {
                return method.call(this);
            }
            return this[name];
        },
        set: function (name, value) {
            var method = this['set' + lib.pascalize(name)];
            if (typeof method == 'function') {
                return method.call(this, value);
            }
            var property = {};
            property[name] = value;
            this.setProperties(property);
        },
        isPropertyChanged: function (propertyName, newValue, oldValue) {
            return oldValue !== newValue;
        },
        setProperties: function (properties) {
            if (!this.stage) {
                if (properties.hasOwnProperty('id')) {
                    this.id = properties.id;
                }
                if (properties.hasOwnProperty('group')) {
                    this.group = properties.group;
                }
                if (properties.hasOwnProperty('skin')) {
                    this.skin = properties.skin;
                }
            }
            delete properties.id;
            delete properties.group;
            delete properties.skin;
            if (properties.hasOwnProperty('viewContext')) {
                this.setViewContext(properties.viewContext);
                delete properties.viewContext;
            }
            if (this.hasOwnProperty('disabled')) {
                this.disabled = !!this.disabled;
            }
            if (this.hasOwnProperty('hidden')) {
                this.hidden = !!this.hidden;
            }
            var changes = [];
            var changesIndex = {};
            for (var key in properties) {
                if (properties.hasOwnProperty(key)) {
                    var newValue = properties[key];
                    var getterMethodName = 'get' + lib.pascalize(key) + 'Property';
                    var oldValue = this[getterMethodName] ? this[getterMethodName]() : this[key];
                    var isChanged = this.isPropertyChanged(key, newValue, oldValue);
                    if (isChanged) {
                        this[key] = newValue;
                        var record = {
                                name: key,
                                oldValue: oldValue,
                                newValue: newValue
                            };
                        changes.push(record);
                        changesIndex[key] = record;
                    }
                }
            }
            if (changes.length && this.helper.isInStage('RENDERED')) {
                this.repaint(changes, changesIndex);
            }
            return changesIndex;
        },
        setViewContext: function (viewContext) {
            var oldViewContext = this.viewContext;
            if (oldViewContext == viewContext) {
                return;
            }
            if (oldViewContext) {
                this.viewContext = null;
                oldViewContext.remove(this);
            }
            this.viewContext = viewContext;
            viewContext && viewContext.add(this);
            var children = this.children;
            if (children) {
                for (var i = 0, len = children.length; i < len; i++) {
                    children[i].setViewContext(viewContext);
                }
            }
            if (this.viewContext && this.helper.isInStage('RENDERED')) {
                this.main.setAttribute(ui.getConfig('viewContextAttr'), this.viewContext.id);
            }
        },
        setDisabled: function (disabled) {
            this[disabled ? 'disable' : 'enable']();
        },
        disable: function () {
            this.addState('disabled');
        },
        enable: function () {
            this.removeState('disabled');
        },
        isDisabled: function () {
            return this.hasState('disabled');
        },
        show: function () {
            this.removeState('hidden');
        },
        hide: function () {
            this.addState('hidden');
        },
        toggle: function () {
            this[this.isHidden() ? 'show' : 'hide']();
        },
        isHidden: function () {
            return this.hasState('hidden');
        },
        addState: function (state) {
            if (!this.hasState(state)) {
                this.currentStates[state] = true;
                this.helper.addStateClasses(state);
                var properties = {};
                var statePropertyName = state.replace(/-(\w)/, function (m, c) {
                        return c.toUpperCase();
                    });
                properties[statePropertyName] = true;
                this.setProperties(properties);
            }
        },
        removeState: function (state) {
            if (this.hasState(state)) {
                this.currentStates[state] = false;
                this.helper.removeStateClasses(state);
                var properties = {};
                var statePropertyName = state.replace(/-(\w)/, function (m, c) {
                        return c.toUpperCase();
                    });
                properties[statePropertyName] = false;
                this.setProperties(properties);
            }
        },
        toggleState: function (state) {
            var methodName = this.hasState(state) ? 'removeState' : 'addState';
            this[methodName](state);
        },
        hasState: function (state) {
            return !!this.currentStates[state];
        },
        addChild: function (control, childName) {
            childName = childName || control.childName;
            if (control.parent) {
                control.parent.removeChild(control);
            }
            this.children.push(control);
            control.parent = this;
            if (childName) {
                control.childName = childName;
                this.childrenIndex[childName] = control;
            }
            if (this.viewContext != control.viewContext) {
                control.setViewContext(this.viewContext);
            }
        },
        removeChild: function (control) {
            var children = this.children;
            var len = children.length;
            while (len--) {
                if (children[len] === control) {
                    children.splice(len, 1);
                }
            }
            var childName = control.childName;
            if (childName) {
                this.childrenIndex[childName] = null;
            }
            control.parent = null;
        },
        disposeChildren: function () {
            var children = this.children.slice();
            for (var i = 0; i < children.length; i++) {
                children[i].dispose();
            }
            this.children = [];
            this.childrenIndex = {};
        },
        getChild: function (childName) {
            return this.childrenIndex[childName] || null;
        },
        getChildSafely: function (childName) {
            var child = this.getChild(childName);
            if (!child) {
                var SafeWrapper = require('./SafeWrapper');
                child = new SafeWrapper();
                child.childName = childName;
                child.parent = this;
                if (this.viewContext) {
                    child.viewContext = this.viewContext;
                }
            }
            return child;
        },
        initChildren: function (wrap, options) {
            this.helper.initChildren(wrap, options);
        }
    };
    var EventTarget = require('mini-event/EventTarget');
    lib.inherits(Control, EventTarget);
    return Control;
});