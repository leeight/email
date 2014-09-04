define([
    'require',
    'underscore',
    'esui/lib',
    'esui/validator/MaxLengthRule',
    'esui/validator/MinLengthRule',
    'esui/validator/RequiredRule',
    'esui/validator/PatternRule',
    'esui/validator/MaxRule',
    'esui/validator/MinRule',
    'esui/validator/Rule',
    'esui/CommandMenu',
    'esui/Tab',
    'esui',
    'esui/Region',
    'esui/Crumb'
], function (require) {
    var u = require('underscore');
    var lib = require('esui/lib');
    function initializeValidationRules() {
        var MaxLengthRule = require('esui/validator/MaxLengthRule');
        var MinLengthRule = require('esui/validator/MinLengthRule');
        var RequiredRule = require('esui/validator/RequiredRule');
        var PatternRule = require('esui/validator/PatternRule');
        var MaxRule = require('esui/validator/MaxRule');
        var MinRule = require('esui/validator/MinRule');
        RequiredRule.prototype.errorMessage = '\u8BF7\u586B\u5199${title}';
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
            if (min != null && max != null && NUMBER_REGEX.hasOwnProperty(pattern)) {
                var regex = /\B(?=(\d{3})+(?!\d))/g;
                var start = (min + '').replace(regex, ',');
                var end = (max + '').replace(regex, ',');
                if (INTEGER_REGEX.hasOwnProperty(pattern)) {
                    return u.escape(control.get('title')) + '\u8BF7\u586B\u5199' + '\u2265' + start + '\u4E14\u2264' + end + '\u7684\u6574\u6570';
                } else {
                    return u.escape(control.get('title')) + '\u8BF7\u586B\u5199' + '\u2265' + start + '\u4E14\u2264' + end + '\u7684\u6570\u5B57\uFF0C' + '\u6700\u591A\u53EF\u4FDD\u5B58\u81F3\u5C0F\u6570\u70B9\u540E\u4E24\u4F4D';
                }
            } else {
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
            if (control.get('patternErrorMessage') || !NUMBER_REGEX.hasOwnProperty(pattern)) {
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
    function addControlLinkMode() {
        var CommandMenu = require('esui/CommandMenu');
        CommandMenu.prototype.linkTemplate = '<a target="${target}" href="${href}">${text}</a>';
        CommandMenu.prototype.getItemHTML = function (item) {
            var data = {
                    text: lib.encodeHTML(item.text),
                    href: item.href && lib.encodeHTML(item.href),
                    target: item.target || '_self'
                };
            var template = item.href ? this.linkTemplate : this.itemTemplate;
            return lib.format(template, data);
        };
        var Tab = require('esui/Tab');
        Tab.prototype.linkTemplate = '<a href="${href}">${title}</a>';
        Tab.prototype.getContentHTML = function (item) {
            var data = {
                    title: lib.encodeHTML(item.title),
                    href: item.href && lib.encodeHTML(item.href)
                };
            var template = item.href ? this.linkTemplate : this.contentTemplate;
            return lib.format(template, data);
        };
    }
    function initializeGlobalExtensions() {
        var ui = require('esui');
        var globalExtensions = [{
                    type: 'CustomData',
                    options: {}
                }];
        u.each(globalExtensions, function (extension) {
            ui.attachExtension(extension.type, extension.options);
        });
    }
    function addRegionExtension() {
        var Region = require('esui/Region');
        Region.prototype.getMaxRegionSize = function () {
            if (!this.maxRegionSize) {
                this.maxRegionSize = u.size(this.regionDataIndex);
            }
            return this.maxRegionSize;
        };
    }
    function addCrumbGlobalRedirect() {
        var Crumb = require('esui/Crumb');
        Crumb.prototype.linkNodeTemplate = '<a class="${classes}" href="${href}" data-redirect="${scope}">${text}</a>';
        Crumb.prototype.getNodeHTML = function (node, index) {
            var classes = this.helper.getPartClasses('node');
            if (index === 0) {
                classes.push.apply(classes, this.helper.getPartClasses('node-first'));
            }
            if (index === this.path.length - 1) {
                classes.push.apply(classes, this.helper.getPartClasses('node-last'));
            }
            var template = node.href ? this.linkNodeTemplate : this.textNodeTemplate;
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
    return { activate: u.once(activate) };
});