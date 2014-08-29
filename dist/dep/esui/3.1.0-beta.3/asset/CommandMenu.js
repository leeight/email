define('esui/CommandMenu', [
    'require',
    'underscore',
    './lib',
    './Control',
    './Layer',
    './painters',
    './main'
], function (require) {
    var u = require('underscore');
    var lib = require('./lib');
    var Control = require('./Control');
    var Layer = require('./Layer');
    function selectItem(e) {
        this.layer.hide();
        var target = e.target;
        while (target !== e.currentTarget && !lib.hasAttribute(target, 'data-index')) {
            target = target.parentNode;
        }
        if (target === e.currentTarget) {
            return;
        }
        var index = +target.getAttribute('data-index');
        var item = this.datasource[index];
        if (item) {
            if (typeof item.handler === 'function') {
                item.handler.call(this, item, index);
            }
        }
        this.fire('select', {
            item: item,
            index: index
        });
    }
    function CommandMenuLayer() {
        Layer.apply(this, arguments);
    }
    lib.inherits(CommandMenuLayer, Layer);
    CommandMenuLayer.prototype.nodeName = 'ul';
    CommandMenuLayer.prototype.dock = { strictWidth: true };
    CommandMenuLayer.prototype.render = function (element) {
        var html = '';
        for (var i = 0; i < this.control.datasource.length; i++) {
            var classes = this.control.helper.getPartClasses('node');
            if (i === this.control.activeIndex) {
                classes.push.apply(classes, this.control.helper.getPartClasses('node-active'));
            }
            html += '<li data-index="' + i + '"' + ' class="' + classes.join(' ') + '">';
            html += this.control.getItemHTML(this.control.datasource[i]);
        }
        element.innerHTML = html;
    };
    CommandMenuLayer.prototype.initBehavior = function (element) {
        this.control.helper.addDOMEvent(element, 'click', selectItem);
    };
    function CommandMenu() {
        Control.apply(this, arguments);
        this.layer = new CommandMenuLayer(this);
    }
    CommandMenu.prototype.type = 'CommandMenu';
    CommandMenu.prototype.itemTemplate = '<span>${text}</span>';
    CommandMenu.prototype.getItemHTML = function (item) {
        var data = { text: u.escape(item.text) };
        return lib.format(this.itemTemplate, data);
    };
    CommandMenu.prototype.initEvents = function () {
        this.helper.addDOMEvent(this.main, 'click', u.bind(this.layer.toggle, this.layer));
    };
    var paint = require('./painters');
    CommandMenu.prototype.repaint = paint.createRepaint(Control.prototype.repaint, paint.style('width'), paint.style('height'), {
        name: 'datasource',
        paint: function (menu) {
            menu.layer.repaint();
        }
    }, paint.text('displayText'), {
        name: [
            'disabled',
            'hidden',
            'readOnly'
        ],
        paint: function (menu, disabled, hidden, readOnly) {
            if (disabled || hidden || readOnly) {
                menu.layer.hide();
            }
        }
    });
    CommandMenu.prototype.dispose = function () {
        if (this.helper.isInStage('DISPOSED')) {
            return;
        }
        if (this.layer) {
            this.layer.dispose();
            this.layer = null;
        }
        Control.prototype.dispose.apply(this, arguments);
    };
    lib.inherits(CommandMenu, Control);
    require('./main').register(CommandMenu);
    return CommandMenu;
});