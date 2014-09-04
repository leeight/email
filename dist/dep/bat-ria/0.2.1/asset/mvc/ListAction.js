define('bat-ria/mvc/ListAction', [
    'require',
    './BaseAction',
    'er/util',
    'underscore',
    'er/URL'
], function (require) {
    var BaseAction = require('./BaseAction');
    var util = require('er/util');
    var u = require('underscore');
    var URL = require('er/URL');
    function ListAction() {
        BaseAction.apply(this, arguments);
    }
    util.inherits(ListAction, BaseAction);
    ListAction.prototype.redirectAfterChange = true;
    ListAction.prototype.performSearch = function (args) {
        var defaultArgs = this.model.getDefaultArgs();
        var extraArgs = this.model.getExtraQuery();
        args = u.chain(args).extend(extraArgs).purify(defaultArgs).value();
        var event = this.fire('search', { args: args });
        if (!event.isDefaultPrevented()) {
            this.redirectForSearch(args);
        }
    };
    ListAction.prototype.redirectForSearch = function (args) {
        var path = this.model.get('url').getPath();
        var url = URL.withQuery(path, args);
        this.loadList(url);
    };
    ListAction.prototype.getURLForPage = function (pageNo) {
        var url = this.model.get('url');
        var path = url.getPath();
        var query = url.getQuery();
        query.pageNo = pageNo;
        if (pageNo === 1) {
            query = u.omit(query, 'pageNo');
        }
        return require('er/URL').withQuery(path, query);
    };
    function search(e) {
        this.performSearch(e.args);
    }
    function forwardToPage(e) {
        var event = this.fire('pagechange', { page: e.page });
        if (!event.isDefaultPrevented()) {
            var url = this.getURLForPage(e.page);
            this.loadList(url);
        }
    }
    ListAction.prototype.loadList = function (url) {
        if (this.redirectAfterChange) {
            this.redirect(url, { force: true });
        } else {
            var me = this;
            url = url || me.model.get('url');
            return me.model.loadData(url).then(function () {
                me.redirect(url, { silent: true });
                me.view.refresh();
            });
        }
    };
    ListAction.prototype.initBehavior = function () {
        BaseAction.prototype.initBehavior.apply(this, arguments);
        this.view.on('search', search, this);
        this.view.on('pagechange', forwardToPage, this);
    };
    ListAction.prototype.reload = function () {
        if (this.redirectAfterChange) {
            BaseAction.prototype.reload.call(this);
        } else {
            this.loadList();
        }
    };
    ListAction.prototype.adjustLayout = function () {
        this.view.adjustLayout();
    };
    return ListAction;
});