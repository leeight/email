define('esui/helper/dom', [
    'require',
    'underscore',
    '../lib',
    '../main'
], function (require) {
    function getControlClassType(control) {
        var type = control.styleType || control.type;
        return type.toLowerCase();
    }
    function joinByStrike() {
        return [].slice.call(arguments, 0).join('-');
    }
    var u = require('underscore');
    var lib = require('../lib');
    var ui = require('../main');
    var helper = {};
    helper.getPartClasses = function (part) {
        if (part && this.partClassCache && this.partClassCache.hasOwnProperty(part)) {
            return this.partClassCache[part].slice();
        }
        var type = getControlClassType(this.control);
        var skin = this.control.skin;
        var prefix = ui.getConfig('uiClassPrefix');
        var skinPrefix = ui.getConfig('skinClassPrefix');
        var classes = [];
        if (part) {
            classes.push(joinByStrike(prefix, type, part));
            if (skin) {
                classes.push(joinByStrike(skinPrefix, skin, type, part));
            }
            if (!this.partClassCache) {
                this.partClassCache = {};
                this.partClassCache[part] = classes.slice();
            }
        } else {
            classes.push(joinByStrike(prefix, 'ctrl'));
            classes.push(joinByStrike(prefix, type));
            if (skin) {
                classes.push(joinByStrike(skinPrefix, skin), joinByStrike(skinPrefix, skin, type));
            }
        }
        return classes;
    };
    helper.getPartClassName = function (part) {
        return this.getPartClasses(part).join(' ');
    };
    helper.getPrimaryClassName = function (part) {
        var type = getControlClassType(this.control);
        if (part) {
            return joinByStrike(ui.getConfig('uiClassPrefix'), type, part);
        } else {
            return joinByStrike(ui.getConfig('uiClassPrefix'), type);
        }
    };
    helper.addPartClasses = function (part, element) {
        if (typeof element === 'string') {
            element = this.getPart(element);
        }
        element = element || this.control.main;
        if (element) {
            lib.addClasses(element, this.getPartClasses(part));
        }
    };
    helper.removePartClasses = function (part, element) {
        if (typeof element === 'string') {
            element = this.getPart(element);
        }
        element = element || this.control.main;
        if (element) {
            lib.removeClasses(element, this.getPartClasses(part));
        }
    };
    helper.getStateClasses = function (state) {
        if (this.stateClassCache && this.stateClassCache.hasOwnProperty(state)) {
            return this.stateClassCache[state].slice();
        }
        var type = getControlClassType(this.control);
        var getConf = ui.getConfig;
        var classes = [
                joinByStrike(getConf('uiClassPrefix'), type, state),
                joinByStrike(getConf('stateClassPrefix'), state)
            ];
        var skin = this.control.skin;
        if (skin) {
            var skinPrefix = getConf('skinClassPrefix');
            classes.push(joinByStrike(skinPrefix, skin, state), joinByStrike(skinPrefix, skin, type, state));
        }
        if (!this.stateClassCache) {
            this.stateClassCache = {};
            this.stateClassCache[state] = classes.slice();
        }
        return classes;
    };
    helper.addStateClasses = function (state) {
        var element = this.control.main;
        if (element) {
            lib.addClasses(element, this.getStateClasses(state));
        }
    };
    helper.removeStateClasses = function (state) {
        var element = this.control.main;
        if (element) {
            lib.removeClasses(element, this.getStateClasses(state));
        }
    };
    helper.getId = function (part) {
        part = part ? '-' + part : '';
        if (!this.control.domIDPrefix) {
            this.control.domIDPrefix = this.control.viewContext && this.control.viewContext.id;
        }
        var prefix = this.control.domIDPrefix ? this.control.domIDPrefix + '-' : '';
        return 'ctrl-' + prefix + this.control.id + part;
    };
    helper.createPart = function (part, nodeName) {
        nodeName = nodeName || 'div';
        var element = document.createElement(nodeName);
        element.id = this.getId(part);
        this.addPartClasses(part, element);
        return element;
    };
    helper.getPart = function (part) {
        return lib.g(this.getId(part));
    };
    helper.isPart = function (element, part) {
        var className = this.getPartClasses(part)[0];
        return lib.hasClass(element, className);
    };
    var INPUT_SPECIFIED_ATTRIBUTES = {
            type: true,
            name: true,
            alt: true,
            autocomplete: true,
            autofocus: true,
            checked: true,
            dirname: true,
            disabled: true,
            form: true,
            formaction: true,
            formenctype: true,
            formmethod: true,
            formnovalidate: true,
            formtarget: true,
            width: true,
            height: true,
            inputmode: true,
            list: true,
            max: true,
            maxlength: true,
            min: true,
            minlength: true,
            multiple: true,
            pattern: true,
            placeholder: true,
            readonly: true,
            required: true,
            size: true,
            src: true,
            step: true,
            value: true
        };
    helper.replaceMain = function (main) {
        main = main || this.control.createMain();
        var initialMain = this.control.main;
        initialMain.setAttribute(ui.getConfig('instanceAttr'), lib.getGUID());
        var attributes = initialMain.attributes;
        for (var i = 0; i < attributes.length; i++) {
            var attribute = attributes[i];
            var name = attribute.name;
            if (lib.hasAttribute(initialMain, name) && !INPUT_SPECIFIED_ATTRIBUTES.hasOwnProperty(name)) {
                lib.setAttribute(main, name, attribute.value);
            }
        }
        lib.insertBefore(main, initialMain);
        initialMain.parentNode.removeChild(initialMain);
        this.control.main = main;
        return initialMain;
    };
    var INPUT_PROPERTY_MAPPING = {
            name: { name: 'name' },
            maxlength: {
                name: 'maxLength',
                type: 'number'
            },
            required: {
                name: 'required',
                type: 'boolean'
            },
            pattern: { name: 'pattern' },
            min: {
                name: 'min',
                type: 'number'
            },
            max: {
                name: 'max',
                type: 'number'
            },
            autofocus: {
                name: 'autoFocus',
                type: 'boolean'
            },
            disabled: {
                name: 'disabled',
                type: 'boolean'
            },
            readonly: {
                name: 'readOnly',
                type: 'boolean'
            }
        };
    helper.extractOptionsFromInput = function (input, options) {
        var result = {};
        u.each(INPUT_PROPERTY_MAPPING, function (config, attributeName) {
            var specified = lib.hasAttribute(input, attributeName);
            if (specified) {
                var value = lib.getAttribute(input, attributeName);
                switch (config.type) {
                case 'boolean':
                    value = specified;
                    break;
                case 'number':
                    value = parseInt(value, 10);
                    break;
                }
                result[config.name] = value;
            }
        });
        if (lib.hasAttribute(input, 'value') || input.nodeName.toLowerCase() !== 'select' && input.value) {
            result.value = input.value;
        }
        return u.defaults(options || {}, result);
    };
    return helper;
});