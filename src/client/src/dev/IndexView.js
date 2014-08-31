/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    // require template
    require('bat-ria/tpl!./index.tpl.html');

    var BaseView = require('bat-ria/mvc/BaseView');

    /**
     * [Please Input View Description]
     *
     * @constructor
     */
    function DevIndexView() {
        BaseView.apply(this, arguments);
    }

    /**
     * @inheritDoc
     */
    DevIndexView.prototype.template = 'TPL_dev_index';

    /**
     * @inheritDoc
     */
    DevIndexView.prototype.uiProperties = {
        mai: {
            value: [
                {
                    name: '李玉北',
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
                {title: 'foo', value: 'foo', checked: true},
                {title: 'bar', value: 'bar', checked: true},
                {title: 'bar2', value: 'bar2', checked: true},
            ]
        }
    };

    /**
     * @inheritDoc
     */
    DevIndexView.prototype.uiEvents = {
        'get:click': function() {
            console.log(this.get('mai').getValue());
        },
        'attachments:change': function() {
            console.log(this.get('attachments').getRawValue());
        }
    };

    require('er/util').inherits(DevIndexView, BaseView);
    return DevIndexView;
});
