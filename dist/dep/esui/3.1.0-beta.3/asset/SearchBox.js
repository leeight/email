define('esui/SearchBox', [
    'require',
    './lib',
    'esui',
    './Control',
    './TextBox',
    './Button',
    'mini-event',
    './painters'
], function (require) {
    var lib = require('./lib');
    var ui = require('esui');
    var Control = require('./Control');
    require('./TextBox');
    require('./Button');
    function SearchBox(options) {
        Control.apply(this, arguments);
    }
    SearchBox.prototype.type = 'SearchBox';
    SearchBox.prototype.initOptions = function (options) {
        var properties = {};
        lib.extend(properties, options);
        if (properties.disabled === 'false') {
            properties.disabled = false;
        }
        if (lib.isInput(this.main)) {
            if (!properties.placeholder) {
                properties.placeholder = lib.getAttribute(this.main, 'placeholder');
            }
            if (!properties.text) {
                properties.text = this.main.value;
            }
            if (!properties.maxLength && (lib.hasAttribute(this.main, 'maxlength') || this.main.maxLength > 0)) {
                properties.maxLength = this.main.maxLength;
            }
        } else {
            if (!properties.text) {
                properties.text = lib.getText(this.main);
            }
        }
        if (!properties.title) {
            properties.title = this.main.title;
        }
        Control.prototype.initOptions.call(this, properties);
    };
    SearchBox.prototype.initStructure = function () {
        var textboxOptions = {
                mode: 'text',
                childName: 'text',
                height: this.height,
                viewContext: this.viewContext,
                placeholder: this.placeholder
            };
        if (lib.isInput(this.main)) {
            this.helper.replaceMain();
        }
        var textbox = ui.create('TextBox', textboxOptions);
        textbox.appendTo(this.main);
        this.addChild(textbox);
        var buttonOptions = {
                main: document.createElement('span'),
                childName: 'button',
                content: '\u641C\u7D22',
                viewContext: this.viewContext
            };
        var button = ui.create('Button', buttonOptions);
        button.appendTo(this.main);
        this.addChild(button);
    };
    SearchBox.prototype.initEvents = function () {
        var textbox = this.getChild('text');
        var delegate = require('mini-event').delegate;
        delegate(textbox, this, 'input');
        delegate(textbox, 'enter', this, 'search');
        textbox.on('keypress', function (e) {
            if (e.keyCode === 13) {
                e.preventDefault();
            }
        });
        textbox.on('focus', lib.bind(this.addState, this, 'focus'));
        textbox.on('blur', lib.bind(this.removeState, this, 'focus'));
        var button = this.getChild('button');
        delegate(button, 'click', this, 'search');
    };
    SearchBox.prototype.getValue = function () {
        var text = this.getChild('text');
        return text.getValue();
    };
    var paint = require('./painters');
    SearchBox.prototype.repaint = paint.createRepaint(Control.prototype.repaint, paint.attribute('title'), {
        name: [
            'maxLength',
            'placeholder',
            'text',
            'width',
            'disabled',
            'readOnly'
        ],
        paint: function (box, maxLength, placeholder, text, width, disabled, readOnly) {
            var properties = {
                    maxLength: maxLength,
                    placeholder: placeholder,
                    value: text,
                    width: width,
                    disabled: disabled,
                    readOnly: readOnly
                };
            box.getChild('text').setProperties(properties);
        }
    }, {
        name: 'disabled',
        paint: function (box, disabled) {
            if (disabled === 'false') {
                disabled = false;
            }
            var button = box.getChild('button');
            button.set('disabled', disabled);
        }
    }, {
        name: 'fitWidth',
        paint: function (box, fitWidth) {
            var method = fitWidth ? 'addState' : 'removeState';
            box[method]('fit-width');
        }
    });
    SearchBox.prototype.getTextProperty = function () {
        var textbox = this.getChild('text');
        return textbox ? textbox.getValue() : this.text;
    };
    lib.inherits(SearchBox, Control);
    ui.register(SearchBox);
    return SearchBox;
});