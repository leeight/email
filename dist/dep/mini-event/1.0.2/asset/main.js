define('mini-event/main', [
    'require',
    './Event'
], function (require) {
    var Event = require('./Event');
    return {
        version: '1.0.2',
        Event: Event,
        fromDOMEvent: Event.fromDOMEvent,
        fromEvent: Event.fromEvent,
        delegate: Event.delegate
    };
});

define('mini-event', ['mini-event/main'], function ( main ) { return main; });