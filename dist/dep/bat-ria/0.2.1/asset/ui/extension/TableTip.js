define('bat-ria/ui/extension/TableTip', [
    'require',
    'esui/lib',
    'esui',
    'underscore',
    'esui/Extension',
    'esui/TipLayer'
], function (require) {
    var lib = require('esui/lib');
    var ui = require('esui');
    var u = require('underscore');
    var Extension = require('esui/Extension');
    require('esui/TipLayer');
    function TableTip() {
        Extension.apply(this, arguments);
    }
    TableTip.prototype.type = 'TableTip';
    var typeRule = /table-operation-(\w+(?:-\w+)*)/;
    function getTipType(element) {
        return typeRule.exec(element.className)[1];
    }
    TableTip.prototype.createAndAttachTip = function (elements, type) {
        var element = elements[0];
        var options = {
                id: 'table-operation-tip-' + u.escape(type),
                viewContext: this.target.viewContext,
                content: element.getAttribute('data-title') || element.innerHTML,
                arrow: true,
                skin: 'table-tip'
            };
        var tip = ui.create('TipLayer', options);
        tip.appendTo(document.body);
        u.each(elements, function (element) {
            var options = {
                    targetDOM: element,
                    showMode: 'over',
                    delayTime: 200,
                    positionOpt: {
                        top: 'top',
                        right: 'left'
                    }
                };
            tip.attachTo(options);
        });
    };
    TableTip.prototype.initTips = function () {
        if (!document.querySelectorAll) {
            return;
        }
        var elements = this.target.main.querySelectorAll('.table-operation');
        u.chain(elements).groupBy(getTipType).each(u.bind(this.createAndAttachTip, this));
    };
    TableTip.prototype.activate = function () {
        Extension.prototype.activate.apply(this, arguments);
        this.target.on('bodyChange', this.initTips, this);
    };
    TableTip.prototype.inactivate = function () {
        this.target.un('bodyChange', this.initTips, this);
        Extension.prototype.inactivate.apply(this, arguments);
    };
    lib.inherits(TableTip, Extension);
    ui.registerExtension(TableTip);
    return TableTip;
});