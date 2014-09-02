define('esui/main', [
    'require',
    './lib',
    './ViewContext',
    './ControlCollection'
], function (require) {
    var lib = require('./lib');
    var main = {};
    main.version = '3.1.0-beta.3';
    var ViewContext = require('./ViewContext');
    var defaultViewContext = new ViewContext('default');
    main.getViewContext = function () {
        return defaultViewContext;
    };
    var config = {
            uiPrefix: 'data-ui',
            extensionPrefix: 'data-ui-extension',
            customElementPrefix: 'esui',
            instanceAttr: 'data-ctrl-id',
            viewContextAttr: 'data-ctrl-view-context',
            uiClassPrefix: 'ui',
            skinClassPrefix: 'skin',
            stateClassPrefix: 'state'
        };
    main.config = function (info) {
        lib.extend(config, info);
    };
    main.getConfig = function (name) {
        return config[name];
    };
    main.parseAttribute = function (source, valueReplacer) {
        if (!source) {
            return {};
        }
        var result = {};
        var lastStop = 0;
        var cursor = 0;
        while (cursor < source.length) {
            while (cursor < source.length && source.charAt(cursor) !== ':') {
                cursor++;
            }
            if (cursor >= source.length) {
                break;
            }
            var key = lib.trim(source.slice(lastStop, cursor));
            cursor++;
            lastStop = cursor;
            while (cursor < source.length && source.charAt(cursor) !== ';') {
                cursor++;
            }
            var lookAheadIndex = cursor + 1;
            while (lookAheadIndex < source.length) {
                var ch = source.charAt(lookAheadIndex);
                if (ch === ';') {
                    cursor = lookAheadIndex;
                }
                if (ch === ':') {
                    break;
                }
                lookAheadIndex++;
            }
            var value = lib.trim(source.slice(lastStop, cursor));
            result[key] = valueReplacer ? valueReplacer(value) : value;
            cursor++;
            lastStop = cursor;
        }
        return result;
    };
    main.getControlByDOM = function (dom) {
        if (!dom) {
            return null;
        }
        var getConf = main.getConfig;
        var controlId = dom.getAttribute(getConf('instanceAttr'));
        var viewContextId = dom.getAttribute(getConf('viewContextAttr'));
        var viewContext;
        if (controlId && viewContextId && (viewContext = ViewContext.get(viewContextId))) {
            return viewContext.get(controlId);
        }
        return null;
    };
    function registerClass(classFunc, container) {
        if (typeof classFunc == 'function') {
            var type = classFunc.prototype.type;
            if (type in container) {
                throw new Error(type + ' is exists!');
            }
            container[type] = classFunc;
        }
    }
    function createInstance(type, options, container) {
        var Constructor = container[type];
        if (Constructor) {
            delete options.type;
            return new Constructor(options);
        }
        return null;
    }
    var controlClasses = {};
    main.register = function (controlClass) {
        registerClass(controlClass, controlClasses);
    };
    main.create = function (type, options) {
        return createInstance(type, options, controlClasses);
    };
    main.get = function (id) {
        return defaultViewContext.get(id);
    };
    main.getSafely = function (id) {
        return defaultViewContext.getSafely(id);
    };
    var ControlCollection = require('./ControlCollection');
    main.wrap = function () {
        var collection = new ControlCollection();
        for (var i = 0; i < arguments.length; i++) {
            collection.add(arguments[i]);
        }
        return collection;
    };
    main.init = function (wrap, options) {
        wrap = wrap || document.body;
        options = options || {};
        var valueReplacer = options.valueReplacer || function (value) {
                return value;
            };
        function joinCamelCase(source) {
            function replacer(c) {
                return c.toUpperCase();
            }
            for (var i = 1, len = source.length; i < len; i++) {
                source[i] = source[i].replace(/^[a-z]/, replacer);
            }
            return source.join('');
        }
        function noOverrideExtend(target, source) {
            for (var key in source) {
                if (!(key in target)) {
                    target[key] = source[key];
                }
            }
        }
        function extendToOption(optionObject, terms, value) {
            if (terms.length === 0) {
                noOverrideExtend(optionObject, main.parseAttribute(value, valueReplacer));
            } else {
                optionObject[joinCamelCase(terms)] = valueReplacer(value);
            }
        }
        var rawElements = wrap.getElementsByTagName('*');
        var elements = [];
        for (var i = 0, len = rawElements.length; i < len; i++) {
            if (rawElements[i].nodeType === 1) {
                elements.push(rawElements[i]);
            }
        }
        var uiPrefix = main.getConfig('uiPrefix');
        var extPrefix = main.getConfig('extensionPrefix');
        var customElementPrefix = main.getConfig('customElementPrefix');
        var uiPrefixLen = uiPrefix.length;
        var extPrefixLen = extPrefix.length;
        var properties = options.properties || {};
        var controls = [];
        for (var i = 0, len = elements.length; i < len; i++) {
            var element = elements[i];
            if (element.getAttribute(config.instanceAttr)) {
                continue;
            }
            var attributes = element.attributes;
            var controlOptions = {};
            var extensionOptions = {};
            for (var j = 0, attrLen = attributes.length; j < attrLen; j++) {
                var attribute = attributes[j];
                var name = attribute.name;
                var value = attribute.value;
                if (name.indexOf(extPrefix) === 0) {
                    var terms = name.slice(extPrefixLen + 1).split('-');
                    var extKey = terms[0];
                    terms.shift();
                    var extOption = extensionOptions[extKey];
                    if (!extOption) {
                        extOption = extensionOptions[extKey] = {};
                    }
                    extendToOption(extOption, terms, value);
                } else if (name.indexOf(uiPrefix) === 0) {
                    var terms = name.length == uiPrefixLen ? [] : name.slice(uiPrefixLen + 1).split('-');
                    extendToOption(controlOptions, terms, value);
                }
            }
            var type = controlOptions.type;
            if (!type) {
                var nodeName = element.nodeName.toLowerCase();
                var esuiPrefixIndex = nodeName.indexOf(customElementPrefix);
                if (esuiPrefixIndex === 0) {
                    var typeFromCustomElement = nodeName.replace(/-(\S)/g, function (match, ch) {
                            return ch.toUpperCase();
                        });
                    typeFromCustomElement = typeFromCustomElement.slice(customElementPrefix.length);
                    controlOptions.type = typeFromCustomElement;
                    type = typeFromCustomElement;
                }
            }
            if (type) {
                var controlId = controlOptions.id;
                var customOptions = controlId ? properties[controlId] : {};
                for (var key in customOptions) {
                    controlOptions[key] = valueReplacer(customOptions[key]);
                }
                var extensions = controlOptions.extensions || [];
                controlOptions.extensions = extensions;
                for (var key in extensionOptions) {
                    var extOption = extensionOptions[key];
                    var extension = main.createExtension(extOption.type, extOption);
                    extension && extensions.push(extension);
                }
                controlOptions.viewContext = options.viewContext;
                controlOptions.renderOptions = options;
                controlOptions.main = element;
                var control = main.create(type, controlOptions);
                if (control) {
                    controls.push(control);
                    if (options.parent) {
                        options.parent.addChild(control);
                    }
                    try {
                        control.render();
                    } catch (ex) {
                        var error = new Error('Render control ' + '"' + (control.id || 'anonymous') + '" ' + 'of type ' + control.type + ' ' + 'failed because: ' + ex.message);
                        error.actualError = ex;
                        throw error;
                    }
                }
            }
        }
        return controls;
    };
    var extensionClasses = {};
    main.registerExtension = function (extensionClass) {
        registerClass(extensionClass, extensionClasses);
    };
    main.createExtension = function (type, options) {
        return createInstance(type, options, extensionClasses);
    };
    var globalExtensionOptions = {};
    main.attachExtension = function (type, options) {
        globalExtensionOptions[type] = options;
    };
    main.createGlobalExtensions = function () {
        var options = globalExtensionOptions;
        var extensions = [];
        for (var i = 0, len = options.length; i < len; i++) {
            var option = options[i];
            var type = option.type;
            var extension;
            if (type) {
                extension = main.create(type, option);
            }
            extension && extensions.push(extension);
        }
        return extensions;
    };
    var ruleClasses = [];
    main.registerRule = function (ruleClass, priority) {
        ruleClasses.push({
            type: ruleClass,
            priority: priority
        });
        ruleClasses.sort(function (x, y) {
            return x.priority - y.priority;
        });
    };
    main.createRulesByControl = function (control) {
        var rules = [];
        for (var i = 0; i < ruleClasses.length; i++) {
            var RuleClass = ruleClasses[i].type;
            if (control.get(RuleClass.prototype.type) != null) {
                rules.push(new RuleClass());
            }
        }
        return rules;
    };
    return main;
});

define('esui', ['esui/main'], function ( main ) { return main; });