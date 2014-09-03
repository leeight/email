/**
 * JN 2.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 锦囊进行权限验证的基础容器
 * @author Justineo(justice360@gmail.com)
 */
define(function (require) {
    var u = require('underscore');
    var lib = require('esui/lib');
    var Panel = require('esui/Panel');
    var auth = require('../system/auth');

    /**
     * 锦囊权限编辑器权限节点
     *
     * @param {Object=} options 初始化参数
     * @extends esui/Panel
     * @constructor
     * @public
     */
    function AuthPanel(options) {
        Panel.apply(this, arguments);
    }

    AuthPanel.prototype.type = 'AuthPanel';

    /**
     * 权限类型
     *
     * @type {Object}
     */
    var AuthType = auth.AuthType;

    /**
     * 默认属性
     *
     * @type {Object}
     * @public
     */
    AuthPanel.defaultProperties = {
        auth: AuthType.EDITABLE
    };

    /**
     * @inheritDoc
     */
    AuthPanel.prototype.initOptions = function (options) {
        var properties = {};
        u.extend(properties, AuthPanel.defaultProperties, options);

        this.setProperties(properties);
    };

    /**
     * 对有auth属性的元素根据指定权限集合进行权限初始化
     *
     * @param {HTMLElement=} root 根元素，如果为空，则为控件主元素
     */
    AuthPanel.prototype.initAuth = function (root) {
        var me = this;
        var root = root || me.main;

        // 可以通过设置disabled属性禁用的控件
        // 见 http://www.w3.org/html/wg/drafts/html/master/disabled-elements.html
        var disableableTagNames = [
            'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA',
            'OPTGROUP', 'OPTION', 'COMMAND', 'FIELDSET'
        ];

        u.each(root.querySelectorAll('[data-auth]'), function(elem) {
            if (elem.getAttribute('data-auth-done')) {
                return true;
            }

            var authId = elem.getAttribute('data-auth');

            // 如果元素的auth属性值包含inherit，层层查找其DOM父节点直到找到
            // 有auth属性但不包含inherit的元素，并使用该属性值替换掉inherit
            // 如果找不到，一定是发生错误了
            if (/\binherit\b/.test(authId)) {
                var parent = elem;
                while (parent = parent.parentNode) {
                    var parentAuth = parent.getAttribute('data-auth');
                    if (parentAuth && !/\binherit\b/.test(parentAuth)) {
                        authId = authId.replace('inherit', '(' + parentAuth + ')');
                        elem.setAttribute('data-auth', authId);
                        break;
                    }
                    else if (parent === document.body) {
                        throw 'Auth error: [inherit] source not found.';
                    }
                }
            }

            var authType = require('../system/user').getAuthType(authId);
            var controlId = elem.getAttribute('data-ctrl-id');
            var control = controlId ? me.viewContext.get(controlId) : null;
            if (authType === AuthType.NONE) {
                if (control) { // UI控件调用自己的hide方法，就不删除了
                    control.hide();
                }
                else {
                    elem.parentNode.removeChild(elem); // 直接删除内容
                }
            }
            else if (authType === AuthType.READONLY) {
                if (control) { // UI控件
                    if (control.setReadOnly) {
                        control.setReadOnly(true);
                    }
                    else {
                        control.disable();
                    }
                }
                else { // 普通DOM元素
                    var tagName = elem.tagName.toUpperCase();

                    // 当元素是某种文本输入框时，可以直接设置readonly
                    if (tagName === 'INPUT'
                        && (elem.type === 'text' || elem.type === 'password')
                        || tagName === 'TEXTAREA') {
                        elem.readonly = true;
                    }
                    // 否则，对于可以通过disabled属性禁用的元素，设置disabled
                    else if (u.contains(disableableTagNames, tagName)) {
                        elem.disabled = true;
                    }
                    // 其他类型的元素，劫持onclick
                    else {
                        lib.un(elem, 'click');
                        elem.onclick = function(e) {
                            lib.event.stopPropagation(e);
                            lib.event.preventDefault(e);
                            return false;
                        };
                    }

                    // 不管哪种情况，都给元素增加class
                    lib.addClass(elem, 'auth-disabled');
                }
            }
            elem.setAttribute('data-auth-done', 'auth-done');
        });
    };

    /**
     * @inheritDoc
     */
    AuthPanel.prototype.repaint = function () {
        Panel.prototype.repaint.call(this);

        this.initAuth();
    };

    lib.inherits(AuthPanel, Panel);
    require('esui').register(AuthPanel);
    return AuthPanel;
});
