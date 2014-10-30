/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var ListAction = require('bat-ria/mvc/ListAction');
    var u = require('underscore');
    var locator = require('er/locator');


    /**
     * Action构造函数
     *
     * @constructor
     */
    function MailSearch() {
        ListAction.apply(this, arguments);
    }

    MailSearch.prototype.modelType = require('./SearchModel');
    MailSearch.prototype.viewType = require('./SearchView');

    /**
     * inheritDoc
     *
     * @protected
     * @override
     */
    MailSearch.prototype.initBehavior = function () {
        ListAction.prototype.initBehavior.apply(this, arguments);


        this.view.on('batchmodify', function(e) {
            var ids = u.map(e.selectedItems, function(item) {
                return item.id;
            });

            var action = e.action;
            if (action === 'markAsRead') {
                this.model.markAsRead(ids).then(function() {
                    locator.reload();
                });
            } else if (action === 'delete') {
                this.model.deleteMails(ids).then(function() {
                    locator.reload();
                });
            }
        });
    };

    require('er/util').inherits(MailSearch, ListAction);
    return MailSearch;
});
