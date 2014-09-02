define('esui/Link', [
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
    var paint = require('./painters');
    function Link() {
        Control.apply(this, arguments);
    }
    Link.prototype = {
        constructor: Link,
        type: 'Link',
        getCategory: function () {
            return 'container';
        },
        createMain: function () {
            return document.createElement('a');
        },
        initOptions: function (options) {
            var properties = {};
            u.extend(properties, options);
            if (options.href == null) {
                properties.href = this.main.href;
            }
            if (options.target == null) {
                properties.target = this.main.target;
            }
            if (options.content == null) {
                properties.content = this.main.innerHTML;
            }
            u.extend(this, properties);
        },
        initEvents: function () {
            this.helper.delegateDOMEvent(this.main, 'click');
        },
        render: function () {
            if (this.main && this.main.nodeName.toLowerCase() === 'a') {
                Control.prototype.render.apply(this, arguments);
            }
        },
        repaint: paint.createRepaint(Control.prototype.repaint, paint.attribute('href'), paint.attribute('target'), {
            name: 'content',
            paint: function (link, content) {
                link.helper.disposeChildren();
                link.main.innerHTML = content;
                link.helper.initChildren();
            }
        })
    };
    lib.inherits(Link, Control);
    require('./main').register(Link);
    return Link;
});