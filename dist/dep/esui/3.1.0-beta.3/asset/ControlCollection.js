define('esui/ControlCollection', [
    'require',
    'underscore'
], function (require) {
    var u = require('underscore');
    function ControlCollection() {
        this.length = 0;
    }
    ControlCollection.prototype.splice = Array.prototype.splice;
    ControlCollection.prototype.add = function (control) {
        var index = u.indexOf(this, control);
        if (index < 0) {
            [].push.call(this, control);
        }
    };
    ControlCollection.prototype.remove = function (control) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] === control) {
                [].splice.call(this, i, 1);
                return;
            }
        }
    };
    ControlCollection.prototype.each = function (iterator, thisObject) {
        u.each(this, function (control, i) {
            iterator.call(thisObject || control, control, i, this);
        });
    };
    ControlCollection.prototype.invoke = function (methodName) {
        var args = [this];
        args.push.apply(args, arguments);
        return u.invoke.apply(u, args);
    };
    u.each([
        'enable',
        'disable',
        'setDisabled',
        'show',
        'hide',
        'toggle',
        'addChild',
        'removeChild',
        'set',
        'setProperties',
        'addState',
        'removeState',
        'toggleState',
        'on',
        'off',
        'fire',
        'dispose',
        'destroy',
        'setViewContext',
        'render',
        'repaint',
        'appendTo',
        'insertBefore'
    ], function (method) {
        ControlCollection.prototype[method] = function () {
            var args = [method];
            args.push.apply(args, arguments);
            var result = this.invoke.apply(this, args);
            return result && result[0];
        };
    });
    u.each([
        'isDisabled',
        'isHidden',
        'hasState',
        'get',
        'getCategory',
        'getChild',
        'getChildSafely'
    ], function (method) {
        ControlCollection.prototype[method] = function () {
            var first = this[0];
            return first ? first[method].apply(first, arguments) : undefined;
        };
    });
    return ControlCollection;
});