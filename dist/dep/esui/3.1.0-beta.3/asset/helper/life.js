define('esui/helper/life', [
    'require',
    'underscore',
    '../main'
], function (require) {
    var LifeCycle = {
            NEW: 0,
            INITED: 1,
            RENDERED: 2,
            DISPOSED: 4
        };
    var u = require('underscore');
    var ui = require('../main');
    var helper = {};
    helper.initViewContext = function () {
        var viewContext = this.control.viewContext || ui.getViewContext();
        this.control.viewContext = null;
        this.control.setViewContext(viewContext);
    };
    helper.initExtensions = function () {
        var extensions = this.control.extensions;
        if (!u.isArray(extensions)) {
            extensions = this.control.extensions = [];
        }
        Array.prototype.push.apply(extensions, ui.createGlobalExtensions());
        var registeredExtensions = {};
        for (var i = 0; i < extensions.length; i++) {
            var extension = extensions[i];
            if (!registeredExtensions[extension.type]) {
                extension.attachTo(this.control);
                registeredExtensions[extension.type] = true;
            }
        }
    };
    helper.isInStage = function (stage) {
        if (LifeCycle[stage] == null) {
            throw new Error('Invalid life cycle stage: ' + stage);
        }
        return this.control.stage == LifeCycle[stage];
    };
    helper.changeStage = function (stage) {
        if (LifeCycle[stage] == null) {
            throw new Error('Invalid life cycle stage: ' + stage);
        }
        this.control.stage = LifeCycle[stage];
    };
    helper.dispose = function () {
        this.control.disposeChildren();
        this.control.children = null;
        this.control.childrenIndex = null;
        this.clearDOMEvents();
        u.invoke(this.control.extensions, 'dispose');
        this.control.extensions = null;
        if (this.control.parent) {
            this.control.parent.removeChild(this.control);
        }
        if (this.control.viewContext) {
            this.control.viewContext.remove(this.control);
        }
        this.control.renderOptions = null;
    };
    helper.beforeDispose = function () {
        this.control.fire('beforedispose');
    };
    helper.afterDispose = function () {
        this.changeStage('DISPOSED');
        this.control.fire('afterdispose');
        this.control.destroyEvents();
    };
    return helper;
});