define('esui/Crumb', [
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
    function Crumb() {
        Control.apply(this, arguments);
    }
    Crumb.defaultProperties = { separator: '>' };
    Crumb.prototype.type = 'Crumb';
    Crumb.prototype.initOptions = function (options) {
        var properties = { path: [] };
        u.extend(properties, Crumb.defaultProperties, options);
        var children = lib.getChildren(this.main);
        if (!options.path && children.length) {
            properties.path = u.map(children, function (element) {
                var node = { text: lib.getText(element) };
                if (element.nodeName.toLowerCase() === 'a') {
                    node.href = lib.getAttribute(element, 'href');
                }
                return node;
            });
        }
        this.setProperties(properties);
    };
    Crumb.prototype.textNodeTemplate = '<span class="${classes}">${text}</span>';
    Crumb.prototype.linkNodeTemplate = '<a class="${classes}" href="${href}">${text}</a>';
    Crumb.prototype.separatorTemplate = '<span class="${classes}">${text}</span>';
    Crumb.prototype.getNodeHTML = function (node, index) {
        var classes = this.helper.getPartClasses('node');
        if (index === 0) {
            classes.push.apply(classes, this.helper.getPartClasses('node-first'));
        }
        if (index === this.path.length - 1) {
            classes.push.apply(classes, this.helper.getPartClasses('node-last'));
        }
        var template = node.href ? this.linkNodeTemplate : this.textNodeTemplate;
        var data = {
                href: u.escape(node.href),
                text: u.escape(node.text),
                classes: classes.join(' ')
            };
        return lib.format(template, data);
    };
    Crumb.prototype.getSeparatorHTML = function () {
        return lib.format(this.separatorTemplate, {
            classes: this.helper.getPartClassName('separator'),
            text: u.escape(this.separator)
        });
    };
    var paint = require('./painters');
    Crumb.prototype.repaint = paint.createRepaint(Control.prototype.repaint, {
        name: [
            'path',
            'separator'
        ],
        paint: function (crumb, path) {
            var html = u.map(path, crumb.getNodeHTML, crumb);
            var separator = crumb.getSeparatorHTML();
            crumb.main.innerHTML = html.join(separator);
        }
    });
    require('./main').register(Crumb);
    lib.inherits(Crumb, Control);
    return Crumb;
});