define('bat-ria/ui/SelectorTreeStrategy', [
    'require',
    'esui/lib',
    'esui/TreeStrategy'
], function (require) {
    var lib = require('esui/lib');
    var TreeStrategy = require('esui/TreeStrategy');
    function SelectorTreeStrategy(options) {
        var defaults = {
                defaultExpand: true,
                orientExpand: false
            };
        lib.extend(this, defaults, options);
    }
    lib.inherits(SelectorTreeStrategy, TreeStrategy);
    SelectorTreeStrategy.prototype.isLeafNode = function (node) {
        return !node.children;
    };
    SelectorTreeStrategy.prototype.shouldExpand = function (node) {
        if (this.orientExpand) {
            return !node.isSelected;
        } else {
            return this.defaultExpand;
        }
    };
    SelectorTreeStrategy.prototype.enableSelectStrategy = function (tree) {
        var me = this;
        tree.on('select', function (e) {
            var canSelect = true;
            var isLeafNode = me.isLeafNode(e.node);
            if (me.mode !== 'load') {
                if (me.onlyLeafSelect && !isLeafNode) {
                    canSelect = false;
                }
            }
            if (canSelect) {
                this.selectNode(e.node.id);
            }
        });
        tree.on('unselect', function (e) {
            if (tree.get('allowUnselectNode')) {
                tree.unselectNode(e.node.id);
            }
        });
    };
    return SelectorTreeStrategy;
});