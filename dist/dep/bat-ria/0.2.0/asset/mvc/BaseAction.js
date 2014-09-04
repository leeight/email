define([
    'require',
    'er/util',
    'underscore',
    'er/Action',
    'er/Model',
    './BaseModel'
], function (require) {
    var util = require('er/util');
    var u = require('underscore');
    var Action = require('er/Action');
    function BaseAction() {
        Action.apply(this, arguments);
    }
    util.inherits(BaseAction, Action);
    BaseAction.prototype.createModel = function (args) {
        var model = Action.prototype.createModel.apply(this, arguments);
        var Model = require('er/Model');
        if (!(model instanceof Model) && u.isEmpty(model)) {
            var BaseModel = require('./BaseModel');
            model = new BaseModel(args);
        }
        return model;
    };
    BaseAction.prototype.back = function (defaultURL, isForce) {
        if (typeof arguments[0] === 'boolean') {
            isForce = defaultURL;
            defaultURL = null;
        } else {
            defaultURL = defaultURL || '';
        }
        var referrer = this.context && this.context.referrer;
        var url = referrer || defaultURL;
        if (url) {
            this.redirect(url);
        } else if (isForce) {
            window.history.back();
        }
    };
    return BaseAction;
});