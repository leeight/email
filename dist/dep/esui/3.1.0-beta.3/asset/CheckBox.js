define('esui/CheckBox', [
    'require',
    'underscore',
    './lib',
    './InputControl',
    './painters',
    './main'
], function (require) {
    var u = require('underscore');
    var lib = require('./lib');
    var InputControl = require('./InputControl');
    function syncChecked(e) {
        var checked = lib.g(this.boxId).checked;
        this.setProperties({ checked: checked });
    }
    function CheckBox() {
        InputControl.apply(this, arguments);
    }
    CheckBox.prototype = {
        type: 'CheckBox',
        createMain: function () {
            return document.createElement('label');
        },
        getCategory: function () {
            return 'check';
        },
        initOptions: function (options) {
            var properties = {
                    value: this.main.value || 'on',
                    checked: this.main.checked || false
                };
            u.extend(properties, options);
            properties.name = properties.name || this.main.getAttribute('name');
            var datasource = properties.datasource;
            delete properties.datasource;
            this.setProperties(properties);
            if (datasource != null) {
                if (u.isArray(datasource)) {
                    this.checked = u.any(datasource, function (item) {
                        return item.value == this.value;
                    }, this);
                } else if (this.rawValue == datasource) {
                    this.checked = true;
                }
            }
            if (!this.title) {
                this.title = this.main.title || (this.getValue() === 'on' ? '' : this.getValue());
            }
        },
        initStructure: function () {
            if (this.main.nodeName.toLowerCase() === 'input') {
                this.boxId = this.main.id || this.helper.getId('box');
                this.helper.replaceMain();
                this.main.id = this.helper.getId();
            } else {
                this.boxId = this.helper.getId('box');
            }
            var html = '<input type="checkbox" name="${name}" id="${id}" />' + '<span id="${textId}"></span>';
            this.main.innerHTML = lib.format(html, {
                name: this.name,
                id: this.boxId,
                textId: this.helper.getId('text')
            });
        },
        initEvents: function () {
            var box = lib.g(this.boxId);
            this.helper.addDOMEvent(box, 'click', function (e) {
                this.fire('click');
                if (!box.addEventListener) {
                    syncChecked.call(this, e);
                }
            });
            if (box.addEventListener) {
                this.helper.addDOMEvent(box, 'change', syncChecked);
            }
        },
        setProperties: function (properties) {
            var changes = InputControl.prototype.setProperties.apply(this, arguments);
            if (changes.hasOwnProperty('checked')) {
                this.fire('change');
            }
        },
        getFocusTarget: function () {
            var box = lib.g(this.boxId);
            return box;
        },
        updateTitle: function (title) {
            this.title = title;
            title = u.escape(title);
            this.helper.getPart('text').innerHTML = title;
            lib.setAttribute(this.boxId, 'title', title);
        },
        repaint: require('./painters').createRepaint(InputControl.prototype.repaint, {
            name: [
                'rawValue',
                'checked'
            ],
            paint: function (box, rawValue, checked) {
                var value = box.stringifyValue(rawValue);
                var box = lib.g(box.boxId);
                box.value = value;
                box.checked = checked;
            }
        }, {
            name: [
                'disabled',
                'readOnly'
            ],
            paint: function (box, disabled, readOnly) {
                var box = lib.g(box.boxId);
                box.disabled = disabled;
                box.readOnly = readOnly;
            }
        }, {
            name: 'title',
            paint: function (box, title) {
                box.updateTitle(title);
            }
        }),
        setChecked: function (checked) {
            this.setProperties({ checked: checked });
        },
        isChecked: function () {
            if (this.helper.isInStage('RENDERED')) {
                var box = lib.g(this.boxId);
                return box.checked;
            } else {
                return this.checked;
            }
        }
    };
    lib.inherits(CheckBox, InputControl);
    require('./main').register(CheckBox);
    return CheckBox;
});