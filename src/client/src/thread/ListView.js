/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    // require template
    require('bat-ria/tpl!./list.tpl.html');
    var util = require('common/util');
    var locator = require('er/locator');
    var ListView = require('bat-ria/mvc/ListView');

    /**
     * [Please Input View Description]
     *
     * @constructor
     */
    function ThreadListView() {
        ListView.apply(this, arguments);
    }

    /**
     * @inheritDoc
     */
    ThreadListView.prototype.template = 'TPL_thread_list';

    function getTableProperties() {
        var config = util.mailListConfiguration(function (item) {
            return '#/thread/view~id=' + item.id + '&count=' + item.mids.split(',').length;
        });
        var column =  {
            field: 'count',
            width: 10,
            title: 'Count',
            content: function (item) {
                return item.mids.split(',').length;
            }
        };

        // config.fields.splice(1, 0, column);
        // config.fields[3].width = 550;

        return config;
    }
    /**
     * @inheritDoc
     */
    ThreadListView.prototype.uiProperties = {
        table: getTableProperties()
    };

    /**
     * @inheritDoc
     */
    ThreadListView.prototype.uiEvents = {
        'refresh:click': function() {
            locator.reload();
        }
    };

    require('er/util').inherits(ThreadListView, ListView);
    return ThreadListView;
});
