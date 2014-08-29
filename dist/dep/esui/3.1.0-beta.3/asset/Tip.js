define('esui/Tip', [
    'require',
    'underscore',
    './Control',
    './main',
    './TipLayer',
    './painters',
    './lib'
], function (require) {
    var u = require('underscore');
    var Control = require('./Control');
    var ui = require('./main');
    require('./TipLayer');
    function Tip(options) {
        Control.apply(this, arguments);
    }
    Tip.prototype.type = 'Tip';
    Tip.prototype.initOptions = function (options) {
        var properties = {
                title: '',
                content: '',
                arrow: true,
                showMode: 'over',
                delayTime: 500
            };
        if (options.arrow === 'false') {
            options.arrow = false;
        }
        extractDOMProperties(this.main, properties);
        u.extend(properties, options);
        this.setProperties(properties);
    };
    function extractDOMProperties(main, options) {
        options.title = options.title || main.getAttribute('title');
        main.removeAttribute('title');
        options.content = options.content || main.innerHTML;
        main.innerHTML = '';
    }
    Tip.prototype.initStructure = function () {
        var main = document.createElement('div');
        document.body.appendChild(main);
        var tipLayer = ui.create('TipLayer', {
                main: main,
                childName: 'layer',
                content: this.content,
                title: this.title,
                arrow: this.arrow,
                width: this.layerWidth || 200,
                viewContext: this.viewContext
            });
        this.addChild(tipLayer);
        tipLayer.render();
        var attachOptions = {
                showMode: this.mode,
                delayTime: this.delayTime,
                targetControl: this,
                positionOpt: {
                    top: 'top',
                    right: 'left'
                }
            };
        tipLayer.attachTo(attachOptions);
    };
    Tip.prototype.repaint = require('./painters').createRepaint(Control.prototype.repaint, {
        name: 'title',
        paint: function (tip, value) {
            var layer = tip.getChild('layer');
            if (layer) {
                layer.setTitle(value);
            }
        }
    }, {
        name: 'content',
        paint: function (tip, value) {
            var layer = tip.getChild('layer');
            if (layer) {
                layer.setContent(value);
            }
        }
    });
    require('./lib').inherits(Tip, Control);
    ui.register(Tip);
    return Tip;
});