define('bat-ria/mvc/NotFoundView', [
    'require',
    '../tpl!../tpl/not_found.tpl.html',
    'er/util',
    'er/View'
], function (require) {
    require('../tpl!../tpl/not_found.tpl.html');
    var util = require('er/util');
    var View = require('er/View');
    function NotFoundView() {
        View.apply(this, arguments);
    }
    util.inherits(NotFoundView, View);
    NotFoundView.prototype.template = 'TPL_not_found';
    return NotFoundView;
});