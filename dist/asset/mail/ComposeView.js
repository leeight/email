define('mail/ComposeView', [
    'require',
    'bat-ria/tpl!./compose.tpl.html',
    'bat-ria/mvc/FormView',
    'underscore',
    'er/util'
], function (require) {
    require('bat-ria/tpl!./compose.tpl.html');
    var FormView = require('bat-ria/mvc/FormView');
    var u = require('underscore');
    var ueditorInstance = null;
    function MailComposeView() {
        FormView.apply(this, arguments);
    }
    MailComposeView.prototype.template = 'TPL_mail_compose';
    MailComposeView.prototype.enterDocument = function () {
        FormView.prototype.enterDocument.apply(this, arguments);
        if (ueditorInstance) {
            ueditorInstance.destroy();
        }
        ueditorInstance = UE.getEditor('email-body-editor');
        var message = this.model.get('message');
        if (message) {
            ueditorInstance.ready(function (editor) {
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
    MailComposeView.prototype.getExtraFormData = function () {
        return { message: ueditorInstance.getContent() };
    };
    MailComposeView.prototype.getUIProperties = function () {
        var rawValue = u.map(this.model.get('attachments'), function (item) {
                return item.value;
            });
        var uiProperties = {
                cc: { value: '@cc' },
                to: { value: '@to' },
                attachments: {
                    datasource: '@attachments',
                    rawValue: rawValue
                }
            };
        return uiProperties;
    };
    function displaySuggestions(view, control) {
        var timer = control.get('_delayTimer');
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            var keyword = control.getChild('input').getValue();
            if (u.trim(keyword).length) {
                view.model.getContacts(u.trim(keyword)).then(function (contacts) {
                    control.set('suggestions', contacts);
                });
            } else {
                control.set('suggestions', []);
            }
        }, 300);
        control.set('_delayTimer', timer);
    }
    MailComposeView.prototype.uiEvents = {
        'to:input': function (e) {
            displaySuggestions(this, e.target);
        },
        'cc:input': function (e) {
            displaySuggestions(this, e.target);
        }
    };
    require('er/util').inherits(MailComposeView, FormView);
    return MailComposeView;
});