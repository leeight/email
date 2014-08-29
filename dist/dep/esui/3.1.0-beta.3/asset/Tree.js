define('esui/Tree', [
    'require',
    './Control',
    './lib',
    './controlHelper',
    './TreeStrategy',
    './main'
], function (require) {
    var Control = require('./Control');
    var lib = require('./lib');
    var helper = require('./controlHelper');
    var TreeStrategy = require('./TreeStrategy');
    function NullTreeStrategy() {
        TreeStrategy.apply(this, arguments);
    }
    NullTreeStrategy.prototype.attachTo = function () {
    };
    lib.inherits(NullTreeStrategy, TreeStrategy);
    function Tree() {
        Control.apply(this, arguments);
    }
    Tree.prototype.type = 'Tree';
    Tree.defaultProperties = {
        selectMode: 'single',
        hideRoot: false
    };
    Tree.prototype.initOptions = function (options) {
        var defaults = {
                datasource: {},
                strategy: new NullTreeStrategy(),
                selectedNodes: [],
                selectedNodeIndex: {}
            };
        var properties = lib.extend(defaults, Tree.defaultProperties, options);
        if (properties.allowUnselectNode == null) {
            properties.allowUnselectNode = properties.selectMode !== 'single';
        }
        this.setProperties(properties);
    };
    Tree.prototype.itemTemplate = '<span>${text}</span>';
    Tree.prototype.getItemHTML = function (node) {
        var data = {
                id: lib.encodeHTML(node.id),
                text: lib.encodeHTML(node.text)
            };
        return lib.format(this.itemTemplate, data);
    };
    var INDICATOR_TEXT_MAPPING = {
            'collapsed': '\u5C55\u5F00',
            'expanded': '\u6536\u8D77',
            'busy': '\u52A0\u8F7D\u4E2D',
            'empty': '\u65E0\u5185\u5BB9'
        };
    function getIndicatorHTML(tree, node, type, currentLevel, sourceLevel) {
        var diff = sourceLevel - currentLevel;
        var diffType = diff === 0 ? 'current' : diff === 1 ? 'previous' : 'far-previous';
        var classes = [].concat(helper.getPartClasses(tree, 'node-indicator'), helper.getPartClasses(tree, 'node-indicator-' + type), helper.getPartClasses(tree, 'node-indicator-level-' + currentLevel), helper.getPartClasses(tree, 'node-indicator-' + diffType));
        var text = diff === 0 ? INDICATOR_TEXT_MAPPING[type || 'collapsed'] : '\u7B2C' + currentLevel + '\u7EA7';
        var html = '<span ';
        if (diff === 0) {
            html += 'id="' + helper.getId(tree, 'indicator-' + node.id) + '" ';
        }
        html += 'class="' + classes.join(' ') + '">' + text + '</span>';
        return html;
    }
    function getNodeContentHTML(tree, node, level, expanded) {
        var wrapperClasses = helper.getPartClasses(tree, 'content-wrapper');
        if (tree.selectedNodeIndex[node.id]) {
            wrapperClasses = wrapperClasses.concat(helper.getPartClasses(tree, 'content-wrapper-selected'));
        }
        wrapperClasses = wrapperClasses.join(' ');
        var wrapperId = helper.getId(tree, 'content-wrapper-' + node.id);
        var html = '<div id="' + wrapperId + '" class="' + wrapperClasses + '">';
        var indicatorType = tree.strategy.isLeafNode(node) ? 'empty' : expanded ? 'expanded' : 'collapsed';
        for (var i = 0; i <= level; i++) {
            html += getIndicatorHTML(tree, node, indicatorType, i, level);
        }
        var itemWrapperClasses = helper.getPartClasses(tree, 'item-content');
        html += '<div class="' + itemWrapperClasses.join(' ') + '">' + tree.getItemHTML(node) + '</div>';
        html += '</div>';
        if (expanded && !tree.strategy.isLeafNode(node)) {
            var classes = [].concat(helper.getPartClasses(tree, 'sub-root'), helper.getPartClasses(tree, 'sub-root-' + indicatorType));
            html += '<ul class="' + classes.join(' ') + '">';
            for (var i = 0; i < node.children.length; i++) {
                var child = node.children[i];
                html += getNodeHTML(tree, child, level + 1, tree.strategy.shouldExpand(child));
            }
            html += '</ul>';
        }
        return html;
    }
    function getNodeClasses(tree, node, level, expanded) {
        var state = tree.strategy.isLeafNode(node) ? 'empty' : expanded ? 'expanded' : 'collapsed';
        var classes = [].concat(helper.getPartClasses(tree, 'node'), helper.getPartClasses(tree, 'node-' + state), helper.getPartClasses(tree, 'node-level-' + level));
        if (node === tree.datasource) {
            classes = [].concat(helper.getPartClasses(tree, 'root'), helper.getPartClasses(tree, 'root-' + state), classes);
        }
        return classes;
    }
    function getNodeHTML(tree, node, level, expanded, nodeName) {
        nodeName = nodeName || 'li';
        var classes = getNodeClasses(tree, node, level, expanded);
        var html = '<' + nodeName + ' class="' + classes.join(' ') + '" ' + 'id="' + helper.getId(tree, 'node-' + node.id) + '" ' + 'data-id="' + node.id + '" data-level="' + level + '">';
        html += getNodeContentHTML(tree, node, level, expanded);
        html += '</' + nodeName + '>';
        return html;
    }
    function toggleAndSelectNode(e) {
        var target = e.target;
        var indicatorClass = helper.getPartClasses(this, 'node-indicator')[0];
        var isValidToggleEvent = lib.hasClass(target, indicatorClass);
        var isValidSelectEvent = !isValidToggleEvent;
        if (!isValidToggleEvent) {
            var wrapperClass = helper.getPartClasses(this, 'content-wrapper')[0];
            while (target && target !== this.main && !lib.hasClass(target, wrapperClass)) {
                target = target.parentNode;
            }
            if (lib.hasClass(target, wrapperClass)) {
                isValidToggleEvent = this.wideToggleArea;
                isValidSelectEvent = isValidSelectEvent && true;
            }
        }
        if (!isValidToggleEvent && !isValidSelectEvent) {
            return;
        }
        while (target && target !== this.main && !lib.hasAttribute(target, 'data-id')) {
            target = target.parentNode;
        }
        var id = target.getAttribute('data-id');
        if (isValidToggleEvent) {
            this.triggerToggleStrategy(id);
        }
        if (isValidSelectEvent) {
            this.triggerSelectStrategy(id);
        }
    }
    Tree.prototype.clickNode = function (e) {
        toggleAndSelectNode.apply(this, arguments);
    };
    Tree.prototype.initStructure = function () {
        this.strategy.attachTo(this);
    };
    Tree.prototype.initEvents = function () {
        helper.addDOMEvent(this, this.main, 'click', this.clickNode);
    };
    function buildNodeIndex(node, index) {
        index = index || {};
        index[node.id] = node;
        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                buildNodeIndex(node.children[i], index);
            }
        }
        return index;
    }
    Tree.prototype.repaint = helper.createRepaint(Control.prototype.repaint, {
        name: 'datasource',
        paint: function (tree, datasource) {
            tree.selectedNodes = [];
            tree.selectedNodeIndex = {};
            tree.nodeIndex = buildNodeIndex(datasource);
            tree.main.innerHTML = getNodeHTML(tree, datasource, 0, true, 'div');
        }
    }, {
        name: 'hideRoot',
        paint: function (tree, hideRoot) {
            var method = hideRoot ? 'addState' : 'removeState';
            tree[method]('hide-root');
        }
    });
    Tree.prototype.triggerSelectStrategy = function (id) {
        var node = this.nodeIndex[id];
        if (!node) {
            return;
        }
        if (this.selectedNodeIndex[id]) {
            this.fire('unselect', { node: node });
        } else {
            this.fire('select', { node: node });
        }
    };
    Tree.prototype.getSelectedNodes = function () {
        return this.selectedNodes.slice();
    };
    function addSelectedNode(tree, node) {
        if (tree.selectedNodeIndex[node.id]) {
            return false;
        }
        tree.selectedNodes.push(node);
        tree.selectedNodeIndex[node.id] = node;
        return true;
    }
    function removeSelectedNode(tree, node) {
        if (tree.selectedNodeIndex[node.id]) {
            delete tree.selectedNodeIndex[node.id];
            for (var i = 0; i < tree.selectedNodes.length; i++) {
                if (tree.selectedNodes[i] === node) {
                    tree.selectedNodes.splice(i, 1);
                }
            }
            return true;
        }
        return false;
    }
    Tree.prototype.toggleNodeSelection = function (id) {
        var method = this.selectedNodeIndex[id] ? 'unselectNode' : 'selectNode';
        this[method](id);
    };
    function unselectNode(tree, id, options) {
        if (!options.force && !tree.allowUnselectNode) {
            return;
        }
        var node = tree.nodeIndex[id];
        if (!node) {
            return;
        }
        var removed = removeSelectedNode(tree, node);
        if (removed) {
            if (options.modifyDOM) {
                var nodeElement = lib.g(helper.getId(tree, 'content-wrapper-' + id));
                helper.removePartClasses(tree, 'content-wrapper-selected', nodeElement);
            }
            if (!options.silent) {
                tree.fire('unselectnode', { node: node });
                tree.fire('selectionchange');
            }
        }
    }
    Tree.prototype.selectNode = function (id, silent) {
        var node = this.nodeIndex[id];
        if (!node) {
            return;
        }
        var added = addSelectedNode(this, node);
        if (!added) {
            return;
        }
        if (this.selectMode === 'single' && this.selectedNodes.length > 1) {
            unselectNode(this, this.selectedNodes[0].id, {
                force: true,
                silent: true,
                modifyDOM: true
            });
        }
        var nodeElement = lib.g(helper.getId(this, 'content-wrapper-' + id));
        helper.addPartClasses(this, 'content-wrapper-selected', nodeElement);
        if (!silent) {
            this.fire('selectnode', { node: node });
            this.fire('selectionchange');
        }
    };
    Tree.prototype.unselectNode = function (id) {
        unselectNode(this, id, {
            force: true,
            silent: false,
            modifyDOM: true
        });
    };
    Tree.prototype.expandNode = function (id, children) {
        var nodeElement = lib.g(helper.getId(this, 'node-' + id));
        if (!nodeElement) {
            return;
        }
        var level = +lib.getAttribute(nodeElement, 'data-level');
        if (children || nodeElement.lastChild.nodeName.toLowerCase() !== 'ul') {
            var node = this.nodeIndex[id];
            if (!node) {
                return;
            }
            if (children) {
                if (node.children) {
                    for (var i = 0; i < node.children.length; i++) {
                        unselectNode(this, node.children[i].id, {
                            force: true,
                            silent: true,
                            modifyDOM: false
                        });
                        this.nodeIndex[node.children[i].id] = undefined;
                    }
                }
                node.children = children;
                buildNodeIndex(node, this.nodeIndex);
            }
            nodeElement.innerHTML = getNodeContentHTML(this, node, level, true);
        } else {
            var indicator = lib.g(helper.getId(this, 'indicator-' + id));
            indicator.innerHTML = INDICATOR_TEXT_MAPPING.expanded;
            var indicatorClasses = [].concat(helper.getPartClasses(this, 'node-indicator'), helper.getPartClasses(this, 'node-indicator-level-' + level), helper.getPartClasses(this, 'node-indicator-current'), helper.getPartClasses(this, 'node-indicator-expanded'));
            indicator.className = indicatorClasses.join(' ');
            var rootClasses = [].concat(helper.getPartClasses(this, 'sub-root'), helper.getPartClasses(this, 'sub-root-expanded'));
            nodeElement.lastChild.className = rootClasses.join(' ');
        }
        var node = this.nodeIndex[id];
        var nodeClasses = getNodeClasses(this, node, level, true);
        nodeElement.className = nodeClasses.join(' ');
    };
    Tree.prototype.collapseNode = function (id, removeChild) {
        var nodeElement = lib.g(helper.getId(this, 'node-' + id));
        if (!nodeElement) {
            return;
        }
        var node = this.nodeIndex[id];
        var childRoot = nodeElement.getElementsByTagName('ul')[0];
        if (childRoot) {
            if (removeChild) {
                childRoot.parentNode.removeChild(childRoot);
                if (node.children) {
                    for (var i = 0; i < node.children.length; i++) {
                        unselectNode(this, node.children[i].id, {
                            force: true,
                            silent: false,
                            modifyDOM: false
                        });
                    }
                }
            } else {
                var rootClasses = [].concat(helper.getPartClasses(this, 'sub-root'), helper.getPartClasses(this, 'sub-root-collapsed'));
                childRoot.className = rootClasses.join(' ');
            }
        }
        var level = +lib.getAttribute(nodeElement, 'data-level');
        var nodeClasses = getNodeClasses(this, node, level, false);
        nodeElement.className = nodeClasses.join(' ');
        var indicator = lib.g(helper.getId(this, 'indicator-' + id));
        var indicatorClasses = [].concat(helper.getPartClasses(this, 'node-indicator'), helper.getPartClasses(this, 'node-indicator-level-' + level), helper.getPartClasses(this, 'node-indicator-current'), helper.getPartClasses(this, 'node-indicator-collapsed'));
        indicator.className = indicatorClasses.join(' ');
        indicator.innerHTML = INDICATOR_TEXT_MAPPING.collapsed;
    };
    function isEmpty(tree, nodeElement) {
        var className = helper.getPartClasses(tree, 'node-empty')[0];
        return lib.hasClass(nodeElement, className);
    }
    function isExpanded(tree, nodeElement) {
        var className = helper.getPartClasses(tree, 'node-expanded')[0];
        return lib.hasClass(nodeElement, className);
    }
    Tree.prototype.toggleNode = function (id, children, removeChild) {
        if (!this.nodeIndex[id]) {
            return;
        }
        var nodeElement = lib.g(helper.getId(this, 'node-' + id));
        if (!nodeElement) {
            return;
        }
        if (isEmpty(this, nodeElement)) {
            return;
        }
        if (isExpanded(this, nodeElement)) {
            this.collapseNode(id, removeChild);
        } else {
            this.expandNode(id, children);
        }
    };
    Tree.prototype.triggerToggleStrategy = function (id) {
        var node = this.nodeIndex[id];
        if (!node) {
            return;
        }
        var nodeElement = lib.g(helper.getId(this, 'node-' + id));
        if (!nodeElement) {
            return;
        }
        if (isEmpty(this, nodeElement)) {
            return;
        }
        if (isExpanded(this, nodeElement)) {
            this.fire('collapse', { node: node });
        } else {
            this.fire('expand', { node: node });
        }
    };
    Tree.prototype.indicateNodeLoading = function (id) {
        var nodeElement = lib.g(helper.getId(this, 'node-' + id));
        if (!nodeElement) {
            return;
        }
        var children = lib.getChildren(nodeElement);
        var level = 0;
        while (!this.helper.isPart(children[level], 'item-content')) {
            level++;
        }
        var indicator = children[level];
        indicator.innerHTML = INDICATOR_TEXT_MAPPING.busy;
        var classes = [].concat(helper.getPartClasses(this, 'node-indicator'), helper.getPartClasses(this, 'node-indicator-level-' + level), helper.getPartClasses(this, 'node-indicator-current'), helper.getPartClasses(this, 'node-indicator-busy'));
        indicator.className = classes.join(' ');
    };
    Tree.prototype.dispose = function () {
        Control.prototype.dispose.apply(this, arguments);
        this.nodeIndex = null;
        this.selectedNodes = null;
        this.selectedNodeIndex = null;
    };
    require('./main').register(Tree);
    lib.inherits(Tree, Control);
    return Tree;
});