define('esui/TextBox', [
    'require',
    'underscore',
    './lib',
    './main',
    './InputControl',
    'mini-event',
    './painters'
], function (require) {
    var u = require('underscore');
    var lib = require('./lib');
    var ui = require('./main');
    var InputControl = require('./InputControl');
    var supportPlaceholder = 'placeholder' in document.createElement('input');
    function TextBox(options) {
        InputControl.apply(this, arguments);
    }
    TextBox.defaultProperties = { width: 200 };
    TextBox.prototype.type = 'TextBox';
    TextBox.prototype.initOptions = function (options) {
        var properties = {
                mode: 'text',
                placeholder: '',
                autoSelect: false
            };
        u.extend(properties, TextBox.defaultProperties);
        if (!properties.name) {
            properties.name = this.main.getAttribute('name');
        }
        if (lib.isInput(this.main)) {
            var nodeName = this.main.nodeName.toLowerCase();
            if (nodeName === 'textarea') {
                properties.mode = 'textarea';
            } else {
                var type = this.main.type;
                properties.mode = type === 'password' ? 'password' : 'text';
            }
            if (!properties.placeholder) {
                properties.placeholder = this.main.getAttribute('placeholder');
            }
            this.helper.extractOptionsFromInput(this.main, properties);
        }
        u.extend(properties, options);
        if (!properties.hasOwnProperty('title') && this.main.title) {
            properties.title = this.main.title;
        }
        this.setProperties(properties);
    };
    TextBox.prototype.getFocusTarget = function () {
        return lib.g(this.inputId);
    };
    function dispatchSpecialKey(e) {
        var keyCode = e.which || e.keyCode;
        if (keyCode === 13) {
            this.fire('enter');
        }
        var args = {
                keyCode: keyCode,
                key: String.fromCharCode(keyCode),
                ctrlKey: e.ctrlKey,
                altKey: e.altKey
            };
        var event = require('mini-event').fromDOMEvent(e, 'keypress', args);
        this.fire('keypress', event);
    }
    function togglePlaceholder(textbox, focused) {
        var input = lib.g(textbox.inputId);
        if (!supportPlaceholder) {
            var placeholder = textbox.helper.getPart('placeholder');
            if (typeof focused !== 'boolean') {
                focused = document.activeElement === input;
            }
            if (!focused && !textbox.getRawValue()) {
                textbox.helper.removePartClasses('placeholder-hidden', placeholder);
            } else {
                textbox.helper.addPartClasses('placeholder-hidden', placeholder);
            }
        }
    }
    function focus(e) {
        togglePlaceholder(this, true);
        if (this.autoSelect) {
            var input = lib.g(this.inputId);
            input.select();
        }
        this.fire('focus');
    }
    function blur(e) {
        togglePlaceholder(this, false);
        this.fire('blur');
    }
    function dispatchInputEvent(e) {
        if (e.type === 'input' || e.propertyName === 'value') {
            this.fire('input');
        }
    }
    TextBox.prototype.initStructure = function () {
        if (lib.isInput(this.main)) {
            var main = this.helper.replaceMain();
            lib.removeAttribute(this.main, 'tabindex');
            this.inputId = main.id || this.helper.getId('input');
            if (this.main.id) {
                this.main.id = this.helper.getId();
            }
            var input = main.cloneNode(false);
            lib.removeAttribute(input, ui.getConfig('instanceAttr'));
            input.id = this.inputId;
            this.main.appendChild(input);
        } else {
            this.inputId = this.helper.getId('input');
            var html = this.mode === 'textarea' ? '<textarea id="' + this.inputId + '"' : '<input type="' + this.mode + '" placeholder="' + this.placeholder + '" id="' + this.inputId + '"';
            if (this.name) {
                html += ' name="' + u.escape(this.name) + '"';
            }
            html += this.mode === 'textarea' ? '></textarea>' : ' />';
            this.main.innerHTML = html;
        }
        if (!supportPlaceholder) {
            var input = lib.g(this.inputId);
            var placeholder = document.createElement('label');
            placeholder.id = this.helper.getId('placeholder');
            lib.setAttribute(placeholder, 'for', input.id);
            this.helper.addPartClasses('placeholder', placeholder);
            lib.insertAfter(placeholder, input);
        }
    };
    TextBox.prototype.initEvents = function () {
        var input = lib.g(this.inputId);
        this.helper.addDOMEvent(input, 'keypress', dispatchSpecialKey);
        this.helper.addDOMEvent(input, 'focus', focus);
        this.helper.addDOMEvent(input, 'blur', blur);
        var inputEventName = 'oninput' in input ? 'input' : 'propertychange';
        this.helper.addDOMEvent(input, inputEventName, dispatchInputEvent);
        this.helper.delegateDOMEvent(input, 'change');
    };
    TextBox.prototype.repaint = require('./painters').createRepaint(InputControl.prototype.repaint, {
        name: 'rawValue',
        paint: function (textbox, rawValue) {
            var input = lib.g(textbox.inputId);
            var eventName = 'oninput' in input ? 'input' : 'propertychange';
            textbox.helper.removeDOMEvent(input, eventName);
            input.value = textbox.stringifyValue(rawValue);
            textbox.helper.addDOMEvent(input, eventName, dispatchInputEvent);
            togglePlaceholder(textbox);
        }
    }, {
        name: 'title',
        paint: function (textbox, title) {
            var input = lib.g(textbox.inputId);
            var placeholder = textbox.helper.getPart('placeholder');
            if (title) {
                lib.setAttribute(textbox.main, 'title', title);
                lib.setAttribute(input, 'title', title);
                if (placeholder) {
                    lib.setAttribute(placeholder, 'title', title);
                }
            } else {
                lib.removeAttribute(textbox.main, 'title');
                lib.removeAttribute(input, 'title');
                if (placeholder) {
                    lib.removeAttribute(placeholder, 'title');
                }
            }
        }
    }, {
        name: 'maxLength',
        paint: function (textbox, maxLength) {
            var input = lib.g(textbox.inputId);
            maxLength = parseInt(maxLength, 10);
            if (!maxLength || maxLength <= 0) {
                try {
                    input.maxLength = undefined;
                    delete input.maxLength;
                } catch (badErrorForIE) {
                }
                lib.removeAttribute(input, 'maxlength');
                lib.removeAttribute(input, 'maxLength');
            } else {
                input.maxLength = maxLength;
                lib.setAttribute(input, 'maxlength', maxLength);
            }
        }
    }, {
        name: [
            'disabled',
            'readOnly'
        ],
        paint: function (textbox, disabled, readOnly) {
            var input = lib.g(textbox.inputId);
            input.disabled = disabled;
            input.readOnly = readOnly;
        }
    }, {
        name: 'placeholder',
        paint: function (textbox, placeholder) {
            var input = lib.g(textbox.inputId);
            if (supportPlaceholder) {
                if (placeholder) {
                    lib.setAttribute(input, 'placeholder', placeholder);
                } else {
                    lib.removeAttribute(input, 'placeholder');
                }
            } else {
                var label = textbox.helper.getPart('placeholder');
                label.innerHTML = u.escape(placeholder || '');
            }
            togglePlaceholder(textbox);
        }
    }, {
        name: [
            'hint',
            'hintType'
        ],
        paint: function (textbox, hint, hintType) {
            var label = textbox.helper.getPart('hint');
            textbox.removeState('hint-prefix');
            textbox.removeState('hint-suffix');
            if (!hint && label) {
                lib.removeNode(label);
            }
            if (hint) {
                if (!label) {
                    label = document.createElement('label');
                    label.id = textbox.helper.getId('hint');
                    textbox.helper.addPartClasses('hint', label);
                    lib.setAttribute(label, 'for', textbox.inputId);
                }
                label.innerHTML = u.escape(hint);
                hintType = hintType === 'prefix' ? 'prefix' : 'suffix';
                var method = hintType === 'prefix' ? 'insertBefore' : 'insertAfter';
                var input = lib.g(textbox.inputId);
                lib[method](label, input);
                textbox.addState('hint-' + hintType);
            }
        }
    }, {
        name: [
            'width',
            'hint',
            'hidden'
        ],
        paint: function (textbox, width, hint, hidden) {
            if (hidden || isNaN(width)) {
                return;
            }
            if (hint) {
                var hintLabel = textbox.helper.getPart('hint');
                if (hintLabel) {
                    width -= hintLabel.offsetWidth;
                }
            }
            var input = lib.g(textbox.inputId);
            input.style.width = width + 'px';
            var placeholder = textbox.helper.getPart('placeholder');
            if (placeholder) {
                placeholder.style.maxWidth = width + 'px';
            }
        }
    }, {
        name: 'height',
        paint: function (textbox, height) {
            if (isNaN(height)) {
                return;
            }
            var hintLabel = textbox.helper.getPart('hint');
            var heightWithUnit = height + 'px';
            if (hintLabel) {
                hintLabel.style.height = heightWithUnit;
                hintLabel.style.lineHeight = heightWithUnit;
            }
            var input = lib.g(textbox.inputId);
            input.style.height = heightWithUnit;
            var placeholder = textbox.helper.getPart('placeholder');
            if (placeholder) {
                placeholder.style.height = heightWithUnit;
                placeholder.style.lineHeight = heightWithUnit;
            }
        }
    });
    TextBox.prototype.getValidityLabel = function () {
        var label = InputControl.prototype.getValidityLabel.apply(this, arguments);
        if (label) {
            label.set('targetType', this.mode === 'textarea' ? 'TextArea' : 'TextBox');
        }
        return label;
    };
    TextBox.prototype.getRawValue = function () {
        var input = lib.g(this.inputId);
        return input ? input.value : this.rawValue || this.value || '';
    };
    TextBox.prototype.getRawValueProperty = TextBox.prototype.getRawValue;
    lib.inherits(TextBox, InputControl);
    ui.register(TextBox);
    return TextBox;
});