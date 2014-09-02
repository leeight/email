define('er/router', [
    'require',
    './URL',
    'eoo',
    'mini-event/EventTarget',
    './locator',
    './events'
], function (require) {
    var exports = {};
    exports.constructor = function () {
        this.routes = [];
        this.backup = null;
    };
    function executeRoute(e) {
        var url = require('./URL').parse(e.url);
        var path = url.getPath();
        for (var i = 0; i < this.routes.length; i++) {
            var route = this.routes[i];
            if (route.rule instanceof RegExp && route.rule.test(path) || route.rule === path) {
                route.handler.call(this, url);
                return;
            }
        }
        if (this.backup) {
            this.backup(url);
        }
        this.getEventBus().fire('route', {
            url: url,
            router: this
        });
    }
    exports.add = function (rule, handler) {
        this.routes.push({
            rule: rule,
            handler: handler
        });
    };
    exports.setBackup = function (handler) {
        this.backup = handler;
    };
    exports.getLocator = function () {
        return this.locator;
    };
    exports.setLocator = function (locator) {
        this.locator = locator;
    };
    exports.getEventBus = function () {
        return this.eventBus;
    };
    exports.setEventBus = function (eventBus) {
        this.eventBus = eventBus;
    };
    exports.start = function () {
        this.getLocator().on('redirect', executeRoute, this);
    };
    var Router = require('eoo').create(require('mini-event/EventTarget'), exports);
    var instance = new Router();
    instance.setLocator(require('./locator'));
    instance.setEventBus(require('./events'));
    instance.Router = Router;
    return instance;
});