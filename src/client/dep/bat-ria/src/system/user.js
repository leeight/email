/**
 * @file 用户信息模块
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {

    var u = require('underscore');
    var permission = require('er/permission');
    var URI = require('urijs');
    var auth = require('./auth');

    /**
     * 用户信息模块
     */
    var exports = {
        init: function (session) {
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
        },

        getVisitor: function () {
            return this.visitor || null;
        },

        getVisitorId: function () {
            return this.visitor && this.visitor.id;
        },

        getAder: function () {
            return this.ader || null;
        },

        getAderId: function () {
            return this.ader && this.ader.id
                || URI.parseQuery(document.location.search).aderId
                || this.visitor && this.visitor.id;
        },

        getAuthMap: function () {
            var authMap = this.visitor && this.visitor.auth;

            return authMap || null;
        },

        getAuthType: function (authId) {
            return auth.get(authId, this.getAuthMap());
        },

        getAuth: function (authId) {
            var authType = this.getAuthType(authId);
            return {
                type: authType,
                id: authId,
                isReadOnly: authType === auth.AuthType.READONLY,
                isEditable: authType === auth.AuthType.EDITABLE,
                isVisible: authType !== auth.AuthType.NONE,
                isNone: authType === auth.AuthType.NONE
            };
        }
    };

    // return模块
    return exports;
});
