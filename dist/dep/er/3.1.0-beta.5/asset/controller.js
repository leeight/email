define('er/controller', [
    'require',
    './Deferred',
    './URL',
    './config',
    './util',
    './assert',
    'mini-event/EventTarget',
    'eoo',
    './locator',
    './router',
    './events',
    './permission'
], function (require) {
    var Deferred = require('./Deferred');
    var URL = require('./URL');
    var config = require('./config');
    var util = require('./util');
    var assert = require('./assert');
    var exports = {};
    exports.constructor = function () {
        this.actionPathMapping = {};
        this.childActionMapping = {};
        this.currentURL = null;
        this.currentAction = null;
        this.globalActionLoader = null;
        this.childActionLoaders = {};
    };
    exports.registerAction = function (actionConfigs) {
        if (!actionConfigs.hasOwnProperty('length')) {
            actionConfigs = [actionConfigs];
        }
        for (var i = 0; i < actionConfigs.length; i++) {
            var actionConfig = actionConfigs[i];
            assert.hasProperty(actionConfig, 'path', 'action config should contains a "path" property');
            this.actionPathMapping[actionConfig.path] = actionConfig;
        }
    };
    exports.getDefaultTitle = function () {
        return this.defaultTitle;
    };
    exports.setDefaultTitle = function (title) {
        this.defaultTitle = title;
    };
    exports.getRouter = function () {
        return this.router;
    };
    exports.setRouter = function (router) {
        this.router = router;
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
    exports.getPermissionProvider = function () {
        return this.permissionProvider;
    };
    exports.setPermissionProvider = function (permissionProvider) {
        this.permissionProvider = permissionProvider;
    };
    exports.getMainContainer = function () {
        return this.mainContainer || config.mainElement;
    };
    exports.setMainContainer = function (mainContainer) {
        this.mainContainer = mainContainer;
    };
    exports.getNoAuthorityLocation = function () {
        return this.noAuthorityLocation || config.noAuthorityLocation;
    };
    exports.setNoAuthorityLocation = function (noAuthorityLocation) {
        this.noAuthorityLocation = noAuthorityLocation;
    };
    exports.getNotFoundLocation = function () {
        return this.notFoundLocation || config.notFoundLocation;
    };
    exports.setNotFoundLocation = function (notFoundLocation) {
        this.notFoundLocation = notFoundLocation;
    };
    exports.start = function () {
        if (!this.getDefaultTitle()) {
            this.setDefaultTitle(config.systemName || document.title);
        }
        this.getRouter().setBackup(util.bind(this.renderAction, this));
    };
    exports.findActionConfig = function (actionContext) {
        var path = actionContext.url.getPath();
        var actionConfig = this.actionPathMapping[path];
        return actionConfig;
    };
    exports.resolveActionConfig = function (actionConfig, actionContext) {
        return actionConfig;
    };
    exports.checkAuthority = function (actionConfig, actionContext) {
        var authority = actionConfig.authority;
        if (!authority) {
            return true;
        }
        var permissionProvider = this.getPermissionProvider();
        if (typeof authority === 'function') {
            return authority(actionContext, actionConfig, permissionProvider);
        }
        if (typeof authority === 'string') {
            authority = authority.split('|');
        }
        for (var i = 0; i < authority.length; i++) {
            if (permissionProvider.isAllow(util.trim(authority[i]))) {
                return true;
            }
        }
        return false;
    };
    exports.findEligibleActionConfig = function (actionContext) {
        var actionConfig = this.findActionConfig(actionContext);
        if (actionConfig && actionConfig.movedTo) {
            this.getEventBus().fire('actionmoved', {
                controller: this,
                url: actionContext.url,
                config: actionConfig,
                movedTo: actionConfig.movedTo
            });
            actionContext.originalURL = actionContext.url;
            actionContext.url = URL.parse(actionConfig.movedTo);
            return this.findEligibleActionConfig(actionContext);
        }
        if (actionConfig && (actionConfig.childActionOnly && !actionContext.isChildAction)) {
            actionConfig = null;
        }
        if (!actionConfig) {
            this.getEventBus().fire('actionnotfound', util.mix({
                controller: this,
                failType: 'NotFound',
                reason: 'Not found'
            }, actionContext));
            actionContext.originalURL = actionContext.url;
            actionContext.url = URL.parse(this.getNotFoundLocation());
            if (!this.actionPathMapping[actionContext.url.getPath()]) {
                return null;
            }
            return this.findEligibleActionConfig(actionContext);
        }
        var hasAuthority = this.checkAuthority(actionConfig, actionContext);
        if (!hasAuthority) {
            this.getEventBus().fire('permissiondenied', util.mix({
                controller: this,
                failType: 'PermissionDenied',
                reason: 'Permission denied',
                config: actionConfig
            }, actionContext));
            var location = actionConfig.noAuthorityLocation || this.getNoAuthorityLocation();
            actionContext.originalURL = actionContext.url;
            actionContext.url = URL.parse(location);
            return this.findEligibleActionConfig(actionContext);
        }
        return actionConfig;
    };
    exports.loadAction = function (actionContext) {
        var actionConfig = this.findEligibleActionConfig(actionContext);
        actionConfig = this.resolveActionConfig(actionConfig, actionContext);
        if (!actionConfig) {
            var failed = new Deferred();
            failed.syncModeEnabled = false;
            failed.reject('no action configured for url ' + actionContext.url.getPath());
            return failed.promise;
        }
        if (actionConfig.title) {
            actionContext.title = actionConfig.title;
            actionContext.args.title = actionConfig.title;
        }
        if (actionConfig.documentTitle) {
            actionContext.documentTitle = actionConfig.documentTitle;
            actionContext.args.documentTitle = actionConfig.documentTitle;
        }
        if (actionConfig.args) {
            for (var name in actionConfig.args) {
                if (actionConfig.args.hasOwnProperty(name)) {
                    if (!actionContext.args.hasOwnProperty(name)) {
                        actionContext.args[name] = actionConfig.args[name];
                    }
                    if (!actionContext.hasOwnProperty(name)) {
                        actionContext[name] = actionConfig.args[name];
                    }
                }
            }
        }
        var loading = new Deferred();
        loading.syncModeEnabled = false;
        var loader = loading.promise;
        var aborted = false;
        var abort = function () {
            if (!aborted) {
                aborted = true;
                this.getEventBus().fire('actionabort', util.mix({ controller: this }, actionContext));
            }
        };
        loader.abort = util.bind(abort, this);
        if (!actionContext.isChildAction) {
            this.currentURL = actionContext.url;
        }
        var callback = function (SpecificAction) {
            if (aborted) {
                return;
            }
            if (!SpecificAction) {
                var reason = 'No action implement for ' + actionConfig.type;
                var error = util.mix({
                        controller: this,
                        failType: 'NoModule',
                        config: actionConfig,
                        reason: reason
                    }, actionContext);
                this.getEventBus().fire('actionfail', error);
                this.getEventBus().notifyError(error);
                loading.reject(reason);
                return;
            }
            this.getEventBus().fire('actionloaded', {
                controller: this,
                url: actionContext.url,
                config: actionConfig,
                action: SpecificAction
            });
            if (typeof SpecificAction === 'function') {
                loading.resolve(new SpecificAction(), actionContext);
            } else if (typeof SpecificAction.createRuntimeAction === 'function') {
                var resolveActionInstance = function (action) {
                    if (!action) {
                        var reason = 'Action factory returns non-action';
                        var error = util.mix({
                                controller: this,
                                failType: 'InvalidFactory',
                                config: actionConfig,
                                reason: reason,
                                action: action
                            }, actionContext);
                        this.getEventBus().fire('actionfail', error);
                        this.getEventBus().notifyError(error);
                        loading.reject(reason);
                    } else {
                        loading.resolve(action, actionContext);
                    }
                };
                resolveActionInstance = util.bind(resolveActionInstance, this);
                var actionFactoryProduct = SpecificAction.createRuntimeAction(actionContext);
                Deferred.when(actionFactoryProduct).then(resolveActionInstance);
            } else {
                loading.resolve(SpecificAction, actionContext);
            }
        };
        callback = util.bind(callback, this);
        if (typeof actionConfig.type === 'string') {
            window.require([actionConfig.type], callback);
        } else {
            callback(actionConfig.type);
        }
        return loader;
    };
    exports.enterAction = function (action, actionContext) {
        if (!actionContext.isChildAction) {
            if (actionContext.url !== this.currentURL) {
                return;
            }
            if (this.currentAction) {
                this.getEventBus().fire('leaveaction', {
                    controller: this,
                    action: this.currentAction,
                    to: util.mix({}, actionContext)
                });
                if (typeof this.currentAction.leave === 'function') {
                    this.currentAction.leave();
                }
            }
            this.currentAction = action;
            document.title = actionContext.title || actionContext.documentTitle || this.getDefaultTitle();
        }
        this.getEventBus().fire('enteraction', util.mix({
            controller: this,
            action: action
        }, actionContext));
        var notifyEnterComplete = function () {
            this.getEventBus().fire('enteractioncomplete', util.mix({
                controller: this,
                action: action
            }, actionContext));
        };
        notifyEnterComplete = util.bind(notifyEnterComplete, this);
        var notifyEnterFail = function (reason) {
            var message = '';
            if (!reason) {
                message = 'Invoke action.enter() causes error';
            } else if (reason.message) {
                message = reason.message;
                if (reason.stack) {
                    message += '\n' + reason.stack;
                }
            } else if (window.JSON && typeof JSON.stringify === 'function') {
                try {
                    message = JSON.stringify(reason);
                } catch (parseJSONError) {
                    message = reason;
                }
            } else {
                message = reason;
            }
            var error = util.mix({
                    failType: 'EnterFail',
                    reason: message
                }, actionContext);
            this.getEventBus().fire('enteractionfail', error);
            this.getEventBus().notifyError(error);
        };
        notifyEnterFail = util.bind(notifyEnterFail, this);
        var entering = action.enter(actionContext);
        entering.then(notifyEnterComplete, notifyEnterFail);
        return entering;
    };
    exports.forward = function (url, container, options, isChildAction) {
        var actionContext = {
                url: url,
                container: container,
                isChildAction: !!isChildAction
            };
        if (isChildAction) {
            var referrerInfo = this.childActionMapping[container];
            actionContext.referrer = referrerInfo ? referrerInfo.url : null;
        } else {
            actionContext.referrer = this.currentURL;
        }
        util.mix(actionContext, options);
        actionContext.args = util.mix({}, actionContext);
        util.mix(actionContext.args, url.getQuery());
        this.getEventBus().fire('forwardaction', util.mix({ controller: this }, actionContext));
        var loader = this.loadAction(actionContext);
        assert.has(loader, 'loadAction should always return a Promise');
        return loader;
    };
    exports.renderAction = function (url) {
        if (typeof url === 'string') {
            url = URL.parse(url);
        }
        if (this.globalActionLoader && typeof this.globalActionLoader.abort === 'function') {
            this.globalActionLoader.abort();
        }
        if (this.currentAction && typeof this.currentAction.filterRedirect === 'function' && this.currentAction.filterRedirect(url) === false) {
            return Deferred.rejected('Redirect aborted by previous action');
        }
        this.globalActionLoader = this.forward(url, this.getMainContainer(), null, false);
        var events = this.getEventBus();
        return this.globalActionLoader.then(util.bind(this.enterAction, this)).fail(util.bind(events.notifyError, events));
    };
    function removeChildAction(controller, container, targetContext) {
        var info = controller.childActionMapping[container.id];
        if (!info) {
            return;
        }
        controller.childActionMapping[container.id] = undefined;
        if (info.hijack) {
            if (container.removeEventListener) {
                container.removeEventListener('click', info.hijack, false);
            } else {
                container.detachEvent('onclick', info.hijack);
            }
        }
        if (info.action) {
            if (!targetContext) {
                targetContext = {
                    url: null,
                    referrer: info.url,
                    container: container.id,
                    isChildAction: true
                };
            }
            controller.getEventBus().fire('leaveaction', {
                controller: controller,
                action: info.action,
                to: targetContext
            });
            if (typeof info.action.leave === 'function') {
                info.action.leave();
            }
        }
    }
    function addChildAction(controller, container, action, hijack, context) {
        removeChildAction(controller, container, context);
        if (container.addEventListener) {
            container.addEventListener('click', hijack, false);
        } else {
            container.attachEvent('onclick', hijack);
        }
        var info = {
                url: context.url,
                container: container.id,
                action: action,
                hijack: hijack
            };
        controller.childActionMapping[container.id] = info;
        var EventTarget = require('mini-event/EventTarget');
        if (action instanceof EventTarget) {
            action.on('leave', function () {
                removeChildAction(controller, container);
            });
        }
    }
    exports.enterChildAction = function (action, actionContext) {
        this.childActionLoaders[actionContext.container] = null;
        var container = document.getElementById(actionContext.container);
        if (!container) {
            return;
        }
        var locator = this.getLocator();
        var currentController = this;
        function redirect(url, options, extra) {
            options = options || {};
            var url = locator.resolveURL(url, options);
            if (options.global) {
                var container = document.getElementById(actionContext.container);
                var globalRedirectPerformed = locator.redirect(url, options);
                if (globalRedirectPerformed && container) {
                    removeChildAction(currentController, container);
                }
                return globalRedirectPerformed;
            }
            var childActionInfo = currentController.childActionMapping[actionContext.container];
            var changed = url.toString() !== childActionInfo.url.toString();
            var shouldPerformRedirect = changed || options.force;
            if (shouldPerformRedirect) {
                if (options.silent) {
                    childActionInfo.url = url;
                } else {
                    currentController.renderChildAction(url, childActionInfo.container, extra);
                }
            }
            return shouldPerformRedirect;
        }
        function isChildActionRedirected(e) {
            if (e.isChildActionRedirected) {
                return true;
            }
            var innermostContainer = e.target || e.srcElement;
            while (innermostContainer) {
                if (innermostContainer.id && currentController.childActionMapping[innermostContainer.id]) {
                    break;
                }
                innermostContainer = innermostContainer.parentNode;
            }
            if (innermostContainer.id !== actionContext.container) {
                e.isChildActionRedirected = true;
                return true;
            }
            return false;
        }
        function hijack(e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            if (target.nodeName.toLowerCase() !== 'a') {
                return;
            }
            var href = target.getAttribute('href', 2) || '';
            if (href.charAt(0) !== '#') {
                return;
            }
            if (isChildActionRedirected(e)) {
                return;
            }
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            var url = href.substring(1);
            var redirectAttributes = (target.getAttribute('data-redirect') || '').split(/[,\s]/);
            var redirectOptions = {};
            for (var i = 0; i < redirectAttributes.length; i++) {
                var redirectAttributeName = util.trim(redirectAttributes[i]);
                redirectOptions[redirectAttributeName] = true;
            }
            redirect(url, redirectOptions);
        }
        action.redirect = redirect;
        action.reload = function (extra) {
            this.redirect(actionContext.url, { force: true }, extra);
        };
        action.back = function (defaultURL, extra) {
            var referrer = this.context && this.context.referrer;
            var url = referrer || defaultURL;
            this.redirect(url, null, extra);
        };
        addChildAction(this, container, action, hijack, actionContext);
        return this.enterAction(action, actionContext);
    };
    exports.renderChildAction = function (url, container, options) {
        assert.has(container);
        if (typeof url === 'string') {
            url = URL.parse(url);
        }
        var previousLoader = this.childActionLoaders[container];
        if (previousLoader && typeof previousLoader.abort === 'function') {
            previousLoader.abort();
        }
        var actionInfo = this.childActionMapping[container];
        var previousAction = actionInfo && actionInfo.action;
        if (previousAction && typeof previousAction.filterRedirect === 'function' && previousAction.filterRedirect(url) === false) {
            return Deferred.rejected('Redirect aborted by previous action');
        }
        var loader = this.forward(url, container, options, true);
        var events = this.getEventBus();
        var loadingChildAction = loader.then(util.bind(this.enterChildAction, this)).fail(util.bind(events.notifyError, events));
        loadingChildAction.abort = loader.abort;
        this.childActionLoaders[container] = loadingChildAction;
        return loadingChildAction;
    };
    var Controller = require('eoo').create(require('mini-event/EventTarget'), exports);
    var instance = new Controller();
    instance.setLocator(require('./locator'));
    instance.setRouter(require('./router'));
    instance.setEventBus(require('./events'));
    instance.setPermissionProvider(require('./permission'));
    instance.Controller = Controller;
    return instance;
});