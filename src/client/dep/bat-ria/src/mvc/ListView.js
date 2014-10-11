/**
 * @file 列表类型`View`基类
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    // require template
    require('../tpl!../tpl/list.tpl.html');

    var BaseView = require('./BaseView');
    var u = require('underscore');
    var moment = require('moment');

    /**
     * 列表`View`基类
     *
     * @constructor
     * @extends ef/BaseView
     */
    function ListView() {
        BaseView.apply(this, arguments);
    }

    /**
     * @inheritDoc
     */
    ListView.prototype.uiProperties = {};

    /**
     * @inheritDoc
     */
    ListView.prototype.uiEvents = {};

    /**
     * 收集查询参数并触发查询事件
     *
     * @param {mini-event.Event} e 控件事件对象
     */
    ListView.prototype.submitSearch = function (e) {
        var args = this.getSearchArgs();

        // 如果是表格排序引发的，把新的排序放进去
        if (e.type === 'sort') {
            args.orderBy = e.field.field;
            args.order = e.order;
        }

        this.fire('search', { args: args });
    };

    /**
     * 获取查询参数，默认是取`filter`表单的所有数据，加上表格的排序字段和每页显示条目数
     *
     * @return {Object}
     */
    ListView.prototype.getSearchArgs = function () {
        // 获取表单的字段
        var form = this.get('filter');
        var args = form ? form.getData() : {};

        // 加上原本的排序方向和排序字段名
        args.order = this.model.get('order');
        args.orderBy = this.model.get('orderBy');

        var keyword = this.get('keyword');
        if (keyword) {
            // 关键词去空格
            args.keyword = u.trim(keyword.getValue());
        }

        // 日期是独立的
        var range = this.get('range');
        if (range) {
            range = range.getValue().split(',');
            args.startTime = moment(range[0]).format('YYYYMMDDHHmmss');
            args.endTime = moment(range[1]).format('YYYYMMDDHHmmss');
        }

        // 带上每页显示数
        var pager = this.get('pager');
        if (pager) {
            args.pageSize = pager.get('pageSize');
        }

        return args;
    };

    /**
     * 更新页码
     *
     * @param {mini-event.Event} e 事件对象
     * @ignore
     */
    function updatePageIndex(e) {
        var page = e.target.get('page');
        this.fire('pagechange', { page: page });
    }

    /**
     * 根据表格中所选择的行来控制批量更新按钮的启用/禁用状态
     */
    ListView.prototype.updateBatchButtonStatus = function () {
        var items = this.getSelectedItems();

        this.getGroup('batch').set('disabled', u.isEmpty(items));
        this.getGroup('batch').set('readOnly', u.isEmpty(items));
    };

    /**
     * 获取table已经选择的列的数据
     *
     * @return {Object[]} 当前table的已选择列对应的数据
     */
    ListView.prototype.getSelectedItems = function () {
        var table = this.get('table');
        return table ? table.getSelectedItems() : [];
    };

    /**
     * 触发批量操作
     *
     * @param {Object} e 控件事件对象
     * @ignore
     */
    function batchModify(e) {
        var args = {
            // 批量操作的类型
            action: e.target.getData('type'),
            selectedItems: this.get('table').getSelectedItems()
        };

        this.fire('batchmodify', args);
    }

    /**
     * 侧边栏模式改变时要调整整体布局
     *
     * @param {Object} e 模式切换事件对象
     */
    function sidebarModeChange(e) {
        // Sidebar目前只提供了操作DOM的方式更新布局，需要对ESUI做优化后再升级这块
        var neighbor = document.getElementById('neighbor');

        if (!neighbor) {
            return;
        }

        if (e.mode === 'fixed') {
            neighbor.className = 'ui-sidebar-neighbor';
        }
        else {
            neighbor.className = 'ui-sidebar-neighbor-hide';
        }

        this.adjustLayout();
    }

    /**
     * @inheritDoc
     */
    ListView.prototype.bindEvents = function() {
        var pager = this.get('pager');
        if (pager) {
            // 切换每页大小
            pager.on('pagesizechange', this.submitSearch, this);
            pager.on('pagechange', updatePageIndex, this);
        }

        var table = this.get('table');
        if (table) {
            // 选中表格行后控制批量更新按钮的启用/禁用状态
            table.on('select', this.updateBatchButtonStatus, this);
            // 表格排序触发查询
            table.on('sort', this.submitSearch, this);
        }

        var filter = this.get('filter');
        if (filter) {
            // 多条件查询
            filter.on('submit', this.submitSearch, this);
        }

        var sidebar = this.get('sidebar');
        if (sidebar) {
            sidebar.on('modechange', sidebarModeChange, this);
        }

        u.each(
            this.getGroup('batch'),
            function (button) {
                if (button instanceof require('esui/Button')) {
                    // 批量更新
                    button.on('click', batchModify, this);
                }
            },
            this
        );

        BaseView.prototype.bindEvents.apply(this, arguments);
    };

    /**
     * 控制元素展现
     *
     * @override
     */
    ListView.prototype.enterDocument = function () {
        BaseView.prototype.enterDocument.apply(this, arguments);
        this.updateBatchButtonStatus();

        this.adjustLayout();
    };

    /**
     * 根据布局变化重新调整自身布局
     */
    ListView.prototype.adjustLayout = function () {
        var table = this.get('table');
        if (table) {
            table.adjustWidth();
        }
    };

    /**
     * 根据Model数据重新渲染页面
     */
    ListView.prototype.refresh = function () {
        // 刷新列表
        this.refreshList();

        // 最后刷新权限显示
        this.refreshAuth();
    };

    /**
     * 根据Model数据重新渲染列表
     */
    ListView.prototype.refreshList = function () {
        var model = this.model;
        var table = this.get('table');
        if (table) {
            table.setDatasource(model.get('tableData'));
        }

        var pager = this.get('pager');
        if (pager) {
            pager.setProperties(
                {
                    count: model.get('totalCount'),
                    page: model.get('pageNo'),
                    pageSize: model.get('pageSize')
                },
                { silent: true }
            );
        }
    };

    require('er/util').inherits(ListView, BaseView);
    return ListView;
});
