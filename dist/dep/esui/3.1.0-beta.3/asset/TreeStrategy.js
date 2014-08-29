define('esui/TreeStrategy', [
    'require',
    'underscore'
], function (require) {
    var u = require('underscore');
    function TreeStrategy(options) {
        var defaults = { defaultExpand: false };
        u.extend(this, defaults, options);
    }
    TreeStrategy.prototype.isLeafNode = function (node) {
        return !node.children || !node.children.length;
    };
    TreeStrategy.prototype.shouldExpand = function (node) {
        return this.defaultExpand;
    };
    TreeStrategy.prototype.attachTo = function (tree) {
        this.enableToggleStrategy(tree);
        this.enableSelectStrategy(tree);
    };
    TreeStrategy.prototype.enableToggleStrategy = function (tree) {
        tree.on('expand', function (e) {
            this.expandNode(e.node.id);
        });
        tree.on('collapse', function (e) {
            this.collapseNode(e.node.id, false);
        });
    };
    TreeStrategy.prototype.enableSelectStrategy = function (tree) {
        tree.on('select', function (e) {
            this.selectNode(e.node.id);
        });
        tree.on('unselect', function (e) {
            if (tree.get('allowUnselectNode')) {
                tree.unselectNode(e.node.id);
            }
        });
    };
    return TreeStrategy;
});