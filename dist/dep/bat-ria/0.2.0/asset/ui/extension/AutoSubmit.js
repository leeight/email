define([
    'require',
    'underscore',
    'esui/lib',
    'esui',
    'esui/Form',
    'esui/Extension'
], function (require) {
    var u = require('underscore');
    var lib = require('esui/lib');
    var ui = require('esui');
    var Form = require('esui/Form');
    var Extension = require('esui/Extension');
    function AutoSubmit(options) {
        options = options || {};
        if (typeof options.events === 'string') {
            options.events = u.map(lib.splitTokenList(options.events), lib.trim);
        }
        Extension.apply(this, arguments);
    }
    AutoSubmit.prototype.type = 'AutoSubmit';
    AutoSubmit.prototype.form = null;
    AutoSubmit.prototype.events = [
        'click',
        'change',
        'search'
    ];
    AutoSubmit.prototype.resolveForm = function () {
        if (this.form) {
            return this.target.viewContext.get(this.form);
        }
        var element = this.target && this.target.main && this.target.main.parentNode;
        while (element) {
            var control = ui.getControlByDOM(element);
            if (control && control instanceof Form) {
                return control;
            }
            element = element.parentNode;
        }
        return null;
    };
    function submit() {
        var form = this.resolveForm();
        if (form) {
            form.validateAndSubmit();
        }
    }
    AutoSubmit.prototype.activate = function () {
        u.each(this.events, function (eventName) {
            this.target.on(eventName, submit, this);
        }, this);
        Extension.prototype.activate.apply(this, arguments);
    };
    AutoSubmit.prototype.inactivate = function () {
        u.each(this.events, function (eventName) {
            this.target.un(eventName, submit, this);
        }, this);
        Extension.prototype.inactivate.apply(this, arguments);
    };
    lib.inherits(AutoSubmit, Extension);
    require('esui').registerExtension(AutoSubmit);
    return AutoSubmit;
});