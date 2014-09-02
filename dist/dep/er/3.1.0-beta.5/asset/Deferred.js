define('er/Deferred', [
    'require',
    './util',
    './assert',
    'eoo',
    'mini-event/EventTarget'
], function (require) {
    var util = require('./util');
    var assert = require('./assert');
    var setImmediate = typeof window.setImmediate === 'function' ? function (fn) {
            window.setImmediate(fn);
        } : function (fn) {
            window.setTimeout(fn, 0);
        };
    function tryFlush(deferred) {
        if (deferred.state === 'pending') {
            return;
        }
        var callbacks = deferred.state === 'resolved' ? deferred._doneCallbacks.slice() : deferred._failCallbacks.slice();
        function flush() {
            for (var i = 0; i < callbacks.length; i++) {
                var callback = callbacks[i];
                try {
                    callback.apply(deferred.promise, deferred._args);
                } catch (ex) {
                }
            }
        }
        if (deferred.syncModeEnabled) {
            flush();
        } else {
            setImmediate(flush);
        }
        deferred._doneCallbacks = [];
        deferred._failCallbacks = [];
    }
    function pipe(original, deferred, callback, actionType) {
        return function () {
            if (typeof callback === 'function') {
                var resolver = deferred.resolver;
                try {
                    var returnValue = callback.apply(original.promise, arguments);
                    if (Deferred.isPromise(returnValue)) {
                        returnValue.then(resolver.resolve, resolver.reject);
                    } else {
                        resolver.resolve(returnValue);
                    }
                } catch (error) {
                    Deferred.fire('exception', {
                        deferred: original,
                        args: [error],
                        reason: error
                    });
                    resolver.reject(error);
                }
            } else {
                deferred[actionType].apply(deferred, original._args);
            }
        };
    }
    var exports = {};
    exports.constructor = function () {
        this.state = 'pending';
        this._args = null;
        this._doneCallbacks = [];
        this._failCallbacks = [];
        this.promise = {
            done: util.bind(this.done, this),
            fail: util.bind(this.fail, this),
            ensure: util.bind(this.ensure, this),
            then: util.bind(this.then, this)
        };
        this.promise.promise = this.promise;
        this.resolver = {
            resolve: util.bind(this.resolve, this),
            reject: util.bind(this.reject, this)
        };
    };
    exports.syncModeEnabled = false;
    exports.resolve = function () {
        if (this.state !== 'pending') {
            return;
        }
        this.state = 'resolved';
        this._args = [].slice.call(arguments);
        Deferred.fire('resolve', {
            deferred: this,
            args: this._args,
            reason: this._args[0]
        });
        tryFlush(this);
    };
    exports.reject = function () {
        if (this.state !== 'pending') {
            return;
        }
        this.state = 'rejected';
        this._args = [].slice.call(arguments);
        Deferred.fire('reject', {
            deferred: this,
            args: this._args,
            reason: this._args[0]
        });
        tryFlush(this);
    };
    exports.done = function (callback) {
        return this.then(callback);
    };
    exports.fail = function (callback) {
        return this.then(null, callback);
    };
    exports.ensure = function (callback) {
        return this.then(callback, callback);
    };
    exports.then = function (done, fail) {
        var deferred = new Deferred();
        deferred.syncModeEnabled = this.syncModeEnabled;
        this._doneCallbacks.push(pipe(this, deferred, done, 'resolve'));
        this._failCallbacks.push(pipe(this, deferred, fail, 'reject'));
        tryFlush(this);
        return deferred.promise;
    };
    var Deferred = require('eoo').create(exports);
    require('mini-event/EventTarget').enable(Deferred);
    Deferred.isPromise = function (value) {
        return value && typeof value.then === 'function';
    };
    Deferred.all = function () {
        var workingUnits = [].concat.apply([], arguments);
        var workingCount = workingUnits.length;
        if (!workingCount) {
            return Deferred.resolved();
        }
        var actionType = 'resolve';
        var result = [];
        var jointDeferred = new Deferred();
        function resolveOne(whichToFill) {
            workingCount--;
            assert.greaterThanOrEquals(workingCount, 0, 'workingCount should be positive');
            var unitResult = [].slice.call(arguments, 1);
            if (unitResult.length <= 1) {
                unitResult = unitResult[0];
            }
            result[whichToFill] = unitResult;
            if (workingCount === 0) {
                jointDeferred[actionType].apply(jointDeferred, result);
            }
        }
        function rejectOne() {
            actionType = 'reject';
            resolveOne.apply(this, arguments);
        }
        for (var i = 0; i < workingUnits.length; i++) {
            var unit = workingUnits[i];
            unit.then(util.bind(resolveOne, unit, i), util.bind(rejectOne, unit, i));
        }
        return jointDeferred.promise;
    };
    Deferred.resolved = function () {
        var deferred = new Deferred();
        deferred.resolve.apply(deferred, arguments);
        return deferred.promise;
    };
    Deferred.rejected = function () {
        var deferred = new Deferred();
        deferred.reject.apply(deferred, arguments);
        return deferred.promise;
    };
    Deferred.when = function (value) {
        if (Deferred.isPromise(value)) {
            return value;
        }
        var deferred = new Deferred();
        deferred.syncModeEnabled = true;
        deferred.resolve(value);
        return deferred.promise;
    };
    Deferred.require = function (modules) {
        var deferred = new Deferred();
        window.require(modules, deferred.resolver.resolve);
        deferred.promise.abort = deferred.resolver.reject;
        return deferred.promise;
    };
    return Deferred;
});