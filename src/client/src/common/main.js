/**
 * @file 入口模块
 * @author leeight(leeight@gmail.com)
 */

define(
    function (require) {
        require('bat-ria/tpl!./master.tpl.html');

        var config = require('common/config');
        var etpl = require('etpl');
        var moment = require('moment');
        var View = require('er/View');

        /**
         * 引入各业务模块的Action配置
         * 如果期望添加action时工具自动配置，请保持requireConfigs名称不变
         *
         * @ignore
         */
        function requireConfigs() {
            require('../user/config');
            require('../thread/config');
            require('../mail/config');
            require('../dev/config');

            require('ui/MailAddressInput');
            require('ui/SimpleToggleButton');
        }

        requireConfigs();

        /**
         * 初始化UI，填写用户信息、初始化导航栏等
         *
         * @ignore
         */
        function init() {
            // var notification = require('common/notification');
            // notification.enable();
            View.prototype.dispose = function() {
                // IGNORE
                // 解决白屏的问题
            };

            var events = require('er/events');
            var lib = require('esui/lib');

            events.on('forwardaction', function(e) {
                lib.g('loading').style.display = '';
            });

            events.on('enteractioncomplete', function(e) {
                lib.g('loading').style.display = 'none';
            });

            events.on('enteractionfail', function(e) {
                lib.g('loading').style.display = 'none';
            });

            events.on('error', function (e) {
                console.error(e.error.stack);
            });

            //拦截全局错误，做相应的跳转
            events.on('globalError', function(e){
                console.error(e.error);
            });

            var user = require('bat-ria/system/user');
            var visitor = user.visitor;
            if (!visitor || !visitor.pop3 || !visitor.pop3.email) {
                // 初次使用，跳转到设置页面
                require('er/locator').redirect('/user/settings');
            }

            var hotfix = require('common/hotfix');
            hotfix.init();
        }

        /**
         * 启动RIA系统，请求关键数据等
         *
         * @ignore
         */
        function start() {
            etpl.addFilter('summary', function(body) {
                // 获取邮件内容的的简略信息
                var rv = body.trim().replace(/(<[^>]+>|\s+)/g, '').substr(0, 100);
                return rv;
            });
            etpl.addFilter('dateFormat', function(date) {
                return moment(date).format('YYYY-MM-DD HH:mm:ss');
            });

            require('bat-ria/main')
                .start(config)
                .then(init);
        }

        return {
            start: start
        };
    }
);
