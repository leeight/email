define('ef/RemoteTreeStrategy', [
    'require',
    'esui/lib',
    'esui/TreeStrategy',
    'er/ajax',
    'eoo'
], function (require) {
    var lib = require('esui/lib');
    var TreeStrategy = require('esui/TreeStrategy');
    var exports = {};
    exports.constructor = function (options) {
        if (options.requestMethod) {
            options.requestMethod = options.requestMethod.toLowerCase();
        }
        TreeStrategy.apply(this, arguments);
        this.workingRequests = {};
    };
    exports.urlTemplate = '';
    exports.requestMethod = 'get';
    exports.getRequestURL = function (node) {
        return lib.format(this.urlTemplate, node);
    };
    exports.getRequestData = function (node) {
        return null;
    };
    exports.requestNodeData = function (node) {
        var url = this.getRequestURL(node);
        var data = this.getRequestData(node);
        var ajax = require('er/ajax');
        return this.requestMethod === 'get' ? ajax.getJSON(url, data, this.useCache || false) : ajax.post(url, data, 'json');
    };
    function expandNode(tree, strategy, e) {
        var node = e.node;
        if (node.children) {
            tree.expandNode(node.id);
            return;
        }
        var xhr = tree.workingRequests[node.id];
        if (xhr) {
            xhr.abort();
        }
        xhr = this.requestNodeData(node);
        tree.workingRequests[node.id] = xhr;
        xhr.done(lib.bind(tree.expandNode, tree, node.id));
    }
    exports.enableToggleStrategy = function (tree) {
        tree.on('expand', lib.curry(expandNode, tree, this));
        tree.on('collapse', function (e) {
            this.collapseNode(e.node.id, false);
        });
    };
    var RemoteTreeStrategy = require('eoo').create(TreeStrategy, exports);
    lib.inherits(RemoteTreeStrategy, TreeStrategy);
    return RemoteTreeStrategy;
});