define('esui/Toast', [
    'require',
    './lib',
    './Control',
    './painters',
    './main'
], function (require) {
    var lib = require('./lib');
    var Control = require('./Control');
    function Toast(options) {
        Control.apply(this, arguments);
    }
    Toast.defaultProperties = {
        duration: 3000,
        messageType: 'normal',
        disposeOnHide: true
    };
    Toast.prototype.type = 'Toast';
    Toast.prototype.initOptions = function (options) {
        var properties = {};
        lib.extend(properties, Toast.defaultProperties, options);
        if (properties.content == null) {
            properties.content = this.main.innerHTML;
        }
        this.setProperties(properties);
    };
    Toast.prototype.initStructure = function () {
        this.main.innerHTML = this.helper.getPartHTML('content', 'p');
    };
    Toast.prototype.repaint = require('./painters').createRepaint(Control.prototype.repaint, {
        name: 'content',
        paint: function (toast, content) {
            var container = toast.main.firstChild;
            container.innerHTML = content;
        }
    }, {
        name: 'messageType',
        paint: function (toast, messageType) {
            toast.helper.addPartClasses(toast.messageType);
        }
    });
    Toast.prototype.show = function () {
        if (this.helper.isInStage('DISPOSED')) {
            return;
        }
        if (!this.main.parentElement && !this.main.parentNode) {
            this.appendTo(getContainer.call(this));
        }
        Control.prototype.show.apply(this, arguments);
        this.fire('show');
        clearTimeout(this.timer);
        if (!isNaN(this.duration) && this.duration !== Infinity) {
            this.timer = setTimeout(lib.bind(this.hide, this), this.duration);
        }
    };
    Toast.prototype.hide = function () {
        Control.prototype.hide.apply(this, arguments);
        clearTimeout(this.timer);
        this.fire('hide');
        if (this.disposeOnHide) {
            this.dispose();
        }
    };
    Toast.prototype.dispose = function () {
        clearTimeout(this.timer);
        if (this.helper.isInStage('DISPOSED')) {
            return;
        }
        lib.removeNode(this.main);
        Control.prototype.dispose.apply(this, arguments);
    };
    function getContainer() {
        var prefix = require('./main').getConfig('uiClassPrefix');
        var containerId = prefix + '-toast-collection-area';
        var element = document.getElementById(containerId);
        if (!element) {
            element = document.createElement('div');
            element.id = containerId;
            this.helper.addPartClasses('collection-area', element);
            document.body.appendChild(element);
        }
        return element;
    }
    var allType = [
            'show',
            'info',
            'alert',
            'error',
            'success'
        ];
    for (var key in allType) {
        if (allType.hasOwnProperty(key)) {
            (function (messageType) {
                Toast[messageType] = function (content, options) {
                    if (messageType === 'show') {
                        messageType = 'normal';
                    }
                    options = lib.extend({ content: content }, options);
                    options.messageType = options.messageType || messageType;
                    var toast = new Toast(options);
                    Control.prototype.hide.apply(toast);
                    toast.appendTo(getContainer.call(toast));
                    return toast;
                };
            }(allType[key]));
        }
    }
    lib.inherits(Toast, Control);
    require('./main').register(Toast);
    return Toast;
});