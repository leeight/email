define('esui/Label', [
    'require',
    'underscore',
    './lib',
    './Control',
    './main'
], function (require) {
    var u = require('underscore');
    var lib = require('./lib');
    var Control = require('./Control');
    function Label(options) {
        Control.apply(this, arguments);
    }
    Label.prototype.type = 'Label';
    Label.prototype.createMain = function (options) {
        if (!options.tagName) {
            return Control.prototype.createMain.call(this);
        }
        return document.createElement(options.tagName);
    };
    Label.prototype.initOptions = function (options) {
        var properties = {};
        u.extend(properties, options);
        properties.tagName = this.main.nodeName.toLowerCase();
        if (options.text == null) {
            properties.text = lib.trim(lib.getText(this.main));
        }
        u.extend(this, properties);
    };
    Label.prototype.initEvents = function () {
        this.helper.delegateDOMEvent(this.main, 'click');
    };
    var allProperties = [
            { name: 'title' },
            { name: 'text' }
        ];
    Label.prototype.repaint = function (changes) {
        Control.prototype.repaint.apply(this, arguments);
        changes = changes || allProperties;
        var shouldRepaint = false;
        for (var i = 0; i < changes.length; i++) {
            var record = changes[i];
            if (record.name === 'title') {
                this.main.title = u.escape(this.title);
            } else {
                shouldRepaint = true;
            }
        }
        if (shouldRepaint) {
            this.main.innerHTML = u.escape(this.text);
        }
    };
    Label.prototype.setText = function (text) {
        this.setProperties({ text: text });
    };
    Label.prototype.getText = function () {
        return this.text;
    };
    Label.prototype.setTitle = function (title) {
        this.setProperties({ title: title });
    };
    Label.prototype.getTitle = function () {
        return this.title;
    };
    lib.inherits(Label, Control);
    require('./main').register(Label);
    return Label;
});