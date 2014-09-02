define('esui/InputControl', [
    'require',
    './lib',
    './controlHelper',
    './Control',
    './Validity',
    './validator/Validity',
    './main'
], function (require) {
    var lib = require('./lib');
    var helper = require('./controlHelper');
    var Control = require('./Control');
    var ValidityLabel = require('./Validity');
    var Validity = require('./validator/Validity');
    var main = require('./main');
    function InputControl(options) {
        options = options ? lib.extend({}, options) : {};
        if (options.main && !options.name) {
            options.name = options.main.getAttribute('name');
        }
        Control.call(this, options);
    }
    InputControl.prototype = {
        constructor: InputControl,
        ignoreStates: Control.prototype.ignoreStates.concat('read-only'),
        getCategory: function () {
            return 'input';
        },
        getFocusTarget: function () {
            return null;
        },
        getValue: function () {
            return this.stringifyValue(this.getRawValue());
        },
        setValue: function (value) {
            var rawValue = this.parseValue(value);
            this.setRawValue(rawValue);
        },
        getRawValue: function () {
            return this.rawValue;
        },
        setRawValue: function (rawValue) {
            this.setProperties({ rawValue: rawValue });
        },
        setProperties: function (properties) {
            var value = properties.value;
            delete properties.value;
            if (value != null && properties.rawValue == null) {
                properties.rawValue = this.parseValue(value);
            }
            if (this.hasOwnProperty('readOnly')) {
                this.readOnly = !!this.readOnly;
            }
            return Control.prototype.setProperties.call(this, properties);
        },
        repaint: helper.createRepaint(Control.prototype.repaint, {
            name: 'disabled',
            paint: function (control, value) {
                var nodeName = control.main.nodeName.toLowerCase();
                if (nodeName === 'input' || nodeName === 'select' || nodeName === 'textarea') {
                    control.main.disabled = value;
                }
            }
        }, {
            name: 'readOnly',
            paint: function (control, value) {
                var method = value ? 'addState' : 'removeState';
                control[method]('read-only');
                var nodeName = control.main.nodeName.toLowerCase();
                if (nodeName === 'input' || nodeName === 'select' || nodeName === 'textarea') {
                    control.main.readOnly = value;
                }
            }
        }, {
            name: 'hidden',
            paint: function (control, hidden) {
                var validityLabel = control.getValidityLabel(true);
                if (validityLabel) {
                    var classPrefix = main.getConfig('uiClassPrefix');
                    var classes = [].concat(classPrefix + '-hidden', classPrefix + '-validity-hidden', helper.getPartClasses(control, 'validity-hidden'));
                    var method = control.isHidden() ? 'addClasses' : 'removeClasses';
                    lib[method](validityLabel, classes);
                }
            }
        }),
        stringifyValue: function (rawValue) {
            return rawValue != null ? rawValue + '' : '';
        },
        parseValue: function (value) {
            return value;
        },
        setReadOnly: function (readOnly) {
            readOnly = !!readOnly;
            this[readOnly ? 'addState' : 'removeState']('read-only');
        },
        isReadOnly: function () {
            return this.hasState('read-only');
        },
        getValidationResult: function () {
            var validity = new Validity();
            var eventArg = { validity: validity };
            eventArg = this.fire('beforevalidate', eventArg);
            var rules = main.createRulesByControl(this);
            for (var i = 0, len = rules.length; i < len; i++) {
                var rule = rules[i];
                validity.addState(rule.getName(), rule.check(this.getValue(), this));
            }
            if (!validity.isValid()) {
                eventArg = this.fire('invalid', eventArg);
            }
            this.fire('aftervalidate', eventArg);
            return validity;
        },
        checkValidity: function () {
            var validity = this.getValidationResult();
            return validity.isValid();
        },
        validate: function () {
            var validity = this.getValidationResult();
            this.showValidity(validity);
            return validity.isValid();
        },
        getValidityLabel: function (dontCreate) {
            if (!helper.isInStage(this, 'RENDERED')) {
                return null;
            }
            var label = this.validityLabel && this.viewContext.get(this.validityLabel);
            if (!label && !dontCreate) {
                var options = {
                        id: this.id + '-validity',
                        viewContext: this.viewContext
                    };
                label = new ValidityLabel(options);
                if (this.main.nextSibling) {
                    label.insertBefore(this.main.nextSibling);
                } else {
                    label.appendTo(this.main.parentNode);
                }
                this.validityLabel = label.id;
            }
            return label;
        },
        showValidity: function (validity) {
            if (this.validity) {
                this.removeState('validity-' + this.validity.getValidState());
            }
            this.validity = validity;
            this.addState('validity-' + validity.getValidState());
            var label = this.getValidityLabel();
            if (!label) {
                return;
            }
            var properties = {
                    target: this,
                    focusTarget: this.getFocusTarget(),
                    validity: validity
                };
            label.setProperties(properties);
        },
        showValidationMessage: function (validState, message) {
            message = message || '';
            var validity = new Validity();
            validity.setCustomValidState(validState);
            validity.setCustomMessage(message);
            this.showValidity(validity);
        },
        dispose: function () {
            if (helper.isInStage(this, 'DISPOSED')) {
                return;
            }
            var validityLabel = this.getValidityLabel(true);
            if (validityLabel) {
                validityLabel.dispose();
            }
            Control.prototype.dispose.apply(this, arguments);
        }
    };
    lib.inherits(InputControl, Control);
    return InputControl;
});