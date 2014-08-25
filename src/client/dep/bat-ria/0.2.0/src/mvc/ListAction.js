/**
 * @file 列表类型`Action`基类
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var BaseAction = require('./BaseAction');
    var util = require('er/util');
    var u = require('underscore');
    var URL = require('er/URL');

    /**
     * 列表`Action`基类
     *
     * @extends BaseAction
     * @constructor
     */
    function ListAction() {
        BaseAction.apply(this, arguments);
    }

    util.inherits(ListAction, BaseAction);

    /**
     * 进行查询
     *
     * @param {Object} args 查询参数
     */
    ListAction.prototype.performSearch = function (args) {
        // 去除默认参数值
        var defaultArgs = this.model.getDefaultArgs();
        var extraArgs = this.model.getExtraQuery();
        args = u.chain(args)
            .purify(defaultArgs)
            .extend(extraArgs)
            .value();

        var event = this.fire('search', { args: args });
        if (!event.isDefaultPrevented()) {
            this.redirectForSearch(args);
        }
    };

    /**
     * 进行查询引起的重定向操作
     *
     * @param {Object} args 查询参数
     */
    ListAction.prototype.redirectForSearch = function (args) {
        var path = this.model.get('url').getPath();
        var url = URL.withQuery(path, args);
        this.redirect(url, { force: true });
    };

    /**
     * 获取指定页码的跳转URL
     *
     * @param {number} pageNo 指定的页码
     * @return {string}
     */
    ListAction.prototype.getURLForPage = function (pageNo) {
        var url = this.context.url;
        var path = url.getPath();
        var query = url.getQuery();
        query.pageNo = pageNo;

        // 第一页省去页码参数
        if (pageNo === 1) {
            query = u.omit(query, 'pageNo');
        }

        return require('er/URL').withQuery(path, query).toString();
    };

    /**
     * 查询的事件处理函数
     *
     * @param {Object} e 事件对象
     * @ignore
     */
    function search(e) {
        this.performSearch(e.args);
    }

    /**
     * 前往指定页
     *
     * @param {mini-event.Event} e 事件对象
     * @param {number} e.page 前往的页码
     * @ignore
     */
    function forwardToPage(e) {
        var event = this.fire('pagechange', { page: e.page });
        if (!event.isDefaultPrevented()) {
            var url = this.getURLForPage(e.page);
            this.redirect(url);
        }
    }

    /**
     * 初始化交互行为
     *
     * @protected
     * @override
     */
    ListAction.prototype.initBehavior = function () {
        BaseAction.prototype.initBehavior.apply(this, arguments);
        this.view.on('search', search, this);
        this.view.on('pagesizechange', search, this);
        this.view.on('pagechange', forwardToPage, this);
    };

    /**
     * 根据布局变化重新调整自身布局
     */
    ListAction.prototype.adjustLayout = function () {
        this.view.adjustLayout();
    };
    
    return ListAction;
});
