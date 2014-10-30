/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

/* jshint: GLOBAL: CKEDITOR */

define(function (require) {
    // require template
    require('bat-ria/tpl!./compose.tpl.html');
    require('ckeditor/plugins/autoupload');

    var FormView = require('bat-ria/mvc/FormView');
    var lib = require('esui/lib');
    var u = require('underscore');

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
        var model = this.model;
        var onNewAttachment = u.bind(this._onNewAttachment, this);

        window.xyz = this;

        var editor = CKEDITOR.replace('email-body-editor', {
            removePlugins: 'elementspath',
            extraPlugins: 'autoupload,colorbutton',
            // enterMode: CKEDITOR.ENTER_BR,
            contentsCss: require.toUrl('common/css/ckeditor.less')
        });
        editor.on('newAttachment', onNewAttachment);

        lib.on('newAttachment', 'change', function() {
            u.each(this.files, function(file) {
                model.uploadAttachment(file).then(onNewAttachment);
            });
        });

        var message = this.model.get('message');
        if (message) {
            editor.setData(message);
        }
        else {
            var to = this.get('to');
            var input = to.getFocusTarget();
            if (input) {
                input.focus();
            }
        }
    };

    MailComposeView.prototype._onNewAttachment = function(e) {
        var name = e.data.name;
        // downloads/00000/att/b9c834ecf9593cb59f393f3cd0ba2f8e.pdf
        var url = e.data.url.replace('downloads/', '');

        var ui = this.get('attachments');
        var ds = ui.get('datasource');
        var rv = ui.get('rawValue');

        ds.push({
            title: name,
            value: url,
            checked: true
        });
        rv.push(url);

        ui.setProperties({
            'datasource': ds,
            'rawValue': rv
        });
        ui.repaint();
    };

    /**
     * @returns {Object} .
     */
    MailComposeView.prototype.getExtraFormData = function() {
        return {
            message: CKEDITOR.instances['email-body-editor'].getData()
        };
    };

    /**
     * @inheritDoc
     * @returns {Object} .
     */
    MailComposeView.prototype.getUIProperties = function() {
        var attachments = this.model.get('attachments') || [];
        var rawValue = u.map(attachments, function(item) {
            return item.value;
        });

        var uiProperties = {
            cc: {
                value: '@cc'
            },
            to: {
                value: '@to'
            },
            attachments: {
                datasource: attachments,
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
        timer = setTimeout(function() {
            var keyword = control.getChild('input').getValue();
            if (u.trim(keyword).length) {
                view.model.getContacts(u.trim(keyword)).then(function(contacts) {
                    control.set('suggestions', contacts);
                });
            }
            else {
                control.set('suggestions', []);
            }
        }, 300);
        control.set('_delayTimer', timer);
    }

    /**
     * @inheritDoc
     */
    MailComposeView.prototype.uiEvents = {
        'to:input': function(e) {
            displaySuggestions(this, e.target);
        },
        'cc:input': function(e) {
            displaySuggestions(this, e.target);
        },
        'addAtt:click': function(e) {
            // https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
            lib.g('newAttachment').click();
        }
    };

    require('er/util').inherits(MailComposeView, FormView);
    return MailComposeView;
});
