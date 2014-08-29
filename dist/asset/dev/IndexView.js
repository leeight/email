define('dev/IndexView', [
    'require',
    'bat-ria/tpl!./index.tpl.html',
    'bat-ria/mvc/BaseView',
    'er/util'
], function (require) {
    require('bat-ria/tpl!./index.tpl.html');
    var BaseView = require('bat-ria/mvc/BaseView');
    function DevIndexView() {
        BaseView.apply(this, arguments);
    }
    DevIndexView.prototype.template = 'TPL_dev_index';
    DevIndexView.prototype.uiProperties = {};
    DevIndexView.prototype.uiEvents = {};
    require('er/util').inherits(DevIndexView, BaseView);
    return DevIndexView;
});