/**
 * @file 业务`Action`基类
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var util = require('er/util');
    var u = require('underscore');
    var Action = require('er/Action');

    /**
     * `Action`基类
     *
     * @extends er.Action
     * @constructor
     */
    function BaseAction() {
        Action.apply(this, arguments);
    }

    util.inherits(BaseAction, Action);

    /**
     * @inheritDoc
     */
    BaseAction.prototype.createModel = function (args) {
        var model = Action.prototype.createModel.apply(this, arguments);

        // `Action`基类的默认返回值是一个空对象`{}`，
        // 但是普通的`Model`对象因为方法和属性全在`prototype`上，也会被判断为空
        var Model = require('er/Model');
        if (!(model instanceof Model) && u.isEmpty(model)) {
            var BaseModel = require('./BaseModel');
            model = new BaseModel(args);
        }

        return model;
    };

    /**
     * 返回来源URL，无来源URL时可指定一个默认地址
     *
     * @param {string|URL} [defaultURL] 无来源URL时的跳转地址
     * @param {boolean} [isForce] 强制跳转至历史记录
     * @protected
     * @override
     */
    BaseAction.prototype.back = function (defaultURL, isForce) {
        if (typeof arguments[0] === 'boolean') {
            isForce = defaultURL;
            defaultURL = null;
        }
        else {
            defaultURL = defaultURL || '';
        }
        var referrer = this.context && this.context.referrer;
        var url = referrer || defaultURL;
        if (url) {
            this.redirect(url);
        }
        else if (isForce) {
            window.history.back();
        }
    };
    
    return BaseAction;
});

