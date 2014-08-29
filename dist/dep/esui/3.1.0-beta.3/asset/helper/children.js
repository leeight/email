define('esui/helper/children', [
    'require',
    'underscore',
    '../main'
], function (require) {
    var u = require('underscore');
    var ui = require('../main');
    var helper = {};
    helper.initChildren = function (wrap, options) {
        wrap = wrap || this.control.main;
        options = u.extend({}, this.control.renderOptions, options);
        options.viewContext = this.control.viewContext;
        options.parent = this.control;
        ui.init(wrap, options);
    };
    helper.disposeChildren = function () {
        var children = this.control.children.slice();
        u.each(children, function (child) {
            child.dispose();
        });
        this.children = [];
        this.childrenIndex = {};
    };
    helper.disableChildren = function () {
        u.each(this.control.children, function (child) {
            child.dispose();
        });
    };
    helper.enableChildren = function () {
        u.each(this.control.children, function (child) {
            child.enable();
        });
    };
    return helper;
});