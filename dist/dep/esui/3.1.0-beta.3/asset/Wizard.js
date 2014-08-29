define('esui/Wizard', [
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
    function Wizard() {
        Control.apply(this, arguments);
    }
    Wizard.prototype.type = 'Wizard';
    Wizard.prototype.createMain = function () {
        return document.createElement('ol');
    };
    Wizard.prototype.initOptions = function (options) {
        var properties = {
                steps: [],
                activeIndex: 0
            };
        var children = lib.getChildren(this.main);
        if (!options.steps && children.length) {
            properties.steps = u.map(children, function (node) {
                var config = { text: lib.getText(node) };
                var panel = node.getAttribute('data-for');
                if (panel) {
                    config.panel = panel;
                }
                return config;
            });
        }
        u.extend(properties, options);
        if (typeof properties.activeIndex === 'string') {
            properties.activeIndex = +properties.activeIndex;
        }
        this.setProperties(properties);
    };
    function togglePanel(wizard, config, isActive) {
        var panel = config && config.panel && lib.g(config.panel);
        if (!panel) {
            return;
        }
        var method = isActive ? 'removePartClasses' : 'addPartClasses';
        wizard.helper[method]('panel-hidden', panel);
    }
    Wizard.prototype.nodeTemplate = '<span>${text}</span>';
    Wizard.prototype.getNodeHTML = function (node) {
        return lib.format(this.nodeTemplate, { text: lib.encodeHTML(node.text) });
    };
    function getHTML(wizard) {
        var html = '';
        for (var i = 0; i < wizard.steps.length; i++) {
            var node = wizard.steps[i];
            var classes = wizard.helper.getPartClasses('node');
            if (i === 0) {
                classes.push.apply(classes, wizard.helper.getPartClasses('node-first'));
            }
            if (i === wizard.steps.length - 1 && !wizard.finishText) {
                classes.push.apply(classes, wizard.helper.getPartClasses('node-last'));
            }
            if (i === wizard.activeIndex - 1) {
                classes.push.apply(classes, wizard.helper.getPartClasses('node-active-prev'));
            }
            if (i <= wizard.activeIndex - 1) {
                classes.push.apply(classes, wizard.helper.getPartClasses('node-done'));
            }
            var isActive = i === wizard.activeIndex;
            togglePanel(wizard, node, isActive);
            if (isActive) {
                classes.push.apply(classes, wizard.helper.getPartClasses('node-active'));
                if (i === wizard.steps.length - 1) {
                    classes.push.apply(classes, wizard.helper.getPartClasses('node-last-active'));
                }
            }
            html += '<li class="' + classes.join(' ') + '">';
            html += wizard.getNodeHTML(node);
            html += '</li>';
        }
        if (wizard.finishText) {
            var classes = [].concat(wizard.helper.getPartClasses('node'), wizard.helper.getPartClasses('node-last'), wizard.helper.getPartClasses('node-finish'), wizard.activeIndex === wizard.steps.length ? wizard.helper.getPartClasses('node-active') : []);
            html += '<li class="' + classes.join(' ') + '">';
            html += '<span>' + wizard.finishText + '</span>';
            html += '</li>';
        }
        return html;
    }
    var paint = require('./painters');
    Wizard.prototype.repaint = paint.createRepaint(Control.prototype.repaint, {
        name: [
            'steps',
            'finishText'
        ],
        paint: function (wizard) {
            wizard.main.innerHTML = getHTML(wizard);
        }
    }, {
        name: 'activeIndex',
        paint: function (wizard, value) {
            if (!wizard.helper.isInStage('RENDERED')) {
                return;
            }
            var nodes = wizard.main.getElementsByTagName('li');
            for (var i = nodes.length - 1; i >= 0; i--) {
                var isActive = i === wizard.activeIndex;
                togglePanel(wizard, wizard.steps[i], isActive);
                var node = nodes[i];
                var method = isActive ? 'addPartClasses' : 'removePartClasses';
                wizard.helper[method]('node-active', node);
                if (i === wizard.steps.length - 1) {
                    wizard.helper[method]('node-last-active', node);
                }
                var isDone = i <= wizard.activeIndex - 1;
                var method = isDone ? 'addPartClasses' : 'removePartClasses';
                wizard.helper[method]('node-done', node);
                var isCurPrev = i === wizard.activeIndex - 1;
                var method = isCurPrev ? 'addPartClasses' : 'removePartClasses';
                wizard.helper[method]('node-active-prev', node);
            }
        }
    });
    Wizard.prototype.setProperties = function (properties) {
        if (properties.hasOwnProperty('steps')) {
            if (properties.hasOwnProperty('activeIndex')) {
                this.activeIndex = properties.activeIndex;
                delete properties.activeIndex;
            } else {
                this.activeIndex = 0;
            }
            if (properties.hasOwnProperty('finishText')) {
                this.finishText = properties.finishText;
                delete properties.finishText;
            }
        }
        var changes = Control.prototype.setProperties.apply(this, arguments);
        if (changes.hasOwnProperty('steps') || changes.hasOwnProperty('activeIndex')) {
            this.fire('enter');
        }
    };
    Wizard.prototype.getActiveStep = function () {
        return this.get('steps')[this.get('activeIndex')];
    };
    Wizard.prototype.stepNext = function () {
        var maxStep = this.finishText ? this.steps.length : this.steps.length - 1;
        if (this.activeIndex < maxStep) {
            this.set('activeIndex', this.activeIndex + 1);
        }
    };
    Wizard.prototype.stepPrevious = function () {
        if (this.activeIndex > 0) {
            this.set('activeIndex', this.activeIndex - 1);
        }
    };
    require('./main').register(Wizard);
    lib.inherits(Wizard, Control);
    return Wizard;
});