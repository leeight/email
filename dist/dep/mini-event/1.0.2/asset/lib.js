define('mini-event/lib', ['require'], function (require) {
    var lib = {};
    lib.extend = function (source) {
        for (var i = 1; i < arguments.length; i++) {
            var addition = arguments[i];
            if (!addition) {
                continue;
            }
            for (var key in addition) {
                if (addition.hasOwnProperty(key)) {
                    source[key] = addition[key];
                }
            }
        }
        return source;
    };
    return lib;
});