define('bat-ria/ui/ToggleButton', [
    'require',
    'esui/lib',
    'esui/InputControl',
    'esui/painters',
    'esui'
], function (require) {
    var lib = require('esui/lib');
    var InputControl = require('esui/InputControl');
    function ToggleButton(options) {
        InputControl.apply(this, arguments);
    }
    ToggleButton.prototype.type = 'ToggleButton';
    ToggleButton.prototype.createMain = function () {
        return document.createElement('div');
    };
    ToggleButton.prototype.initOptions = function (options) {
        var properties = {
                onText: 'ON',
                offText: 'OFF',
                checked: false
            };
        lib.extend(properties, options);
        if (!properties.title) {
            properties.title = this.main.title;
        }
        if (lib.isInput(this.main)) {
            if (!properties.name) {
                properties.name = this.main.name;
            }
            if (!properties.value) {
                properties.value = this.main.value;
            }
            if (!options.hasOwnProperty('checked')) {
                properties.checked = this.main.checked;
            }
        } else {
            var children = lib.getChildren(this.main);
            if (children.length > 1) {
                if (!options.onText) {
                    properties.onText = lib.getText(children[0]);
                }
                if (!options.offText) {
                    properties.offText = lib.getText(children[1]);
                }
            }
        }
        InputControl.prototype.initOptions.call(this, properties);
    };
    function getPartHTML(button, part) {
        var id = button.helper.getId(part);
        var classes = button.helper.getPartClassName('part-' + part);
        var html = '<span id="' + id + '" class="' + classes + '"></span>';
        return html;
    }
    ToggleButton.prototype.initStructure = function () {
        this.main.innerHTML = getPartHTML(this, 'on') + getPartHTML(this, 'off') + '<input type="hidden"' + (this.name ? ' name="' + this.name + '"' : '') + ' />';
        this.helper.addDOMEvent(this.main, 'click', lib.bind(this.toggle, this));
    };
    var paint = require('esui/painters');
    ToggleButton.prototype.repaint = require('esui/painters').createRepaint(InputControl.prototype.repaint, paint.text('onText', 'on'), paint.text('offText', 'off'), paint.attribute('title'), paint.style('width'), paint.style('height'), {
        name: 'rawValue',
        paint: function (button, value) {
            var input = button.main.getElementsByTagName('input')[0];
            input.value = value;
        }
    }, {
        name: 'checked',
        paint: function (button, checked) {
            var method = checked ? 'addState' : 'removeState';
            button[method]('checked');
        }
    });
    ToggleButton.prototype.setProperties = function () {
        if (this.hasOwnProperty('checked')) {
            this.checked = !!this.checked;
        }
        var changed = InputControl.prototype.setProperties.apply(this, arguments);
        if (changed.hasOwnProperty('checked')) {
            this.fire('change');
        }
    };
    ToggleButton.prototype.isChecked = function () {
        return this.checked;
    };
    ToggleButton.prototype.toggle = function () {
        this.set('checked', !this.checked);
    };
    lib.inherits(ToggleButton, InputControl);
    require('esui').register(ToggleButton);
    return ToggleButton;
});