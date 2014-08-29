define('er/Model', [
    'require',
    './util',
    './Deferred',
    'eoo',
    'mini-event/EventTarget'
], function (require) {
    var util = require('./util');
    var Deferred = require('./Deferred');
    var SILENT = { silent: true };
    function loadData(model, options) {
        function addDataToModel(value) {
            if (options.dump) {
                model.fill(value, SILENT);
            } else {
                model.set(options.name, value, SILENT);
            }
            return {
                success: true,
                name: options.name,
                options: options,
                value: value
            };
        }
        function buildError(error) {
            return {
                success: false,
                name: options.name,
                options: options,
                error: error
            };
        }
        try {
            var value = options.retrieve(model, options);
            if (Deferred.isPromise(value)) {
                if (typeof value.abort === 'function') {
                    model.addPendingWorker(value);
                }
                return value.then(addDataToModel, function (error) {
                    error = buildError(error);
                    try {
                        var result = model.handleError(error);
                        return addDataToModel(result);
                    } catch (ex) {
                        if (ex.success === false) {
                            throw ex;
                        } else {
                            throw buildError(ex);
                        }
                    }
                });
            } else {
                var result = addDataToModel(value);
                return Deferred.resolved(result);
            }
        } catch (ex) {
            var error = buildError(ex);
            return Deferred.rejected(error);
        }
    }
    function loadSequence(model, datasource) {
        var loading = Deferred.resolved();
        for (var i = 0; i < datasource.length; i++) {
            var unit = datasource[i];
            var task = util.bind(load, null, model, unit);
            loading = loading.then(task);
        }
        return loading;
    }
    function loadParallel(model, datasource) {
        var workers = [];
        for (var name in datasource) {
            if (datasource.hasOwnProperty(name)) {
                var unit = datasource[name];
                if (typeof unit === 'function') {
                    unit = {
                        retrieve: unit,
                        name: name
                    };
                } else if (typeof unit.retrieve === 'function') {
                    unit = util.mix({ name: name }, unit);
                }
                workers.push(load(model, unit));
            }
        }
        return Deferred.all(workers);
    }
    function load(model, datasource) {
        if (!datasource) {
            return Deferred.resolved();
        }
        if (typeof datasource === 'function') {
            var options = {
                    retrieve: datasource,
                    dump: true
                };
            return loadData(model, options);
        }
        if (datasource instanceof Array) {
            return loadSequence(model, datasource);
        }
        if (typeof datasource.retrieve === 'function') {
            return loadData(model, datasource);
        }
        return loadParallel(model, datasource);
    }
    var exports = {};
    exports.constructor = function (context) {
        this.store = {};
        this.pendingWorkers = [];
        if (context) {
            this.fill(context, SILENT);
        }
        this.initialize();
    };
    exports.initialize = util.noop;
    function removePendingWorker(model, worker) {
        for (var i = 0; i < model.pendingWorkers.length; i++) {
            if (model.pendingWorkers[i] === worker) {
                model.pendingWorkers.splice(i, 1);
                return;
            }
        }
    }
    exports.addPendingWorker = function (worker) {
        this.pendingWorkers.push(worker);
        worker.ensure(util.bind(removePendingWorker, null, this, worker));
    };
    exports.datasource = null;
    exports.getDatasource = function () {
        return this.datasource;
    };
    function forwardToPrepare() {
        function processError(ex) {
            var error = {
                    success: false,
                    name: '$prepare',
                    options: {},
                    error: ex
                };
            throw error;
        }
        try {
            var preparing = this.prepare();
            if (Deferred.isPromise(preparing)) {
                return preparing.fail(processError);
            } else {
                return preparing;
            }
        } catch (ex) {
            processError(ex);
        }
    }
    exports.load = function () {
        try {
            var datasource = this.getDatasource();
            var loading = load(this, datasource);
            return loading.then(util.bind(forwardToPrepare, this));
        } catch (ex) {
            return Deferred.rejected(ex);
        }
    };
    exports.prepare = util.noop;
    exports.get = function (name) {
        return this.store[name];
    };
    function setProperty(model, name, value) {
        var type = model.store.hasOwnProperty(name) ? 'change' : 'add';
        var oldValue = model.store[name];
        model.store[name] = value;
        if (oldValue !== value) {
            return {
                type: type,
                name: name,
                oldValue: oldValue,
                newValue: value
            };
        }
        return null;
    }
    exports.set = function (name, value, options) {
        options = options || {};
        var record = setProperty(this, name, value);
        if (record && !options.silent) {
            var event = { changes: [record] };
            this.fire('change', event);
        }
        return value;
    };
    exports.fill = function (extension, options) {
        options = options || {};
        var changes = [];
        for (var name in extension) {
            if (extension.hasOwnProperty(name)) {
                var record = setProperty(this, name, extension[name]);
                if (record) {
                    changes.push(record);
                }
            }
        }
        if (changes.length && !options.silent) {
            var event = { changes: changes };
            this.fire('change', event);
        }
        return extension;
    };
    exports.remove = function (name, options) {
        if (!this.store.hasOwnProperty(name)) {
            return;
        }
        options = options || {};
        var value = this.store[name];
        delete this.store[name];
        if (!options.silent) {
            var event = {
                    changes: [{
                            type: 'remove',
                            name: name,
                            oldValue: value,
                            newValue: undefined
                        }]
                };
            this.fire('change', event);
        }
        return value;
    };
    exports.getAsModel = function (name) {
        var value = this.get(name);
        if (!value || {}.toString.call(value) !== '[object Object]') {
            return new Model();
        } else {
            return new Model(value);
        }
    };
    exports.dump = function () {
        return util.mix({}, this.store);
    };
    exports.has = function (name) {
        return this.store.hasOwnProperty(name);
    };
    exports.hasValue = function (name) {
        return this.has(name) && this.store[name] != null;
    };
    exports.hasReadableValue = function (name) {
        return this.hasValue(name) && this.store[name] !== '';
    };
    exports.valueOf = function () {
        return this.dump();
    };
    exports.clone = function () {
        return new Model(this.store);
    };
    exports.handleError = function (error) {
        throw error;
    };
    exports.dispose = function () {
        if (this.pendingWorkers) {
            for (var i = 0; i < this.pendingWorkers.length; i++) {
                var worker = this.pendingWorkers[i];
                if (typeof worker.abort === 'function') {
                    try {
                        worker.abort();
                    } catch (ex) {
                    }
                }
            }
            this.pendingWorkers = null;
        }
    };
    var Model = require('eoo').create(require('mini-event/EventTarget'), exports);
    return Model;
});