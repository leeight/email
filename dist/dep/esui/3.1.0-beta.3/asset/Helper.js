define('esui/Helper', [
    'require',
    'underscore',
    './helper/children',
    './helper/dom',
    './helper/event',
    './helper/html',
    './helper/life',
    './helper/template'
], function (require) {
    var u = require('underscore');
    function Helper(control) {
        this.control = control;
    }
    u.extend(Helper.prototype, require('./helper/children'), require('./helper/dom'), require('./helper/event'), require('./helper/html'), require('./helper/life'), require('./helper/template'));
    return Helper;
});