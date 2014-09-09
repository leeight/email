/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    // require template
    require('bat-ria/tpl!./search.tpl.html');
    var util = require('common/util');
    var locator = require('er/locator');
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

    /**
     * @inheritDoc
     */
    MailSearchView.prototype.uiEvents = {
        'refresh:click': function() {
            locator.reload();
        }
    };

    require('er/util').inherits(MailSearchView, ListView);
    return MailSearchView;
});
