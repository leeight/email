define('esui/SafeWrapper', [
    'require',
    'underscore'
], function (require) {
    var u = require('underscore');
    function SafeWrapper() {
    }
    u.each([
        'enable',
        'disable',
        'setDisabled',
        'show',
        'hide',
        'toggle',
        'setValue',
        'setRawValue',
        'addChild',
        'removeChild',
        'set',
        'addState',
        'removeState',
        'toggleState',
        'on',
        'off',
        'fire',
        'dispose',
        'destroy',
        'initOptions',
        'createMain',
        'initStructure',
        'setViewContext',
        'render',
        'repaint',
        'appendTo',
        'insertBefore',
        'initChildren',
        'disposeChildren'
    ], function (method) {
        SafeWrapper.prototype[method] = function () {
        };
    });
    u.each([
        'isDisabled',
        'isHidden',
        'hasState',
        'isPropertyChanged'
    ], function (method) {
        SafeWrapper.prototype[method] = function () {
            return false;
        };
    });
    u.each([
        'getRawValue',
        'getChild',
        'get'
    ], function (method) {
        SafeWrapper.prototype[method] = function () {
            return null;
        };
    });
    u.each(['getValue'], function (method) {
        SafeWrapper.prototype[method] = function () {
            return '';
        };
    });
    u.each(['setProperties'], function (method) {
        SafeWrapper.prototype[method] = function () {
            return {};
        };
    });
    SafeWrapper.prototype.getCategory = function () {
        return 'control';
    };
    SafeWrapper.prototype.getChildSafely = function (childName) {
        var wrapper = new SafeWrapper();
        wrapper.childName = childName;
        wrapper.parent = this;
        if (this.viewContext) {
            wrapper.viewContext = this.viewContext;
        }
        return wrapper;
    };
    return SafeWrapper;
});