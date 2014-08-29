define('ef/ActionDialog', [
    'require',
    'esui/main',
    'esui/Dialog',
    './ActionPanel',
    'mini-event',
    'esui/painters',
    'eoo',
    'esui'
], function (require) {
    var ui = require('esui/main');
    var Dialog = require('esui/Dialog');
    require('./ActionPanel');
    var exports = {};
    exports.type = 'ActionDialog';
    exports.styleType = 'Dialog';
    exports.setContent = function () {
    };
    exports.createBF = function (type, mainDOM) {
        if (mainDOM) {
            this.content = mainDOM.innerHTML;
        } else {
            mainDOM = document.createElement('div');
            this.main.appendChild(mainDOM);
        }
        this.helper.addPartClasses(type + '-panel', mainDOM);
        var properties = { main: mainDOM };
        var panelType = 'Panel';
        if (type === 'body') {
            properties.url = this.url;
            properties.actionOptions = this.actionOptions;
            panelType = 'ActionPanel';
        }
        var panel = ui.create(panelType, properties);
        if (type === 'body') {
            panel.on('actionattach', function () {
                this.resize();
                if (this.autoClose) {
                    var action = this.get('action');
                    if (typeof action.on === 'function') {
                        action.on('handlefinish', false);
                        action.on('handlefinish', this.dispose, this);
                    }
                }
                this.fire('actionattach');
            }, this);
            panel.on('*', function (e) {
                if (e.type.indexOf('action@') === 0) {
                    this.fire(e);
                }
            }, this);
            var Event = require('mini-event');
            Event.delegate(panel, this, 'actionloaded');
            Event.delegate(panel, this, 'actionloadfail');
            Event.delegate(panel, this, 'actionloadabort');
        }
        panel.render();
        this.addChild(panel, type);
        return panel;
    };
    exports.repaint = require('esui/painters').createRepaint(Dialog.prototype.repaint, {
        name: [
            'url',
            'actionOptions'
        ],
        paint: function (dialog, url, actionOptions) {
            var body = dialog.getBody();
            var properties = {
                    url: url,
                    actionOptions: actionOptions
                };
            body.setProperties(properties);
        }
    });
    exports.getAction = function () {
        var actionPanel = this.getBody();
        if (actionPanel) {
            return actionPanel.get('action');
        } else {
            return null;
        }
    };
    exports.reload = function () {
        var actionPanel = this.getBody();
        if (actionPanel) {
            actionPanel.reload();
        }
    };
    var ActionDialog = require('eoo').create(Dialog, exports);
    require('esui').register(ActionDialog);
    return ActionDialog;
});