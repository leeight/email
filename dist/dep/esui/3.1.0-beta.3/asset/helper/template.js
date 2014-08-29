define('esui/helper/template', [
    'require',
    'underscore'
], function (require) {
    var u = require('underscore');
    var FILTERS = {
            'id': function (part, instance) {
                return instance.helper.getId(part);
            },
            'class': function (part, instance) {
                return instance.helper.getPartClassName(part);
            },
            'part': function (part, nodeName, instance) {
                return instance.helper.getPartHTML(part, nodeName);
            }
        };
    var helper = {};
    helper.setTemplateEngine = function (engine) {
        this.templateEngine = engine;
        if (!engine.esui) {
            this.initializeTemplateEngineExtension();
        }
    };
    helper.initializeTemplateEngineExtension = function () {
        u.each(FILTERS, function (filter, name) {
            this.addFilter(name, filter);
        }, this.templateEngine);
    };
    helper.renderTemplate = function (target, data) {
        var helper = this;
        data = data || {};
        var templateData = {
                get: function (name) {
                    if (name === 'instance') {
                        return helper.control;
                    }
                    if (typeof data.get === 'function') {
                        return data.get(name);
                    }
                    var propertyName = name;
                    var filter = null;
                    var indexOfDot = name.lastIndexOf('.');
                    if (indexOfDot >= 0) {
                        propertyName = name.substring(0, indexOfDot);
                        var filterName = name.substring(indexOfDot + 1);
                        if (filterName && FILTERS.hasOwnProperty(filterName)) {
                            filter = FILTERS[filterName];
                        }
                    }
                    var value = data.hasOwnProperty(propertyName) ? data[propertyName] : propertyName;
                    if (filter) {
                        value = filter(value, helper.control);
                    }
                    return value;
                }
            };
        if (!this.templateEngine) {
            throw new Error('No template engine attached to this control');
        }
        return this.templateEngine.render(target, templateData);
    };
    return helper;
});