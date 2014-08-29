define('er/Action', [
    'require',
    './util',
    './Deferred',
    './events',
    './locator',
    'eoo',
    'mini-event/EventTarget'
], function (require) {
    var util = require('./util');
    function reportErrors() {
        var errors = [];
        for (var i = 0; i < arguments.length; i++) {
            var result = arguments[i];
            if (!result.success) {
                errors.push(result);
            }
        }
        return this.handleError(errors);
    }
    var exports = {};
    exports.constructor = function () {
        this.disposed = false;
        this.initialize();
    };
    exports.initialize = util.noop;
    exports.context = null;
    exports.modelType = null;
    exports.viewType = null;
    exports.enter = function (actionContext) {
        this.context = actionContext || {};
        this.fire('enter');
        var args = util.mix({}, actionContext && actionContext.args);
        if (this.model) {
            this.model.fill(args);
        } else {
            this.model = this.createModel(args);
        }
        this.fire('beforemodelload');
        if (this.model && typeof this.model.load === 'function') {
            var loadingModel = this.model.load();
            return loadingModel.then(util.bind(this.forwardToView, this), util.bind(reportErrors, this));
        } else {
            this.forwardToView();
            return require('./Deferred').resolved(this);
        }
    };
    exports.handleError = function (errors) {
        throw errors;
    };
    exports.createModel = function (context) {
        if (this.modelType) {
            var model = new this.modelType(context);
            return model;
        } else {
            return {};
        }
    };
    exports.forwardToView = function () {
        if (this.disposed) {
            return this;
        }
        this.fire('modelloaded');
        if (!this.view) {
            this.view = this.createView();
        }
        if (this.view) {
            this.view.model = this.model;
            if (!this.view.container) {
                this.view.container = this.context.container;
            }
            this.fire('beforerender');
            this.view.render();
            this.fire('rendered');
            this.initBehavior();
            this.fire('entercomplete');
        } else {
            var events = require('./events');
            events.notifyError('No view attached to this action');
        }
        return this;
    };
    exports.createView = function () {
        return this.viewType ? new this.viewType() : null;
    };
    exports.initBehavior = util.noop;
    exports.filterRedirect = util.noop;
    exports.leave = function () {
        if (this.disposed) {
            return this;
        }
        this.disposed = true;
        this.fire('beforeleave');
        if (this.model) {
            if (typeof this.model.dispose === 'function') {
                this.model.dispose();
            }
            this.model = null;
        }
        if (this.view) {
            if (typeof this.view.dispose === 'function') {
                this.view.dispose();
            }
            this.view = null;
        }
        this.fire('leave');
        this.destroyEvents();
    };
    exports.redirect = function (url, options) {
        var locator = require('./locator');
        locator.redirect(url, options);
    };
    exports.reload = function () {
        var locator = require('./locator');
        locator.reload();
    };
    exports.back = function (defaultURL) {
        var referrer = this.context && this.context.referrer;
        var url = referrer || defaultURL;
        if (url) {
            this.redirect(url);
        }
    };
    var Action = require('eoo').create(require('mini-event/EventTarget'), exports);
    return Action;
});