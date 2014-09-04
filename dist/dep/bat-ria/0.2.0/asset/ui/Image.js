define([
    'require',
    'esui/lib',
    'esui/controlHelper',
    'esui/Control',
    'esui'
], function (require) {
    var lib = require('esui/lib');
    var helper = require('esui/controlHelper');
    var Control = require('esui/Control');
    function Image(options) {
        Control.apply(this, arguments);
    }
    Image.prototype.type = 'Image';
    Image.defaultProperties = { imageType: 'auto' };
    Image.prototype.createMain = function () {
        return document.createElement('figure');
    };
    Image.prototype.initOptions = function (options) {
        var properties = {};
        lib.extend(properties, Image.defaultProperties, options);
        this.setProperties(properties);
    };
    Image.prototype.initStructure = function () {
        var html = [
                this.helper.getPartHTML('content', 'div'),
                this.helper.getPartBeginTag('footer', 'footer'),
                this.helper.getPartBeginTag('magnifier', 'span'),
                '\u653E\u5927\u663E\u793A',
                this.helper.getPartEndTag('magnifier', 'span'),
                this.helper.getPartEndTag('footer', 'footer')
            ];
        this.main.innerHTML = html.join('');
        this.helper.addDOMEvent('magnifier', 'click', this.displayFullSize);
    };
    Image.prototype.repaint = helper.createRepaint(Control.prototype.repaint, {
        name: [
            'url',
            'width',
            'height'
        ],
        paint: function (image, url) {
            if (!url) {
                image.restoreInitialState();
                return;
            }
            var html = image.getPreviewHTML();
            image.helper.getPart('content').innerHTML = html;
            image.removeState('empty');
        }
    });
    Image.prototype.restoreInitialState = function () {
        this.url = null;
        this.width = null;
        this.height = null;
        var content = this.helper.getPart('content');
        content.innerHTML = '';
        this.addState('empty');
    };
    Image.prototype.getActualImageType = function () {
        if (this.imageType !== 'auto') {
            return this.imageType;
        }
        var match = /\.\w+$/.exec(this.url);
        if (!match) {
            return null;
        }
        var extension = [0];
        if (extension === '.swf' && extension === '.flv') {
            return 'flash';
        } else {
            return 'image';
        }
    };
    var imageTemplate = [
            '<img src="${url}" ',
            '${widthAttribute} ${heightAttribute} />'
        ];
    imageTemplate = imageTemplate.join('');
    var flashTemplate = [
            '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ',
            'align="middle" ',
            '${widthAttribute} ${heightAttribute}>',
            '<param name="allowScriptAccess" value="never">',
            '<param name="quality" value="high">',
            '<param name="wmode" value="transparent">',
            '<param name="movie" value="${url}">',
            '<embed wmode="transparent" src="${url}" ',
            'quality="high" align="middle" allowScriptAccess="always" ',
            '${widthAttribute} ${heightAttribute} ',
            'type="application/x-shockwave-flash" />',
            '</object>'
        ];
    flashTemplate = flashTemplate.join('');
    Image.prototype.getPreviewHTML = function () {
        var type = this.getActualImageType();
        if (!type) {
            return '<strong>\u65E0\u6CD5\u9884\u89C8\u8BE5\u683C\u5F0F</strong>';
        }
        var data = {
                url: this.url,
                widthAttribute: this.width ? 'width="' + this.width + '"' : '',
                heightAttribute: this.height ? 'height="' + this.height + '"' : ''
            };
        if (type === 'image') {
            return lib.format(imageTemplate, data);
        } else if (type === 'flash') {
            return lib.format(flashTemplate, data);
        } else {
            return '<strong>\u65E0\u6CD5\u9884\u89C8\u8BE5\u683C\u5F0F</strong>';
        }
    };
    Image.prototype.displayFullSize = function () {
        if (!this.url) {
            return;
        }
        var mask = this.helper.createPart('full-size-mask');
        document.body.appendChild(mask);
        var content = this.helper.createPart('full-size-content');
        content.innerHTML = this.getPreviewHTML();
        if (this.width && this.height) {
            content.style.top = '50%';
            content.style.left = '50%';
            content.style.marginLeft = -Math.round(this.width / 2) + 'px';
            content.style.marginTop = -Math.round(this.height / 2) + 'px';
        }
        document.body.appendChild(content);
        var close = this.helper.createPart('full-size-close');
        close.innerHTML = '\xD7';
        document.body.appendChild(close);
        this.helper.addDOMEvent(mask, 'click', this.cancelFullSize);
        this.helper.addDOMEvent(close, 'click', this.cancelFullSize);
    };
    Image.prototype.cancelFullSize = function () {
        var mask = this.helper.getPart('full-size-mask');
        lib.removeNode(mask);
        var content = this.helper.getPart('full-size-content');
        lib.removeNode(content);
        var close = this.helper.getPart('full-size-close');
        this.helper.clearDOMEvents(close);
        lib.removeNode(close);
    };
    lib.inherits(Image, Control);
    require('esui').register(Image);
    return Image;
});