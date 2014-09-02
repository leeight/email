define('esui/Layer', [
    'require',
    'underscore',
    './lib',
    './main'
], function (require) {
    var u = require('underscore');
    var lib = require('./lib');
    var ui = require('./main');
    function Layer(control) {
        this.control = control;
    }
    Layer.prototype.nodeName = 'div';
    function close(e) {
        var target = e.target;
        var layer = this.getElement(this);
        var main = this.control.main;
        if (!layer) {
            return;
        }
        while (target && (target !== layer && target !== main)) {
            target = target.parentNode;
        }
        if (target !== layer && target !== main) {
            this.hide();
        }
    }
    Layer.prototype.create = function () {
        var element = this.control.helper.createPart('layer', this.nodeName);
        lib.addClass(element, ui.getConfig('uiClassPrefix') + '-layer');
        return element;
    };
    Layer.prototype.render = function (element) {
    };
    Layer.prototype.syncState = function (element) {
    };
    Layer.prototype.repaint = function () {
        var element = this.getElement(false);
        if (element) {
            this.render(element);
        }
    };
    Layer.prototype.initBehavior = function (element) {
    };
    function getHiddenClasses(layer) {
        var classes = layer.control.helper.getPartClasses('layer-hidden');
        classes.unshift(ui.getConfig('uiClassPrefix') + '-layer-hidden');
        return classes;
    }
    Layer.prototype.getElement = function (create) {
        var element = this.control.helper.getPart('layer');
        if (!element && create !== false) {
            element = this.create();
            this.render(element);
            lib.addClasses(element, getHiddenClasses(this));
            this.initBehavior(element);
            this.control.helper.addDOMEvent(document, 'mousedown', u.bind(close, this));
            this.control.helper.addDOMEvent(element, 'mousedown', function (e) {
                e.stopPropagation();
            });
            this.syncState(element);
            if (!element.parentElement) {
                document.body.appendChild(element);
            }
        }
        return element;
    };
    Layer.prototype.hide = function () {
        var classes = getHiddenClasses(this);
        var element = this.getElement();
        lib.addClasses(element, classes);
        this.control.removeState('active');
    };
    Layer.prototype.show = function () {
        var element = this.getElement();
        element.style.zIndex = this.getZIndex();
        this.position();
        var classes = getHiddenClasses(this);
        lib.removeClasses(element, classes);
        this.control.addState('active');
    };
    Layer.prototype.toggle = function () {
        var element = this.getElement();
        if (!element || this.control.helper.isPart(element, 'layer-hidden')) {
            this.show();
        } else {
            this.hide();
        }
    };
    Layer.prototype.position = function () {
        var element = this.getElement();
        Layer.attachTo(element, this.control.main, this.dock);
    };
    Layer.prototype.getZIndex = function () {
        return Layer.getZIndex(this.control.main);
    };
    Layer.prototype.dispose = function () {
        var element = this.getElement(false);
        if (element) {
            element.innerHTML = '';
            lib.removeNode(element);
        }
        this.control = null;
    };
    var zIndexStack = 1000;
    Layer.create = function (tagName) {
        var element = document.createElement(tagName || 'div');
        element.style.position = 'absolute';
        return element;
    };
    Layer.getZIndex = function (owner) {
        var zIndex = 0;
        while (!zIndex && owner && owner !== document) {
            zIndex = parseInt(lib.getComputedStyle(owner, 'zIndex'), 10);
            owner = owner.parentNode;
        }
        zIndex = zIndex || 0;
        return zIndex + 1;
    };
    Layer.moveToTop = function (element) {
        element.style.zIndex = ++zIndexStack;
    };
    Layer.moveTo = function (element, top, left) {
        positionLayerElement(element, {
            top: top,
            left: left
        });
    };
    Layer.resize = function (element, width, height) {
        positionLayerElement(element, {
            width: width,
            height: height
        });
    };
    Layer.attachTo = function (layer, target, options) {
        options = options || { strictWidth: false };
        var pageWidth = lib.page.getViewWidth();
        var pageHeight = lib.page.getViewHeight();
        var pageScrollTop = lib.page.getScrollTop();
        var pageScrollLeft = lib.page.getScrollLeft();
        var targetOffset = lib.getOffset(target);
        var previousDisplayValue = layer.style.display;
        layer.style.display = 'block';
        layer.style.top = '-5000px';
        layer.style.left = '-5000px';
        if (options.strictWidth) {
            layer.style.minWidth = targetOffset.width + 'px';
        }
        var layerOffset = lib.getOffset(layer);
        layer.style.top = '';
        layer.style.left = '';
        layer.style.display = previousDisplayValue;
        var properties = {};
        var bottomSpace = pageHeight - (targetOffset.bottom - pageScrollTop);
        var topSpace = targetOffset.top - pageScrollTop;
        if (bottomSpace <= layerOffset.height && topSpace > layerOffset.height) {
            properties.top = targetOffset.top - layerOffset.height;
        } else {
            properties.top = targetOffset.bottom;
        }
        var rightSpace = pageWidth - (targetOffset.left - pageScrollLeft);
        var leftSpace = targetOffset.right - pageScrollLeft;
        if (rightSpace <= layerOffset.width && leftSpace > layerOffset.width) {
            properties.left = targetOffset.right - layerOffset.width;
        } else {
            properties.left = targetOffset.left;
        }
        positionLayerElement(layer, properties);
    };
    Layer.centerToView = function (element, options) {
        var properties = options ? lib.clone(options) : {};
        if (typeof properties.width !== 'number') {
            properties.width = this.width;
        }
        if (typeof properties.height !== 'number') {
            properties.height = this.height;
        }
        properties.left = (lib.page.getViewWidth() - properties.width) / 2;
        var viewHeight = lib.page.getViewHeight();
        if (properties.height >= viewHeight && options.hasOwnProperty('minTop')) {
            properties.top = options.minTop;
        } else {
            properties.top = Math.floor((viewHeight - properties.height) / 2);
        }
        var viewWidth = lib.page.getViewWidth();
        if (properties.height >= viewWidth && options.hasOwnProperty('minLeft')) {
            properties.left = options.minLeft;
        } else {
            properties.left = Math.floor((viewWidth - properties.width) / 2);
        }
        properties.top += lib.page.getScrollTop();
        this.setProperties(properties);
    };
    function positionLayerElement(element, options) {
        var properties = lib.clone(options || {});
        if (properties.hasOwnProperty('top') && properties.hasOwnProperty('bottom')) {
            properties.height = properties.bottom - properties.top;
            delete properties.bottom;
        }
        if (properties.hasOwnProperty('left') && properties.hasOwnProperty('right')) {
            properties.width = properties.right - properties.left;
            delete properties.right;
        }
        if (properties.hasOwnProperty('top') || properties.hasOwnProperty('bottom')) {
            element.style.top = '';
            element.style.bottom = '';
        }
        if (properties.hasOwnProperty('left') || properties.hasOwnProperty('right')) {
            element.style.left = '';
            element.style.right = '';
        }
        for (var name in properties) {
            if (properties.hasOwnProperty(name)) {
                element.style[name] = properties[name] + 'px';
            }
        }
    }
    return Layer;
});