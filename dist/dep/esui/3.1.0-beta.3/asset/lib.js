define('esui/lib', [
    'require',
    'underscore',
    './lib/attribute',
    './lib/class',
    './lib/date',
    './lib/dom',
    './lib/event',
    './lib/lang',
    './lib/page',
    './lib/string'
], function (require) {
    var lib = {};
    var u = require('underscore');
    if (/msie (\d+\.\d+)/i.test(navigator.userAgent)) {
        lib.ie = document.documentMode || +RegExp.$1;
    }
    u.extend(lib, require('./lib/attribute'), require('./lib/class'), require('./lib/date'), require('./lib/dom'), require('./lib/event'), require('./lib/lang'), require('./lib/page'), require('./lib/string'));
    return lib;
});