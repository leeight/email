define([
    'require',
    '../tpl!../tpl/list.tpl.html',
    './BaseView',
    'underscore',
    'moment',
    'er/util'
], function (require) {
    require('../tpl!../tpl/list.tpl.html');
    var BaseView = require('./BaseView');
    var u = require('underscore');
    var moment = require('moment');
    function ListView() {
        BaseView.apply(this, arguments);
    }
    ListView.prototype.uiProperties = {};
    ListView.prototype.uiEvents = {};
    ListView.prototype.submitSearch = function (e) {
        var args = this.getSearchArgs();
        if (e.type === 'sort') {
            args.orderBy = e.field.field;
            args.order = e.order;
        }
        args.pageSize = this.get('pager').get('pageSize');
        this.fire('search', { args: args });
    };
    ListView.prototype.getSearchArgs = function () {
        var form = this.get('filter');
        var args = form ? form.getData() : {};
        args.order = this.model.get('order');
        args.orderBy = this.model.get('orderBy');
        var keyword = this.get('keyword');
        if (keyword) {
            args.keyword = u.trim(keyword.getValue());
        }
        var range = this.get('range');
        if (range) {
            range = range.getValue().split(',');
            args.startTime = moment(range[0]).format('YYYYMMDDHHmmss');
            args.endTime = moment(range[1]).format('YYYYMMDDHHmmss');
        }
        return args;
    };
    function updatePageIndex(e) {
        var page = e.target.get('page');
        this.fire('pagechange', { page: page });
    }
    ListView.prototype.updateBatchButtonStatus = function () {
        var items = this.getSelectedItems();
        this.getGroup('batch').set('disabled', u.isEmpty(items));
    };
    ListView.prototype.getSelectedItems = function () {
        var table = this.get('table');
        return table ? table.getSelectedItems() : [];
    };
    function batchModify(e) {
        var args = { type: e.target.getData('type') };
        this.fire('batchmodify', args);
    }
    ListView.prototype.bindEvents = function () {
        var pager = this.get('pager');
        if (pager) {
            pager.on('pagesizechange', this.submitSearch, this);
            pager.on('pagechange', updatePageIndex, this);
        }
        var table = this.get('table');
        if (table) {
            table.on('select', this.updateBatchButtonStatus, this);
            table.on('sort', this.submitSearch, this);
        }
        var filter = this.get('filter');
        if (filter) {
            filter.on('submit', this.submitSearch, this);
        }
        u.each(this.getGroup('batch'), function (button) {
            button.on('click', batchModify, this);
        }, this);
        BaseView.prototype.bindEvents.apply(this, arguments);
    };
    ListView.prototype.enterDocument = function () {
        BaseView.prototype.enterDocument.apply(this, arguments);
        this.updateBatchButtonStatus();
    };
    require('er/util').inherits(ListView, BaseView);
    return ListView;
});