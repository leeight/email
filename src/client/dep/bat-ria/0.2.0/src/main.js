/**
 * @file 入口模块
 * @author Justineo(justice360@gmail.com)
 */

define(
    function (require) {

        var config = {};
        var u = require('underscore');
        var util = require('./util');

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
         * @ignore
         */
        function loadData() {
            var Deferred = require('er/Deferred');

            return Deferred.all(
                // Deferred.when(config.api.user()),
                // Deferred.when(config.api.constants())
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
         * @ignore
         */
        function start(riaConfig) {

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
            return loadData()
                // .then(initData)
                .then(init);
        }

        return {
            start: start
        };
    }
);
