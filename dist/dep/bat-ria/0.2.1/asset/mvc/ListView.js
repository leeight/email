define('bat-ria/mvc/ListView', [
    'require',
    '../tpl!../tpl/list.tpl.html',
    './BaseView',
    'underscore',
    'moment',
    'esui/Button',
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
        var pager = this.get('pager');
        if (pager) {
            args.pageSize = pager.get('pageSize');
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
        this.getGroup('batch').set('readOnly', u.isEmpty(items));
    };
    ListView.prototype.getSelectedItems = function () {
        var table = this.get('table');
        return table ? table.getSelectedItems() : [];
    };
    function batchModify(e) {
        var args = {
                action: e.target.getData('type'),
                selectedItems: this.get('table').getSelectedItems()
            };
        this.fire('batchmodify', args);
    }
    function sidebarModeChange(e) {
        var neighbor = document.getElementById('neighbor');
        if (!neighbor) {
            return;
        }
        if (e.mode === 'fixed') {
            neighbor.className = 'ui-sidebar-neighbor';
        } else {
            neighbor.className = 'ui-sidebar-neighbor-hide';
        }
        this.adjustLayout();
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
        var sidebar = this.get('sidebar');
        if (sidebar) {
            sidebar.on('modechange', sidebarModeChange, this);
        }
        u.each(this.getGroup('batch'), function (button) {
            if (button instanceof require('esui/Button')) {
                button.on('click', batchModify, this);
            }
        }, this);
        BaseView.prototype.bindEvents.apply(this, arguments);
    };
    ListView.prototype.enterDocument = function () {
        BaseView.prototype.enterDocument.apply(this, arguments);
        this.updateBatchButtonStatus();
        this.adjustLayout();
    };
    ListView.prototype.adjustLayout = function () {
        var table = this.get('table');
        if (table) {
            table.adjustWidth();
        }
    };
    ListView.prototype.refresh = function () {
        this.refreshList();
        this.refreshAuth();
    };
    ListView.prototype.refreshList = function () {
        var model = this.model;
        var table = this.get('table');
        if (table) {
            table.setDatasource(model.get('tableData'));
        }
        var pager = this.get('pager');
        if (pager) {
            pager.setProperties({
                count: model.get('totalCount'),
                page: model.get('pageNo'),
                pageSize: model.get('pageSize')
            }, { silent: true });
        }
    };
    require('er/util').inherits(ListView, BaseView);
    return ListView;
});