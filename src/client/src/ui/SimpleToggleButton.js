/**
 * @file ui/SimpleToggleButton.js ~ 2014/09/23 14:31:07
 * @author leeight(liyubei@baidu.com)
 **/
define(function(require) {
    require('esui/Button');

    var u = require('underscore');
    var lib = require('esui/lib');
    var InputControl = require('esui/InputControl');
    var paint = require('esui/painters');

    /**
     * 邮箱地址输入控件
     *
     * @extends {InputControl}
     * @param {Object} options 初始化参数
     * @constructor
     */
    function SimpleToggleButton(options) {
        InputControl.apply(this, arguments);
    }
    lib.inherits(SimpleToggleButton, InputControl);


    /**
     * 控件类型，始终为`"SimpleToggleButton"`
     *
     * @type {string}
     * @readonly
     * @override
     */
    SimpleToggleButton.prototype.type = 'SimpleToggleButton';

    /**
     * 初始化控件的结构
     */
    SimpleToggleButton.prototype.initStructure = function() {
        this.main.innerHTML =
            '<div data-ui-type="Button" data-ui-child-name="btn">' +
                this.main.innerHTML +
            '</div>';
        this.initChildren(this.main);
    };

    /**
     * 初始化事件交互
     *
     * @protected
     * @override
     */
    SimpleToggleButton.prototype.initEvents = function () {
        this.helper.delegateDOMEvent(this.main, 'click');

        var className = this.helper.getPartClasses('active');
        this.on('click', function(e) {
            if (lib.hasClass(this.main, className)) {
                lib.removeClass(this.main, className);
            } else {
                lib.addClass(this.main, className);
            }
        });
    };

    SimpleToggleButton.prototype.getRawValue = function() {
        var className = this.helper.getPartClasses('active');
        return lib.hasClass(this.main, className) ? '1' : '0';
    };

    SimpleToggleButton.prototype.repaint =
        paint.createRepaint(
            InputControl.prototype.repaint,
            {
                name: 'active',
                paint: function (tb, active) {
                    var className = tb.helper.getPartClasses('active');
                    active = parseInt(active, 10);
                    if (active) {
                        lib.addClass(tb.main, className);
                    } else {
                        lib.removeClass(tb.main, className);
                    }
                }
            },
            {
                name: 'content',
                paint: function (tb, content) {
                    if (content) {
                        tb.getChild('btn').setContent(content);
                    }
                }
            }
        );

    require('esui').register(SimpleToggleButton);
    return SimpleToggleButton;
});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
