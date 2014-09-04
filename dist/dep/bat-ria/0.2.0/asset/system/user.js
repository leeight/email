define([
    'require',
    'underscore',
    'er/permission'
], function (require) {
    var u = require('underscore');
    var permission = require('er/permission');
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
                var auth = this.visitor.auth;
                if (auth) {
                    permission.add(u.mapObject(auth, function (value) {
                        return value !== 'none';
                    }));
                }
            }
        };
    return exports;
});