define('esui/extension/Command', [
    'require',
    'underscore',
    '../lib',
    '../Extension',
    'mini-event',
    '../main'
], function (require) {
    var u = require('underscore');
    var lib = require('../lib');
    var Extension = require('../Extension');
    function Command(options) {
        options = options || {};
        if (!options.events) {
            options.events = ['click'];
        } else {
            options.events = lib.splitTokenList(options.events);
        }
        Extension.apply(this, arguments);
    }
    Command.prototype.type = 'Command';
    Command.prototype.handleCommand = function (e) {
        var target = e.target;
        var endpoint = this.main && this.main.parentNode;
        while (target && target !== endpoint) {
            if (target.nodeType === 1 && (target.disabled !== true || e.type !== 'click')) {
                var commandName = target.getAttribute('data-command');
                if (commandName) {
                    var args = target.getAttribute('data-command-args');
                    var event = require('mini-event').fromDOMEvent(e, 'command', {
                            name: commandName,
                            triggerType: e.type,
                            args: args
                        });
                    event = this.fire('command', event);
                    if (event.isPropagationStopped()) {
                        return;
                    }
                }
            }
            target = target.parentNode;
        }
    };
    Command.prototype.activate = function () {
        for (var i = 0; i < this.events.length; i++) {
            this.target.helper.addDOMEvent(this.target.main, this.events[i], this.handleCommand);
        }
        Extension.prototype.activate.apply(this, arguments);
    };
    Command.prototype.inactivate = function () {
        for (var i = 0; i < this.events.length; i++) {
            this.target.helper.removeDOMEvent(this.target.main, this.events[i], this.handleCommand);
        }
        Extension.prototype.inactivate.apply(this, arguments);
    };
    Command.createDispatcher = function (config) {
        var map = config;
        if (u.isArray(config)) {
            map = {};
            for (var i = 0; i < config.length; i++) {
                var item = config[i];
                var name = item.triggerType ? item.triggerType + ':' + item.name : item.name;
                map[name] = item.handler;
            }
        }
        return function (e) {
            var handler = map[e.triggerType + ':' + e.name];
            if (!handler) {
                handler = map[e.name];
            }
            if (!handler) {
                var method = 'execute' + lib.pascalize(e.name) + lib.pascalize(e.triggerType);
                handler = this[method];
            }
            if (typeof handler !== 'function') {
                var method = 'execute' + lib.pascalize(e.name);
                handler = this[method];
            }
            if (typeof handler !== 'function') {
                handler = map[e.triggerType + ':*'];
            }
            if (!handler) {
                handler = map['*'];
            }
            if (typeof handler === 'function') {
                handler.apply(this, arguments);
            }
        };
    };
    lib.inherits(Command, Extension);
    require('../main').registerExtension(Command);
    return Command;
});