define('esui/Button', [
    'require',
    'underscore',
    './lib',
    './painters',
    './Control',
    './main'
], function (require) {
    var u = require('underscore');
    var lib = require('./lib');
    var paint = require('./painters');
    var Control = require('./Control');
    function Button(options) {
        Control.apply(this, arguments);
    }
    function getBorderInfo(dom) {
        var result = {};
        result.borderTop = parseInt(lib.getComputedStyle(dom, 'borderTopWidth'), 10);
        result.borderBottom = parseInt(lib.getComputedStyle(dom, 'borderBottomWidth'), 10);
        return result;
    }
    Button.prototype = {
        type: 'Button',
        initOptions: function (options) {
            var properties = {
                    content: '',
                    disabled: false
                };
            u.extend(properties, options);
            properties.tagName = this.main.nodeName.toLowerCase();
            if (properties.text == null) {
                properties.text = lib.getText(this.main);
            }
            var innerDiv = this.main.firstChild;
            if (!properties.content && innerDiv && innerDiv.nodeName.toLowerCase() !== 'div') {
                properties.content = this.main.innerHTML;
            }
            this.setProperties(properties);
        },
        createMain: function () {
            var div = document.createElement('div');
            div.innerHTML = '<button type="button"></button>';
            return div.firstChild;
        },
        initEvents: function () {
            this.helper.delegateDOMEvent(this.main, 'click');
        },
        repaint: paint.createRepaint(Control.prototype.repaint, paint.style('width'), {
            name: 'height',
            paint: function (button, value) {
                if (!value) {
                    return;
                }
                var main = button.main;
                main.style.height = value + 'px';
                var lineHeight = value;
                main.style.lineHeight = lineHeight + 'px';
                var offsetHeight = main.offsetHeight;
                if (offsetHeight === value) {
                    var borderInfo = getBorderInfo(main);
                    var height = value + borderInfo.borderTop + borderInfo.borderBottom;
                    main.style.height = height + 'px';
                }
            }
        }, paint.html('content'), {
            name: 'disabled',
            paint: function (button, disabled) {
                var nodeName = button.main.nodeName.toLowerCase();
                if (nodeName === 'button' || nodeName === 'input') {
                    button.main.disabled = !!disabled;
                }
            }
        }),
        setContent: function (content) {
            this.setProperties({ 'content': content });
        }
    };
    lib.inherits(Button, Control);
    require('./main').register(Button);
    return Button;
});