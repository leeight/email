/**
 * @file 列表类型Model基类
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var u = require('underscore');
    var util = require('er/util');
    var BaseModel = require('./BaseModel');
    var batUtil = require('../util');

    /**
     * 业务`Model`基类
     *
     * @param {Object=} context 初始化时的数据
     *
     * @constructor
     * @extends ef/BaseModel
     */
    function ListModel(context) {
        BaseModel.call(this, context);
    }

    util.inherits(ListModel, BaseModel);

    /**
     * 列表数据请求器
     *
     * @type {function}
     */
    ListModel.prototype.listRequester;

    /**
     * 配置默认查询参数
     *
     * 如果某个参数与这里的值相同，则不会加到URL中
     *
     * 创建`Model`时，如果某个参数不存在，则会自动补上这里的值
     *
     * @type {Object}
     * @protected
     */
    ListModel.prototype.defaultArgs = {};

    /**
     * 默认查询参数
     *
     * 参考{@link ListModel#defaultArgs}属性的说明
     *
     * @return {Object}
     * @protected
     */
    ListModel.prototype.getDefaultArgs = function () {
        return u.defaults(this.defaultArgs || {}, { pageNo: 1 });
    };

    /**
     * 转换列表数据
     * 将返回值中的`result`字段改为`tableData`来放到Model中
     *
     * @param {Object} data 列表请求接口返回的数据
     * @return {Object} 转换完毕的数据
     */
    function adaptData(data) {
        var page = data;
        page.tableData = page.result;
        delete page.result;
        return page;
    }

    /**
     * @inheritDoc
     */
    ListModel.prototype.defaultDatasource = {
        listPage: {
            retrieve: function (model) {
                return model.listRequester(model.getQuery())
                    .then(adaptData);
            },
            dump: true
        },

        // 展示时间区间
        time: {
            retrieve: function (model) {
                var startTime = model.get('startTime');
                var endTime = model.get('endTime');

                // 有输入参数
                if (startTime && endTime) {
                    return {
                        time: batUtil.getTimeRange(startTime, endTime)
                    };
                }

                // 无输入参数，取默认配置，若无则不需要输出
                var range = model.defaultTimeRange;
                if (range) {
                    return {
                        time: range
                    };
                }
                else {
                    return {};
                }
            },
            dump: true
        },

        // 分页URL模板，就是当前URL中把`page`字段替换掉
        urlTemplate: function (model) {
            var url = model.get('url');
            var path = url.getPath();
            // 由于`withQuery`会做URL编码，因此不能直接`query.page = '${page}'`，
            // 会被编码成`%24%7Bpage%7D`，此处只能直接操作字符串
            var query = url.getQuery();
            delete query.pageNo;
            var template = '#' + require('er/URL').withQuery(path, query);
            var delimiter = u.isEmpty(query) ? '~' : '&';
            template += delimiter + 'pageNo=${page}';
            return template;
        }
    };

    /**
     * 默认选择的时间范围
     *
     * @type {?{begin: Date, end: Date}}
     * @protected
     */
    ListModel.prototype.defaultTimeRange = null;

    /**
     * 生成默认的后端请求参数
     *
     * @return {Object}
     * @protected
     */
    ListModel.prototype.getQuery = function () {
        var url = this.get('url');
        var query = url.getQuery();

        // 取一下默认时间配置
        var range = this.defaultTimeRange;
        if (range) {
            range = batUtil.getTimeRange(range.begin, range.end, {
                outputFormat: 'YYYYMMDDHHmmss',
                beginKey: 'startTime',
                endKey: 'endTime'
            });
        }
        else {
            range = {};
        }

        // 合并默认参数、附加参数，最后再统一处理一下输出
        u.chain(query)
            .defaults(this.getDefaultArgs())
            .defaults(range)
            .extend(this.getExtraQuery());

        return this.prepareQuery(query);
    };

    /**
     * 获取除列表本身参数外附加的请求参数
     *
     * @return {Object}
     * @protected
     */
    ListModel.prototype.getExtraQuery = function () {
        return {};
    };

    /**
     * 对合并好的请求参数进行统一的后续处理
     *
     * @deprecated since v0.2.1 名字起得不好，后面使用`prepareQuery`替代
     * @param {Object} query 需要处理的参数对象
     * @return {Object}
     * @protected
     */
    ListModel.prototype.filterQuery = function (query) {
        return query;
    };

    /**
     * 对合并好的请求参数进行统一的后续处理
     *
     * @param {Object} query 需要处理的参数对象
     * @return {Object}
     * @protected
     */
    ListModel.prototype.prepareQuery = function (query) {
        return this.filterQuery(query);
    };

    /**
     * 重新读取列表数据
     *
     * @param {er/URL} url 根据指定URL读取数据
     * @return {er/Promise} 返回异步请求的Promise对象
     * @protected
     */
    ListModel.prototype.loadData = function (url) {
        var me = this;
        var urlQuery = url.getQuery();
        me.set('url', url);
        me.fill(urlQuery);

        return me.listRequester(me.getQuery())
            .then(function(data) {
                me.fill(adaptData(data));
            });
    };

    return ListModel;
});
