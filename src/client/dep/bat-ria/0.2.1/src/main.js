/**
 * @file 入口模块
 * @author Justineo(justice360@gmail.com)
 */

define(
    function (require) {

        var config = {};
        var u = require('underscore');
        var util = require('./util');
        var Deferred = require('er/Deferred');

        /**
         * 初始化API请求器
         *
         * @ignore
         */
        function initApiConfig() {
            config.api = util.genRequesters(config.api);
        }

        function initErConfigs() {
            var erConfig = require('er/config');
            erConfig.indexURL = config.index;
            erConfig.systemName = config.systemName;
        }

        /**
         * 初始化系统启动
         *
         * @param {Array} [extra] 额外的请求发送器
         *
         * @ignore
         */
        function loadData(extra) {
            extra = extra ? u.map(extra, function (api) {
                if (typeof api === 'string') {
                    return util.genRequesters(api);
                }
                else {
                    return api;
                }
            }) : [];

            var requests = [ config.api.user, config.api.constants ].concat(extra || []);

            return Deferred.all.apply(
                Deferred,
                u.map(requests, function (requester) {
                    return Deferred.when(requester());
                })
            );
        }

        /**
         * 默认读取用户信息和系统常量后初始化对应模块
         *
         * @ignore
         */
        function initData(session, constants) {
            // 初始化用户信息
            var user = require('./system/user');
            user.init(session);

            // 初始化系统常量
            var consts = require('./system/constants');
            var localConstants = require('common/constants');
            consts.init(u.extend(localConstants, constants));

            // 返回其余请求结果
            var extra = [].slice.call(arguments).slice(2);
            return Deferred.all.apply(
                Deferred,
                u.map(extra, function (result) {
                    return Deferred.resolved(result);
                })
            );
        }

        /**
         * 启动ER
         *
         * @ignore
         */
        function init() {

            initErConfigs();

            // 启动er
            require('er').start();
        }

        /**
         * RIA启动入口
         *
         * @param {Object} riaConfig RIA配置
         * @param {Array} requesters 初始化数据需要的请求发送器
         * @param {Function} callback 初始化请求返回后的回调函数
         * @ignore
         */
        function start(riaConfig, requesters, callback) {

            config = riaConfig;

            require('./extension/underscore').activate();
            require('./extension/hooks').activate(config.hooks);
            require('./extension/ui').activate();

            if (!(riaConfig.ext && riaConfig.ext.track === false)) {
                // 默认开启，如果想要禁用的话，可以在调用bat-ria的时候关闭
                // require('bat-ria').start({
                //   ext: {
                //     track: false
                //   }
                // });
                require('./extension/track').activate();
            }

            // 对API配置进行一下封装
            initApiConfig();

            // 读取必要信息后初始化系统
            return loadData(requesters)
                .then(initData)
                .then(callback)
                .then(init);
        }

        return {
            start: start
        };
    }
);
