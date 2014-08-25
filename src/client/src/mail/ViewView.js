/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    // require template
    require('bat-ria/tpl!./view.tpl.html');

    var BaseView = require('bat-ria/mvc/BaseView');
    
    /**
     * [Please Input View Description]
     * 
     * @constructor
     */
    function MailViewView() {
        BaseView.apply(this, arguments);
    }
    
    /**
     * @inheritDoc
     */
    MailViewView.prototype.template = 'TPL_mail_view';

    /**
     * @inheritDoc
     */
    MailViewView.prototype.uiProperties = {

    };

    /**
     * @inheritDoc
     */
    MailViewView.prototype.uiEvents = {};

    require('er/util').inherits(MailViewView, BaseView);
    return MailViewView;
});
