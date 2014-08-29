define('esui/Panel', [
    'require',
    'underscore',
    './lib',
    './Control',
    './painters',
    './main'
], function (require) {
    var u = require('underscore');
    var lib = require('./lib');
    var Control = require('./Control');
    function Panel() {
        Control.apply(this, arguments);
    }
    Panel.prototype.type = 'Panel';
    Panel.prototype.getCategory = function () {
        return 'container';
    };
    Panel.prototype.createMain = function (options) {
        if (!options.tagName) {
            return Control.prototype.createMain.call(this);
        }
        return document.createElement(options.tagName);
    };
    Panel.prototype.initOptions = function (options) {
        var properties = {};
        u.extend(properties, options);
        properties.tagName = this.main.nodeName.toLowerCase();
        this.setProperties(properties);
    };
    Panel.prototype.repaint = require('./painters').createRepaint(Control.prototype.repaint, {
        name: 'content',
        paint: function (panel, content) {
            if (content != null) {
                panel.helper.disposeChildren();
                panel.main.innerHTML = content;
            }
            panel.helper.initChildren();
        }
    });
    Panel.prototype.setContent = function (html) {
        this.setProperties({ content: html });
    };
    function normalizeStyleName(name) {
        if (name.indexOf('-') >= 0) {
            name = name.replace(/-\w/g, function (word) {
                return word.charAt(1).toUpperCase();
            });
        }
        return name;
    }
    Panel.prototype.getStyle = function (name) {
        name = normalizeStyleName(name);
        return this.main ? this.main.style[name] : '';
    };
    Panel.prototype.setStyle = function (name, value) {
        name = normalizeStyleName(name);
        if (this.main) {
            this.main.style[name] = value || '';
        }
    };
    lib.inherits(Panel, Control);
    require('./main').register(Panel);
    return Panel;
});