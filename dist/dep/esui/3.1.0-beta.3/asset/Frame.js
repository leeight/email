define('esui/Frame', [
    'require',
    'esui/lib',
    'esui/Control',
    'esui/painters',
    'esui'
], function (require) {
    var lib = require('esui/lib');
    var Control = require('esui/Control');
    function Frame(options) {
        Control.apply(this, arguments);
    }
    Frame.prototype.type = 'Frame';
    Frame.prototype.createMain = function () {
        return document.createElement('iframe');
    };
    Frame.prototype.initOptions = function (options) {
        var properties = {};
        lib.extend(properties, options);
        if (!properties.src) {
            properties.src = this.main.src;
        }
        this.setProperties(properties);
    };
    Frame.prototype.initStructure = function () {
        this.main.frameborder = 'no';
        this.main.marginHeight = '0';
        this.main.marginWeight = '0';
    };
    Frame.prototype.initEvents = function () {
        this.helper.delegateDOMEvent(this.main, 'load');
        this.helper.addDOMEvent(this.main, 'message', function (e) {
            var event = {
                    origin: e.origin,
                    data: e.data
                };
            this.fire('message', event);
        });
    };
    var paint = require('esui/painters');
    Frame.prototype.repaint = paint.createRepaint(Control.prototype.repaint, {
        name: 'src',
        paint: function (frame, src) {
            if (frame.main.src === src) {
                return;
            }
            frame.main.src = src;
        }
    }, paint.style('height'), paint.style('width'));
    Frame.prototype.callContentMethod = function (methodName) {
        var args = [].slice.call(arguments, 1);
        var contentWindow = this.main.contentWindow;
        if (!contentWindow) {
            throw new Error('No content window on this iframe');
        }
        if (typeof contentWindow[methodName] !== 'function') {
            throw new Error('No "' + methodName + '" method on window');
        }
        return contentWindow[methodName].apply(contentWindow, args);
    };
    Frame.prototype.postMessage = function (message, targetOrigin) {
        var contentWindow = this.main.contentWindow;
        if (!contentWindow) {
            throw new Error('No content window on this iframe');
        }
        if (typeof contentWindow.postMessage !== 'function') {
            throw new Error('Current browser does not support postMessage');
        }
        contentWindow.postMessage(message, targetOrigin);
    };
    lib.inherits(Frame, Control);
    require('esui').register(Frame);
    return Frame;
});