define('bat-ria/mvc/ListModel', [
    'require',
    'underscore',
    'er/util',
    './BaseModel',
    '../util',
    'er/URL'
], function (require) {
    var u = require('underscore');
    var util = require('er/util');
    var BaseModel = require('./BaseModel');
    var batUtil = require('../util');
    function ListModel(context) {
        BaseModel.call(this, context);
    }
    util.inherits(ListModel, BaseModel);
    ListModel.prototype.listRequester;
    ListModel.prototype.defaultArgs = {};
    ListModel.prototype.getDefaultArgs = function () {
        return u.defaults(this.defaultArgs || {}, { pageNo: 1 });
    };
    function adaptData(data) {
        var page = data;
        page.tableData = page.result;
        delete page.result;
        return page;
    }
    ListModel.prototype.defaultDatasource = {
        listPage: {
            retrieve: function (model) {
                return model.listRequester(model.getQuery()).then(adaptData);
            },
            dump: true
        },
        time: {
            retrieve: function (model) {
                var startTime = model.get('startTime');
                var endTime = model.get('endTime');
                if (startTime && endTime) {
                    return { time: batUtil.getTimeRange(startTime, endTime) };
                }
                var range = model.defaultTimeRange;
                if (range) {
                    return { time: range };
                } else {
                    return {};
                }
            },
            dump: true
        },
        urlTemplate: function (model) {
            var url = model.get('url');
            var path = url.getPath();
            var query = url.getQuery();
            delete query.pageNo;
            var template = '#' + require('er/URL').withQuery(path, query);
            var delimiter = u.isEmpty(query) ? '~' : '&';
            template += delimiter + 'pageNo=${page}';
            return template;
        }
    };
    ListModel.prototype.defaultTimeRange = null;
    ListModel.prototype.getQuery = function () {
        var url = this.get('url');
        var query = url.getQuery();
        var range = this.defaultTimeRange;
        if (range) {
            range = batUtil.getTimeRange(range.begin, range.end, {
                outputFormat: 'YYYYMMDDHHmmss',
                beginKey: 'startTime',
                endKey: 'endTime'
            });
        } else {
            range = {};
        }
        u.chain(query).defaults(this.getDefaultArgs()).defaults(range).extend(this.getExtraQuery());
        return this.prepareQuery(query);
    };
    ListModel.prototype.getExtraQuery = function () {
        return {};
    };
    ListModel.prototype.filterQuery = function (query) {
        return query;
    };
    ListModel.prototype.prepareQuery = function (query) {
        return this.filterQuery(query);
    };
    ListModel.prototype.loadData = function (url) {
        var me = this;
        var urlQuery = url.getQuery();
        me.set('url', url);
        me.fill(urlQuery);
        return me.listRequester(me.getQuery()).then(function (data) {
            me.fill(adaptData(data));
        });
    };
    return ListModel;
});