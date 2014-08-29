define('er/View', [
    'require',
    './util',
    './Model',
    'etpl',
    'eoo',
    'mini-event/EventTarget'
], function (require) {
    var util = require('./util');
    var exports = {};
    exports.constructor = function () {
        this.initialize();
    };
    exports.initialize = util.noop;
    exports.template = '';
    exports.getTemplateName = function () {
        return this.template || '';
    };
    exports.model = null;
    exports.container = '';
    exports.getContainerElement = function () {
        return util.getElement(this.container) || null;
    };
    exports.getTemplateData = function () {
        var model = this.model;
        if (model && typeof model.get !== 'function') {
            var Model = require('./Model');
            model = new Model(model);
        }
        var visit = function (propertyPath) {
            var path = propertyPath.replace(/\[(\d+)\]/g, '.$1').split('.');
            var propertyName = path.shift();
            var value = model.get(propertyName);
            while (value && (propertyName = path.shift())) {
                value = value[propertyName];
            }
            return value;
        };
        return {
            get: visit,
            relatedModel: model
        };
    };
    exports.render = function () {
        var container = this.getContainerElement();
        if (!container) {
            var url = this.model && typeof this.model.get === 'function' && this.model.get('url');
            throw new Error('Container not found when rendering ' + (url ? '"' + url + '"' : 'view'));
        }
        var template = require('etpl');
        var html = template.render(this.getTemplateName(), this.getTemplateData());
        container.innerHTML = html;
        this.enterDocument();
    };
    exports.enterDocument = require('./util').noop;
    exports.dispose = function () {
        var container = this.getContainerElement();
        container && (container.innerHTML = '');
    };
    var View = require('eoo').create(require('mini-event/EventTarget'), exports);
    return View;
});