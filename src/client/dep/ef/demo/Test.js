define(function (require) {
    var Action = require('er/Action');
    var Deferred = require('er/Deferred');
    var util = require('er/util');

    function Test() {
        Action.apply(this, arguments);
    }

    Test.prototype.enter = function () {
        console.log('enter test');
        var me = this;
        setTimeout(
            function () {
                var event = me.fire('test', { x: 1 });
                console.log(event.isDefaultPrevented());
                console.log(event.isPropagationStopped());
            },
            500
        );
        return Deferred.resolved();
    };

    util.inherits(Test, Action);
    return Test;
})