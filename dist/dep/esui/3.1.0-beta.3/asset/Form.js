define('esui/Form', [
    'require',
    'underscore',
    './lib',
    './main',
    './Panel'
], function (require) {
    var u = require('underscore');
    var lib = require('./lib');
    var ui = require('./main');
    var Panel = require('./Panel');
    function InputCollection(inputs) {
        this.length = inputs.length;
        for (var i = 0; i < inputs.length; i++) {
            this[i] = inputs[i];
        }
    }
    InputCollection.prototype.splice = Array.prototype.splice;
    function getData(inputs, fetchValue) {
        var store = {};
        for (var i = 0; i < inputs.length; i++) {
            var control = inputs[i];
            if (control.getCategory() === 'check' && !control.isChecked()) {
                continue;
            }
            if (control.isDisabled()) {
                continue;
            }
            var name = control.get('name');
            var value = fetchValue(control);
            if (store.hasOwnProperty(name)) {
                store[name] = [].concat(store[name], value);
            } else {
                store[name] = value;
            }
        }
        return store;
    }
    InputCollection.prototype.getData = function () {
        return getData(this, function (control) {
            return control.getRawValue();
        });
    };
    InputCollection.prototype.getDataAsString = function () {
        var store = getData(this, function (control) {
                var value = control.getValue();
                return encodeURIComponent(value);
            });
        var valueString = '';
        u.each(store, function (value, key) {
            valueString += encodeURIComponent(key) + '=' + value;
        });
        return valueString;
    };
    InputCollection.prototype.getValueAsString = function (name) {
        var data = this.getData();
        var values = data[name];
        var valueString = values ? typeof values === 'string' ? values : values.join(',') : '';
        return valueString;
    };
    InputCollection.prototype.checkAll = function () {
        for (var i = 0; i < this.length; i++) {
            var control = this[i];
            if (control.getCategory() === 'check') {
                control.setChecked(true);
            }
        }
    };
    InputCollection.prototype.uncheckAll = function () {
        for (var i = 0; i < this.length; i++) {
            var control = this[i];
            if (control.getCategory() === 'check') {
                control.setChecked(false);
            }
        }
    };
    InputCollection.prototype.checkInverse = function () {
        for (var i = 0; i < this.length; i++) {
            var control = this[i];
            if (control.getCategory() === 'check') {
                control.setChecked(!control.isChecked());
            }
        }
    };
    InputCollection.prototype.checkByValue = function (values) {
        var map = lib.toDictionary(values);
        for (var i = 0; i < this.length; i++) {
            var control = this[i];
            if (control.getCategory() === 'check') {
                var shouldBeChecked = map.hasOwnProperty(control.getValue());
                control.setChecked(shouldBeChecked);
            }
        }
    };
    function Form(options) {
        Panel.apply(this, arguments);
    }
    Form.defaultProperties = { autoValidate: false };
    Form.prototype.type = 'Form';
    Form.prototype.validateAndSubmit = function () {
        var event = this.fire('beforevalidate');
        if (event.isDefaultPrevented()) {
            return;
        }
        try {
            var isValid = this.get('autoValidate') ? this.validate() : true;
            var event = this.fire('aftervalidate', { isValid: isValid });
            if (event.isDefaultPrevented()) {
                return;
            }
            var data = { triggerSource: this };
            if (isValid) {
                this.fire('submit', data);
            } else {
                this.fire('invalid', data);
            }
        } catch (ex) {
            this.fire('submitfail', { error: ex });
        }
    };
    Form.prototype.initEvents = function () {
        if (this.main.nodeName.toLowerCase() === 'form') {
            this.helper.addDOMEvent(this.main, 'submit', function (e) {
                this.validateAndSubmit();
                e.preventDefault();
                return false;
            });
        }
    };
    Form.prototype.createMain = function (options) {
        var form = document.createElement('form');
        form.method = 'POST';
        form.action = options.action || '';
        return form;
    };
    Form.prototype.initOptions = function (options) {
        var properties = u.extend({}, Form.defaultProperties, options);
        if (this.main.nodeName.toLowerCase() === 'form') {
            properties.action = this.main.getAttribute('action');
            properties.method = this.main.getAttribute('method');
        } else {
            properties.method = this.method || 'POST';
        }
        if (options.autoValidate === 'false') {
            properties.autoValidate = false;
        } else {
            properties.autoValidate = !!properties.autoValidate;
        }
        Panel.prototype.initOptions.call(this, properties);
    };
    function isInputControl(control) {
        var category = control.getCategory();
        return category === 'input' || category === 'check';
    }
    Form.prototype.getInputControls = function (name, type) {
        var result = [];
        function walk(form, root) {
            var children = root.children;
            var length = children.length;
            for (var i = 0; i < length; i++) {
                var element = children[i];
                if (element.nodeType !== 1) {
                    continue;
                }
                var control = ui.getControlByDOM(element);
                if (control && isInputControl(control) && control.viewContext === form.viewContext && control.get('name') && (!name || control.get('name') === name) && (!type || control.get('type') === type)) {
                    result.push(control);
                } else {
                    walk(form, element);
                }
            }
        }
        walk(this, this.main);
        return new InputCollection(result);
    };
    Form.prototype.getData = function () {
        var inputs = this.getInputControls();
        return inputs.getData();
    };
    Form.prototype.getDataAsString = function () {
        var inputs = this.getInputControls();
        return inputs.getDataAsString();
    };
    Form.prototype.validate = function () {
        var inputs = this.getInputControls();
        var result = true;
        for (var i = 0; i < inputs.length; i++) {
            var control = inputs[i];
            if (control.isDisabled()) {
                continue;
            }
            result &= control.validate();
        }
        return !!result;
    };
    Form.prototype.repaint = function (changes, changesIndex) {
        Panel.prototype.repaint.apply(this, arguments);
        var shouldAttachSubmit = false;
        if (!changesIndex && this.submitButton) {
            shouldAttachSubmit = true;
        }
        if (changesIndex && changesIndex.hasOwnProperty('submitButton')) {
            var record = changesIndex.submitButton;
            if (record.oldValue) {
                for (var i = 0; i < record.oldValue.length; i++) {
                    var oldButton = this.viewContext.get(record.oldValue[i]);
                    if (oldButton) {
                        oldButton.un('click', this.validateAndSubmit, this);
                    }
                }
                shouldAttachSubmit = !!this.submitButton;
            }
        }
        if (shouldAttachSubmit) {
            for (var i = 0; i < this.submitButton.length; i++) {
                var button = this.viewContext.get(this.submitButton[i]);
                if (button) {
                    button.on('click', this.validateAndSubmit, this);
                }
            }
        }
    };
    Form.prototype.setProperties = function (properties) {
        properties = u.clone(properties);
        properties.submitButton = lib.splitTokenList(properties.submitButton);
        Panel.prototype.setProperties.call(this, properties);
    };
    lib.inherits(Form, Panel);
    ui.register(Form);
    return Form;
});