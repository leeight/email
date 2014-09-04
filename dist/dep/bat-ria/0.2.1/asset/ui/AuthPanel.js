define('bat-ria/ui/AuthPanel', [
    'require',
    'underscore',
    'esui/lib',
    'esui/Panel',
    '../system/auth',
    '../system/user',
    'esui'
], function (require) {
    var u = require('underscore');
    var lib = require('esui/lib');
    var Panel = require('esui/Panel');
    var auth = require('../system/auth');
    function AuthPanel(options) {
        Panel.apply(this, arguments);
    }
    AuthPanel.prototype.type = 'AuthPanel';
    var AuthType = auth.AuthType;
    AuthPanel.defaultProperties = { auth: AuthType.EDITABLE };
    AuthPanel.prototype.initOptions = function (options) {
        var properties = {};
        u.extend(properties, AuthPanel.defaultProperties, options);
        this.setProperties(properties);
    };
    AuthPanel.prototype.initAuth = function (root) {
        var me = this;
        var root = root || me.main;
        var disableableTagNames = [
                'BUTTON',
                'INPUT',
                'SELECT',
                'TEXTAREA',
                'OPTGROUP',
                'OPTION',
                'COMMAND',
                'FIELDSET'
            ];
        u.each(root.querySelectorAll('[data-auth]'), function (elem) {
            if (elem.getAttribute('data-auth-done')) {
                return true;
            }
            var authId = elem.getAttribute('data-auth');
            if (/\binherit\b/.test(authId)) {
                var parent = elem;
                while (parent = parent.parentNode) {
                    var parentAuth = parent.getAttribute('data-auth');
                    if (parentAuth && !/\binherit\b/.test(parentAuth)) {
                        authId = authId.replace('inherit', '(' + parentAuth + ')');
                        elem.setAttribute('data-auth', authId);
                        break;
                    } else if (parent === document.body) {
                        throw 'Auth error: [inherit] source not found.';
                    }
                }
            }
            var authType = require('../system/user').getAuthType(authId);
            var controlId = elem.getAttribute('data-ctrl-id');
            var control = controlId ? me.viewContext.get(controlId) : null;
            if (authType === AuthType.NONE) {
                if (control) {
                    control.hide();
                } else {
                    elem.parentNode.removeChild(elem);
                }
            } else if (authType === AuthType.READONLY) {
                if (control) {
                    if (control.setReadOnly) {
                        control.setReadOnly(true);
                    } else {
                        control.disable();
                    }
                } else {
                    var tagName = elem.tagName.toUpperCase();
                    if (tagName === 'INPUT' && (elem.type === 'text' || elem.type === 'password') || tagName === 'TEXTAREA') {
                        elem.readonly = true;
                    } else if (u.contains(disableableTagNames, tagName)) {
                        elem.disabled = true;
                    } else {
                        lib.un(elem, 'click');
                        elem.onclick = function (e) {
                            lib.event.stopPropagation(e);
                            lib.event.preventDefault(e);
                            return false;
                        };
                    }
                    lib.addClass(elem, 'auth-disabled');
                }
            }
            elem.setAttribute('data-auth-done', 'auth-done');
        });
    };
    AuthPanel.prototype.repaint = function () {
        Panel.prototype.repaint.call(this);
        this.initAuth();
    };
    lib.inherits(AuthPanel, Panel);
    require('esui').register(AuthPanel);
    return AuthPanel;
});