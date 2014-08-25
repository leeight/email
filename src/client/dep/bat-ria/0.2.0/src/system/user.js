/**
 * @file 用户信息模块
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {

    var u = require('underscore');
    var permission = require('er/permission');

    /**
     * 用户信息模块
     */
    var exports = {
        init: function(session) {
            if (session.visitor) {
                this.visitor = session.visitor;
            }
            if (session.adOwner) {
                this.ader = session.adOwner;
            }
            if (!session.visitor && !session.adOwner) {
                this.visitor = session;
            }

            // 如果配置了权限信息，需要初始化 `er/permission`
            var auth = this.visitor.auth;
            if (auth) {
                permission.add(u.mapObject(auth, function (value) {
                    return value !== 'none';
                }));
            }
        }
    };

    // return模块
    return exports;
});
