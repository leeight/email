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
    DevIndexView.prototype.uiProperties = {
        mai: {
            value: [
                {
                    name: '\u674E\u7389\u5317',
                    address: 'liyubei@baidu.com'
                },
                {
                    name: 'leeight',
                    address: 'leeight@gmail.com'
                }
            ]
        },
        attachments: {
            datasource: [
                {
                    title: 'foo',
                    value: 'foo',
                    checked: true
                },
                {
                    title: 'bar',
                    value: 'bar',
                    checked: true
                },
                {
                    title: 'bar2',
                    value: 'bar2',
                    checked: true
                }
            ]
        }
    };
    DevIndexView.prototype.uiEvents = {
        'get:click': function () {
            console.log(this.get('mai').getValue());
        },
        'attachments:change': function () {
            console.log(this.get('attachments').getRawValue());
        }
    };
    require('er/util').inherits(DevIndexView, BaseView);
    return DevIndexView;
});