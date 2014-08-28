/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    // require template
    require('bat-ria/tpl!./compose.tpl.html');

    var FormView = require('bat-ria/mvc/FormView');
    var ueditorInstance = null;

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

    MailComposeView.prototype.enterDocument = function() {
        FormView.prototype.enterDocument.apply(this, arguments);

        if (ueditorInstance) {
            ueditorInstance.destroy();
        }
        ueditorInstance = UE.getEditor('email-body-editor');
        var message = this.model.get('message');
        if (message) {
            ueditorInstance.ready(function(editor) {
                ueditorInstance.setContent(message);
                ueditorInstance.focus();
            });
        } else {
            var to = this.get('to');
            var input = to.getFocusTarget();
            if (input) {
                input.focus();
            }
        }
    };

    MailComposeView.prototype.getExtraFormData = function() {
        return {
            message: ueditorInstance.getContent()
        }
    };

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
