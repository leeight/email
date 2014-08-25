/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    // require template
    require('bat-ria/tpl!./compose.tpl.html');

    var FormView = require('bat-ria/mvc/FormView');
    
    /**
     * [Please Input View Description]
     * 
     * @constructor
     */
    function MailComposeView() {
        FormView.apply(this, arguments);
    }
    
    /**
     * @inheritDoc
     */
    MailComposeView.prototype.template = 'TPL_mail_compose';

    /**
     * @inheritDoc
     */
    MailComposeView.prototype.uiProperties = {

    };

    /**
     * @inheritDoc
     */
    MailComposeView.prototype.uiEvents = {};

    require('er/util').inherits(MailComposeView, FormView);
    return MailComposeView;
});
