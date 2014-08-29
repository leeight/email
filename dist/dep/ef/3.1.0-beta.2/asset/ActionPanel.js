define('ef/ActionPanel', [
    'require',
    'er/events',
    'esui/Panel',
    'mini-event',
    'er/Deferred',
    'esui/painters',
    'er/controller',
    'eoo',
    'esui'
], function (require) {
    var events = require('er/events');
    var Panel = require('esui/Panel');
    var exports = {};
    exports.type = 'ActionPanel';
    exports.setContent = function () {
    };
    exports.actionType = null;
    exports.action = null;
    function delegateActionEvent(e) {
        var event = require('mini-event').fromEvent(e, {
                preserveData: true,
                syncState: true
            });
        event.type = 'action@' + e.type;
        this.fire(event);
    }
    function attachAction(e) {
        if (!e.isChildAction || e.container !== this.main.id) {
            return;
        }
        this.action = e.action;
        if (typeof this.action.on === 'function') {
            this.action.on('*', delegateActionEvent, this);
        }
        this.fire('actionattach');
    }
    function notifyActionLoadComplete(e) {
        if (!e.isChildAction || e.container !== this.main.id) {
            return;
        }
        this.fire('actionloaded');
    }
    function notifyActionLoadFailed(e) {
        if (!e.isChildAction || e.container !== this.main.id) {
            return;
        }
        this.action = null;
        this.fire('actionloadfail', {
            failType: e.failType,
            reason: e.reason
        });
    }
    function notifyActionLoadAborted(e) {
        if (!e.isChildAction || e.container !== this.main.id) {
            return;
        }
        this.fire('actionloadabort');
    }
    exports.initStructure = function () {
        events.on('enteraction', attachAction, this);
        events.on('enteractioncomplete', notifyActionLoadComplete, this);
        events.on('actionnotfound', notifyActionLoadFailed, this);
        events.on('permissiondenied', notifyActionLoadFailed, this);
        events.on('actionfail', notifyActionLoadFailed, this);
        events.on('enteractionfail', notifyActionLoadFailed, this);
        events.on('actionabort', notifyActionLoadAborted, this);
    };
    exports.disposeAction = function () {
        var Deferred = require('er/Deferred');
        var action = this.action;
        if (!action) {
            return;
        }
        if (Deferred.isPromise(action) && typeof action.abort === 'function') {
            action.abort();
        } else {
            if (typeof action.un === 'function') {
                action.un('*', delegateActionEvent, this);
            }
            if (typeof action.leave === 'function') {
                action.leave();
            }
        }
        this.action = null;
    };
    exports.repaint = require('esui/painters').createRepaint(Panel.prototype.repaint, {
        name: [
            'url',
            'actionOptions'
        ],
        paint: function (panel, url, actionOptions) {
            panel.disposeAction();
            if (!url) {
                return;
            }
            if (panel.lazy && panel.helper.isInStage('INITED')) {
                return;
            }
            var controller = require('er/controller');
            panel.action = controller.renderChildAction(url, panel.main.id, actionOptions);
            if (typeof panel.action.abort !== 'function') {
                panel.action = null;
            }
        }
    });
    exports.dispose = function () {
        this.disposeAction();
        events.un('enteraction', attachAction, this);
        events.un('enteractioncomplete', notifyActionLoadComplete, this);
        events.un('actionnotfound', notifyActionLoadFailed, this);
        events.un('permissiondenied', notifyActionLoadFailed, this);
        events.un('actionfail', notifyActionLoadFailed, this);
        events.un('enteractionfail', notifyActionLoadFailed, this);
        events.un('actionabort', notifyActionLoadAborted, this);
        this.$super(arguments);
    };
    exports.reload = function (actionOptions) {
        var url = this.url;
        this.url = null;
        this.setProperties({
            url: url,
            actionOptions: actionOptions
        });
    };
    var ActionPanel = require('eoo').create(Panel, exports);
    require('esui').register(ActionPanel);
    return ActionPanel;
});