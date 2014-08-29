define('ef/ChildView', [
    'require',
    'underscore',
    'esui/Control',
    'esui/painters',
    'er/Deferred',
    'mini-event',
    'eoo',
    'esui'
], function (require) {
    var u = require('underscore');
    var Control = require('esui/Control');
    var exports = {};
    exports.type = 'ChildView';
    exports.repaint = require('esui/painters').createRepaint(Control.prototype.repaint, {
        name: 'viewType',
        paint: function (childView, viewType) {
            childView.disposeView();
            var Deferred = require('er/Deferred');
            childView.view = Deferred.require([viewType]);
            childView.view.then(u.bind(childView.fire, childView, 'viewloaded'));
            childView.view.then(u.bind(childView.renderView, childView));
        }
    });
    exports.disposeView = function () {
        var view = this.get('view');
        if (view && typeof view.dispose === 'function') {
            view.dispose();
        }
        this.view = null;
    };
    function delegateViewEvents(e) {
        var event = require('mini-event').fromEvent(e, {
                preserveData: true,
                syncState: true
            });
        event.type = 'view@' + e.type;
        this.fire(event);
    }
    exports.renderView = function (View) {
        if (this.helper.isInStage('RENDERED')) {
            this.loadedViewModule = View;
            var view = this.view = typeof View === 'function' ? new View() : View;
            view.model = this.get('model');
            view.container = this.main.id;
            view.render();
            this.fire('viewrendered');
            view.on('*', delegateViewEvents, this);
        }
    };
    exports.refresh = function () {
        var viewModule = this.get('loadedViewModule');
        if (!viewModule) {
            throw new Error('No view module loaded yet');
        }
        this.disposeView();
        this.renderView(viewModule);
    };
    var ChildView = require('eoo').create(Control, exports);
    require('esui').register(ChildView);
    return ChildView;
});