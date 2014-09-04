define('bat-ria/mvc/ForbiddenView', [
    'require',
    '../tpl!../tpl/forbidden.tpl.html',
    'er/util',
    'er/View'
], function (require) {
    require('../tpl!../tpl/forbidden.tpl.html');
    var util = require('er/util');
    var View = require('er/View');
    function ForbiddenView() {
        View.apply(this, arguments);
    }
    util.inherits(ForbiddenView, View);
    ForbiddenView.prototype.template = 'TPL_forbidden';
    return ForbiddenView;
});