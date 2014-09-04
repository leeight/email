define('bat-ria/ui/TreeRichSelector', [
    'require',
    'esui/Tree',
    'esui/painters',
    'esui/main',
    'esui/lib',
    'underscore',
    './RichSelector',
    './SelectorTreeStrategy',
    'esui'
], function (require) {
    require('esui/Tree');
    var painter = require('esui/painters');
    var ui = require('esui/main');
    var lib = require('esui/lib');
    var u = require('underscore');
    var RichSelector = require('./RichSelector');
    var TreeStrategy = require('./SelectorTreeStrategy');
    function TreeRichSelector(options) {
        RichSelector.apply(this, arguments);
    }
    lib.inherits(TreeRichSelector, RichSelector);
    TreeRichSelector.prototype.type = 'TreeRichSelector';
    TreeRichSelector.prototype.styleType = 'RichSelector';
    TreeRichSelector.prototype.initOptions = function (options) {
        var properties = {
                datasource: null,
                orientExpand: false,
                wideToggleArea: false,
                onlyLeafSelect: true,
                allowUnselectNode: false,
                hideRoot: true,
                treeSkin: 'flat'
            };
        lib.extend(properties, options);
        RichSelector.prototype.initOptions.call(this, properties);
    };
    TreeRichSelector.prototype.initStructure = function () {
        RichSelector.prototype.initStructure.apply(this, arguments);
        lib.addClass(this.main, 'ui-tree-richselector');
    };
    TreeRichSelector.prototype.repaint = painter.createRepaint(RichSelector.prototype.repaint, {
        name: 'datasource',
        paint: function (control, datasource) {
            control.refresh();
        }
    }, {
        name: 'selectedData',
        paint: function (control, selectedData) {
            var allData = control.allData;
            if (allData && allData.children) {
                control.selectItems(allData.children, false);
                control.selectItems(selectedData, true);
                control.fire('add');
            }
        }
    });
    TreeRichSelector.prototype.adaptData = function () {
        this.allData = this.datasource;
        var indexData = {};
        if (this.allData && this.allData.children) {
            indexData[this.allData.id] = {
                parentId: null,
                node: this.allData,
                isSelected: false
            };
            walkTree(this.allData, this.allData.children, function (parent, child) {
                indexData[child.id] = {
                    parentId: parent.id,
                    node: child,
                    isSelected: false
                };
            });
        }
        this.indexData = indexData;
    };
    TreeRichSelector.prototype.refreshContent = function () {
        var treeData = this.isQuery() ? this.queriedData : this.allData;
        if (!treeData || !treeData.children || !treeData.children.length) {
            this.addState('empty');
        } else {
            this.removeState('empty');
        }
        if (!treeData || !treeData.children) {
            return;
        }
        var queryList = this.getQueryList();
        var tree = queryList.getChild('tree');
        if (!tree) {
            var options = {
                    childName: 'tree',
                    datasource: treeData,
                    allowUnselectNode: this.allowUnselectNode,
                    strategy: new TreeStrategy({
                        mode: this.mode,
                        onlyLeafSelect: this.onlyLeafSelect,
                        orientExpand: this.orientExpand
                    }),
                    wideToggleArea: this.wideToggleArea,
                    hideRoot: this.hideRoot,
                    selectMode: this.multi ? 'multiple' : 'single',
                    skin: this.treeSkin
                };
            if (this.getItemHTML) {
                options.getItemHTML = this.getItemHTML;
            }
            tree = ui.create('Tree', options);
            queryList.addChild(tree);
            tree.appendTo(queryList.main);
            var me = this;
            var indexData = this.indexData;
            tree.on('selectnode', function (e) {
                var node = e.node;
                me.handlerAfterClickNode(node);
            });
            tree.on('unselectnode', function (e) {
                var node = e.node;
                if (indexData[node.id]) {
                    indexData[node.id].isSelected = false;
                }
            });
        } else {
            tree.setProperties({
                'datasource': u.deepClone(treeData),
                'keyword': this.getKeyword()
            });
        }
    };
    TreeRichSelector.prototype.handlerAfterClickNode = function (node) {
        var item = this.indexData[node.id];
        if (!item) {
            return;
        }
        if (this.mode === 'add') {
            actionForAdd(this, item);
        } else if (this.mode === 'delete') {
            actionForDelete(this, item);
        } else if (this.mode === 'load') {
            actionForLoad(this, item);
        }
    };
    function actionForAdd(control, item) {
        item.isSelected = true;
        if (!control.multi) {
            control.curSeleId = item.node.id;
        }
        control.fire('add');
    }
    function selectItem(control, id, toBeSelected) {
        var tree = control.getQueryList().getChild('tree');
        var indexData = control.indexData;
        var item = indexData[id];
        if (!item) {
            return;
        }
        if (!control.multi && toBeSelected) {
            unselectCurrent(control);
            control.curSeleId = id;
        }
        item.isSelected = toBeSelected;
        if (toBeSelected) {
            tree.selectNode(id, true);
        } else {
            tree.unselectNode(id, true);
        }
    }
    function unselectCurrent(control) {
        var curId = control.curSeleId;
        if (curId) {
            var treeList = control.getQueryList().getChild('tree');
            treeList.unselectNode(curId);
            control.curSeleId = null;
        }
    }
    TreeRichSelector.prototype.selectAll = function () {
        var data = this.isQuery() ? this.queriedData : this.allData;
        var children = data.children;
        var items = this.getLeafItems(children, false);
        var me = this;
        u.each(items, function (item) {
            selectItem(me, item.id, true);
        });
        this.fire('add');
    };
    TreeRichSelector.prototype.selectItems = function (nodes, toBeSelected) {
        var indexData = this.indexData;
        var me = this;
        u.each(nodes, function (node) {
            var id = node.id !== undefined ? node.id : node;
            var item = indexData[id];
            if (item !== null && item !== undefined) {
                var node = item.node;
                selectItem(me, node.id, toBeSelected);
            }
        });
    };
    function actionForDelete(control, item) {
        deleteItem(control, item.node.id);
        control.fire('delete', { items: [item.node] });
    }
    function deleteItem(control, id) {
        var indexData = control.indexData;
        var item = indexData[id];
        var parentId = item.parentId;
        var parentItem = indexData[parentId];
        var node;
        if (!parentItem) {
            node = control.allData;
        } else {
            node = parentItem.node;
        }
        var children = node.children || [];
        var newChildren = u.without(children, item.node);
        if (newChildren.length === 0 && parentId !== -1) {
            deleteItem(control, parentId);
        } else {
            node.children = newChildren;
            control.refresh();
        }
    }
    TreeRichSelector.prototype.deleteAll = function () {
        var items = u.deepClone(this.getSelectedItems());
        this.set('datasource', null);
        this.fire('delete', { items: items });
    };
    function actionForLoad(control, item) {
        selectItem(control, item.id, true);
        control.fire('load');
    }
    TreeRichSelector.prototype.getLeafItems = function (data, isSelected) {
        var leafItems = [];
        var me = this;
        var indexData = this.indexData;
        u.each(data, function (item) {
            if (isLeaf(item)) {
                var indexItem = indexData[item.id];
                var valid = isSelected === indexItem.isSelected;
                if (me.mode === 'delete' || valid) {
                    leafItems.push(item);
                }
            } else {
                leafItems = u.union(leafItems, me.getLeafItems(item.children, isSelected));
            }
        });
        return leafItems;
    };
    TreeRichSelector.prototype.getSelectedItems = function () {
        var data = this.allData.children;
        return this.getLeafItems(data, true);
    };
    TreeRichSelector.prototype.getSelectedTree = function () {
        var me = this;
        var copyData = u.deepClone(this.allData);
        var nodes = copyData.children;
        u.each(nodes, function (node) {
            var selectedChildren = getSelectedNodesUnder(node, me);
            if (selectedChildren.length) {
                node.children = selectedChildren;
            } else {
                node.children = null;
            }
        });
        var filteredNodes = u.filter(nodes, function (node) {
                return node.children;
            });
        copyData.children = filteredNodes;
        return copyData;
    };
    function getSelectedNodesUnder(parentNode, control) {
        var children = parentNode.children;
        var indexData = control.indexData;
        return u.filter(children, function (node) {
            var indexItem = indexData[node.id];
            return indexItem.isSelected;
        });
    }
    TreeRichSelector.prototype.clearQuery = function () {
        RichSelector.prototype.clearQuery.apply(this, arguments);
        this.selectItems(this.selectedData, true);
        return false;
    };
    TreeRichSelector.prototype.clearData = function () {
        this.queriedData = {};
    };
    TreeRichSelector.prototype.queryItem = function (keyword) {
        var filteredTreeData = [];
        filteredTreeData = queryFromNode(keyword, this.allData);
        this.queriedData = {
            id: '-1',
            text: '\u7B26\u5408\u6761\u4EF6\u7684\u7ED3\u679C',
            children: filteredTreeData
        };
        this.addState('queried');
        this.refreshContent();
        this.selectItems(this.selectedData, true);
    };
    function queryFromNode(keyword, node) {
        var filteredTreeData = [];
        var treeData = node.children;
        u.each(treeData, function (data, key) {
            var filteredData;
            if (data.text.indexOf(keyword) !== -1) {
                filteredData = u.clone(data);
            }
            if (data.children && data.children.length) {
                var filteredChildren = queryFromNode(keyword, data);
                if (filteredChildren.length > 0) {
                    if (!filteredData) {
                        filteredData = u.clone(data);
                    }
                    filteredData.children = filteredChildren;
                }
            }
            if (filteredData) {
                filteredTreeData.push(filteredData);
            }
        });
        return filteredTreeData;
    }
    function walkTree(parent, children, callback) {
        u.each(children, function (child, key) {
            callback(parent, child);
            walkTree(child, child.children, callback);
        });
    }
    function isLeaf(node) {
        return !node.children;
    }
    function getLeavesCount(node) {
        if (isLeaf(node)) {
            if (!node.id || node.id === '-1' || node.id === '0') {
                return 0;
            }
            return 1;
        }
        var count = u.reduce(node.children, function (sum, child) {
                return sum + getLeavesCount(child);
            }, 0);
        return count;
    }
    TreeRichSelector.prototype.getFilteredItemsCount = function () {
        var node = this.isQuery() ? this.queriedData : this.allData;
        var count = getLeavesCount(node);
        return count;
    };
    TreeRichSelector.prototype.getCurrentStateItemsCount = function () {
        var node = this.isQuery() ? this.queriedData : this.allData;
        if (!node) {
            return 0;
        }
        var count = getLeavesCount(node);
        return count;
    };
    require('esui').register(TreeRichSelector);
    return TreeRichSelector;
});