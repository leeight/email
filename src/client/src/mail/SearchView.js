/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    // require template
    require('bat-ria/tpl!./search.tpl.html');
    var util = require('common/util');
    var locator = require('er/locator');
    var lib = require('esui/lib');
    var esui = require('esui');
    var ListView = require('bat-ria/mvc/ListView');

    /**
     * [Please Input View Description]
     *
     * @constructor
     */
    function MailSearchView() {
        ListView.apply(this, arguments);
    }

    /**
     * @inheritDoc
     */
    MailSearchView.prototype.template = 'TPL_mail_search';

    /**
     * @inheritDoc
     */
    MailSearchView.prototype.uiProperties = {
        table: util.mailListConfiguration()
    };

    var lastSelectedRowIndex = -1;
    var running = false;

    /**
     * @inheritDoc
     */
    MailSearchView.prototype.uiEvents = {
        'table:select': function() {
            var evt = esui.getEventObject();
            if (evt) {
                var target = evt.target || evt.srcElement;
                if (target.nodeName === 'INPUT') {
                    var index = parseInt(target.getAttribute('data-index'), 10);
                    if (evt.shiftKey === true && !running) {
                        running = true;

                        var table = this.get('table');
                        var begin = Math.min(index, lastSelectedRowIndex);
                        var end = Math.max(index, lastSelectedRowIndex);

                        for (var i = begin + 1; i < end; i ++) {
                            table.setRowSelected(i, true);
                        }

                        running = false;
                    }
                    lastSelectedRowIndex = index;
                }
            }
        },
        'refresh:click': function() {
            locator.reload();
        }
    };


    MailSearchView.prototype.enterDocument = function() {
        ListView.prototype.enterDocument.apply(this, arguments);

        var view = this;
        view.get('table').addHandlers('click', {
            handler: function(element, e) {
                if (lib.hasClass(element, 'fa-star-o')) {
                    view.fire('addStar', element);
                }
                else {
                    view.fire('removeStar', element);
                }
            },
            matchFn: function(element) {
                return lib.hasClass(element, 'fa-star-o') ||
                lib.hasClass(element, 'fa-star');
            }
        });
    };

    require('er/util').inherits(MailSearchView, ListView);
    return MailSearchView;
});
