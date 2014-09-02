define('esui/controlHelper', [
    'require',
    './lib',
    './Helper',
    './painters',
    'underscore',
    './Layer'
], function (require) {
    var lib = require('./lib');
    var Helper = require('./Helper');
    var helper = {};
    helper.getGUID = lib.getGUID;
    var methods = [
            'initViewContext',
            'initExtensions',
            'isInStage',
            'changeStage',
            'dispose',
            'beforeDispose',
            'afterDispose',
            'getPartClasses',
            'addPartClasses',
            'removePartClasses',
            'getStateClasses',
            'addStateClasses',
            'removeStateClasses',
            'getId',
            'replaceMain',
            'addDOMEvent',
            'removeDOMEvent',
            'clearDOMEvents'
        ];
    helper.createRepaint = require('./painters').createRepaint;
    require('underscore').each(methods, function (name) {
        helper[name] = function (control) {
            var helper = control.helper || new Helper(control);
            var args = [].slice.call(arguments, 1);
            return helper[name].apply(helper, args);
        };
    });
    helper.extractValueFromInput = function (control, options) {
        var main = control.main;
        if (lib.isInput(main)) {
            if (main.value && !options.value) {
                options.value = main.value;
            }
            if (main.name && !options.name) {
                options.name = main.name;
            }
            if (main.disabled && (options.disabled === null || options.disabled === undefined)) {
                options.disabled = main.disabled;
            }
            if (main.readOnly && (options.readOnly === null || options.readOnly === undefined)) {
                options.readOnly = main.readonly || main.readOnly;
            }
        }
    };
    var layer = helper.layer = {};
    var Layer = require('./Layer');
    layer.create = Layer.create;
    layer.getZIndex = Layer.getZIndex;
    layer.moveToTop = Layer.moveToTop;
    layer.moveTo = Layer.moveTo;
    layer.resize = Layer.resize;
    layer.attachTo = Layer.attachTo;
    layer.centerToView = Layer.centerToView;
    return helper;
});