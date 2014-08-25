/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file UI组件模块扩展
 * @author otakustay
 */
define(
    function (require) {
        var u = require('underscore');
        var lib = require('esui/lib');

        /**
         * 加载并配置验证规则
         *
         * @ignore
         */
        function initializeValidationRules() {
            // 加载所有验证规则
            var MaxLengthRule = require('esui/validator/MaxLengthRule');
            var MinLengthRule = require('esui/validator/MinLengthRule');
            var RequiredRule = require('esui/validator/RequiredRule');
            var PatternRule = require('esui/validator/PatternRule');
            var MaxRule = require('esui/validator/MaxRule');
            var MinRule = require('esui/validator/MinRule');

            RequiredRule.prototype.errorMessage = '请填写${title}';

            var INTEGER_REGEX = {
                '^\\d+$': true,
                '/^\\d+$/': true
            };
            var FLOAT_REGEX = {
                '^\\d+(\\.\\d{1,2})?$': true,
                '/^\\d+(\\.\\d{1,2})?$/': true
            };
            var NUMBER_REGEX = u.extend({}, INTEGER_REGEX, FLOAT_REGEX);

            function getRangeErrorMessage(control) {
                var min = control.get('min');
                var max = control.get('max');
                var pattern = control.get('pattern') + '';

                if (min != null && max != null
                    && NUMBER_REGEX.hasOwnProperty(pattern)
                ) {
                    // 把数字变成3位一个逗号的
                    var regex = /\B(?=(\d{3})+(?!\d))/g;
                    var start = (min + '').replace(regex, ',');
                    var end = (max + '').replace(regex, ',');

                    // 根据正则选择整数或浮点数的信息
                    if (INTEGER_REGEX.hasOwnProperty(pattern)) {
                        return u.escape(control.get('title')) + '请填写'
                            + '≥' + start + '且≤' + end + '的整数';
                    }
                    else {
                        return u.escape(control.get('title')) + '请填写'
                            + '≥' + start + '且≤' + end + '的数字，'
                            + '最多可保存至小数点后两位';
                    }
                }
                else {
                    return null;
                }
            }

            var Rule = require('esui/validator/Rule');

            MaxLengthRule.prototype.getErrorMessage = function (control) {
                if (control.get('maxErrorMessage')) {
                    var getErrorMessage = Rule.prototype.getErrorMessage;
                    getErrorMessage.apply(this, arguments);
                }
                var rangeErrorMessage = getRangeErrorMessage(control);
                if (rangeErrorMessage) {
                    return rangeErrorMessage;
                }
                return Rule.prototype.getErrorMessage.apply(this, arguments);
            };

            MinLengthRule.prototype.getErrorMessage = function (control) {
                if (control.get('maxErrorMessage')) {
                    var getErrorMessage = Rule.prototype.getErrorMessage;
                    getErrorMessage.apply(this, arguments);
                }
                var rangeErrorMessage = getRangeErrorMessage(control);
                if (rangeErrorMessage) {
                    return rangeErrorMessage;
                }
                return Rule.prototype.getErrorMessage.apply(this, arguments);
            };
            
            MaxRule.prototype.getErrorMessage = function (control) {
                if (control.get('maxErrorMessage')) {
                    var getErrorMessage = Rule.prototype.getErrorMessage;
                    getErrorMessage.apply(this, arguments);
                }
                var rangeErrorMessage = getRangeErrorMessage(control);
                if (rangeErrorMessage) {
                    return rangeErrorMessage;
                }
                return Rule.prototype.getErrorMessage.apply(this, arguments);
            };

            MinRule.prototype.getErrorMessage = function (control) {
                if (control.get('maxErrorMessage')) {
                    var getErrorMessage = Rule.prototype.getErrorMessage;
                    getErrorMessage.apply(this, arguments);
                }
                var rangeErrorMessage = getRangeErrorMessage(control);
                if (rangeErrorMessage) {
                    return rangeErrorMessage;
                }
                return Rule.prototype.getErrorMessage.apply(this, arguments);
            };

            PatternRule.prototype.getErrorMessage = function (control) {
                var pattern = control.get('pattern') + '';
                if (control.get('patternErrorMessage')
                    || !NUMBER_REGEX.hasOwnProperty(pattern)
                ) {
                    var getErrorMessage = Rule.prototype.getErrorMessage;
                    getErrorMessage.apply(this, arguments);
                }
                var rangeErrorMessage = getRangeErrorMessage(control);
                if (rangeErrorMessage) {
                    return rangeErrorMessage;
                }
                return Rule.prototype.getErrorMessage.apply(this, arguments);
            };
        }

        /**
         * 为几个控件添加链接模式的内容模板
         *
         * @ignore
         */
        function addControlLinkMode() {
            var CommandMenu = require('esui/CommandMenu');

            CommandMenu.prototype.linkTemplate =
                '<a target="${target}" href="${href}">${text}</a>';

            CommandMenu.prototype.getItemHTML = function (item) {
                var data = {
                    text: lib.encodeHTML(item.text),
                    href: item.href && lib.encodeHTML(item.href),
                    target: item.target || '_self'
                };
                var template = item.href
                    ? this.linkTemplate
                    : this.itemTemplate;
                return lib.format(template, data);
            };

            var Tab = require('esui/Tab');

            Tab.prototype.linkTemplate = '<a href="${href}">${title}</a>';

            Tab.prototype.getContentHTML = function (item) {
                var data = {
                    title: lib.encodeHTML(item.title),
                    href: item.href && lib.encodeHTML(item.href)
                };
                var template = item.href
                    ? this.linkTemplate
                    : this.contentTemplate;
                return lib.format(template, data);
            };
        }

        /**
         * 激活全局ESUI扩展
         *
         * @ignore
         */
        function initializeGlobalExtensions() {
            var ui = require('esui');
            var globalExtensions = [
                { type: 'CustomData', options: {} }
            ];

            u.each(globalExtensions, function (extension) {
                ui.attachExtension(extension.type, extension.options);
            });
        }

        /**
         * esui升级前region的过渡扩展，增加获取最大地域个数的方法
         *
         * @ignore
         */
        function addRegionExtension() {
            var Region = require('esui/Region');

            Region.prototype.getMaxRegionSize = function () {
                if (!this.maxRegionSize) {
                    this.maxRegionSize = u.size(this.regionDataIndex);
                }
                return this.maxRegionSize;
            };
        }

        /**
         * esui升级前Crumb的过渡扩展，增加global-redirect的功能
         *
         * @ignore
         */
        function addCrumbGlobalRedirect() {
            var Crumb = require('esui/Crumb');

            /**
             * 链接节点的内容HTML模板
             *
             * 模板中可以使用以下占位符：
             *
             * - `{string} text`：文本内容，经过HTML转义
             * - `{string} href`：链接地址，经过HTML转义
             * - `{string} scope`：当Crumb在一个子action中时是否global跳转，经过HTML转义
             *       值为`global`时全局跳转，其他值或空在子action中跳转
             *
             * @type {string}
             * @override
             */
            Crumb.prototype.linkNodeTemplate =
                '<a class="${classes}" href="${href}" data-redirect="${scope}">${text}</a>';

            /**
             * 获取节点的HTML内容
             *
             * @param {meta.CrumbItem} node 节点数据项
             * @param {number} index 节点索引序号
             * @return {string}
             *
             * @override
             */
            Crumb.prototype.getNodeHTML = function (node, index) {
                var classes = this.helper.getPartClasses('node');
                if (index === 0) {
                    classes.push.apply(
                        classes,
                        this.helper.getPartClasses('node-first')
                    );
                }
                if (index === this.path.length - 1) {
                    classes.push.apply(
                        classes,
                        this.helper.getPartClasses('node-last')
                    );
                }

                var template = node.href
                    ? this.linkNodeTemplate
                    : this.textNodeTemplate;
                var data = {
                    href: u.escape(node.href),
                    scope: u.escape(node.scope),
                    text: u.escape(node.text),
                    classes: classes.join(' ')
                };
                return lib.format(template, data);
            };
        }

        function activate() {
            initializeValidationRules();
            addControlLinkMode();
            initializeGlobalExtensions();
            addRegionExtension();
            addCrumbGlobalRedirect();
        }

        return {
            activate: u.once(activate)
        };
    }
);
