define('er/events', [
    'require',
    'eoo',
    'mini-event/EventTarget'
], function (require) {
    var exports = {};
    exports.notifyError = function (error) {
        if (typeof error === 'string') {
            error = new Error(error);
        }
        this.fire('error', { error: error });
        return error;
    };
    var EventBus = require('eoo').create(require('mini-event/EventTarget'), exports);
    var instance = new EventBus();
    instance.EventBus = EventBus;
    return instance;
});