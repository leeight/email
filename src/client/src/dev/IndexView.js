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

    };

    /**
     * @inheritDoc
     */
    DevIndexView.prototype.uiEvents = {};

    require('er/util').inherits(DevIndexView, BaseView);
    return DevIndexView;
});
