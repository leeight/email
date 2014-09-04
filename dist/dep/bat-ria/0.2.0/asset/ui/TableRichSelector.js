define([
    'require',
    'esui/lib',
    'esui/painters',
    'underscore',
    './RichSelector',
    'esui'
], function (require) {
    var lib = require('esui/lib');
    var painter = require('esui/painters');
    var u = require('underscore');
    var RichSelector = require('./RichSelector');
    function TableRichSelector(options) {
        RichSelector.apply(this, arguments);
    }
    lib.inherits(TableRichSelector, RichSelector);
    TableRichSelector.prototype.type = 'TableRichSelector';
    TableRichSelector.prototype.styleType = 'RichSelector';
    TableRichSelector.prototype.initOptions = function (options) {
        var properties = {
                hasRowHead: true,
                hasIcon: true,
                firedOnIcon: false,
                datasource: [],
                selectedData: [],
                fields: []
            };
        if (options.hasRowHead === 'false') {
            options.hasRowHead = false;
        }
        if (options.hasIcon === 'false') {
            options.hasIcon = false;
        }
        if (options.firedOnIcon === 'false') {
            options.firedOnIcon = false;
        }
        lib.extend(properties, options);
        RichSelector.prototype.initOptions.call(this, properties);
    };
    TableRichSelector.prototype.initStructure = function () {
        RichSelector.prototype.initStructure.apply(this, arguments);
        lib.addClass(this.main, 'ui-table-richselector');
    };
    TableRichSelector.prototype.repaint = painter.createRepaint(RichSelector.prototype.repaint, {
        name: [
            'datasource',
            'selectedData',
            'disabledData'
        ],
        paint: function (control, datasource, selectedData, disabledData) {
            control.refresh();
        }
    });
    TableRichSelector.prototype.adaptData = function () {
        var allData = u.deepClone(this.datasource);
        var indexData = {};
        u.each(allData, function (item, index) {
            indexData[item.id] = index;
        });
        this.indexData = indexData;
        var selectedData = this.selectedData || [];
        if (!this.multi && selectedData.length) {
            this.curSeleId = selectedData[0].id;
        }
        u.each(selectedData, function (item, index) {
            var selectedIndex = indexData[item.id];
            if (selectedIndex !== undefined) {
                allData[selectedIndex].isSelected = true;
            }
        });
        var disabledData = this.disabledData || [];
        u.each(disabledData, function (item, index) {
            var selectedIndex = indexData[item.id];
            if (selectedIndex !== undefined) {
                allData[selectedIndex].isDisabled = true;
            }
        });
        this.allData = allData;
    };
    TableRichSelector.prototype.refreshContent = function () {
        var data = this.isQuery() ? this.queriedData : this.allData;
        if (!data || data.length === 0) {
            this.addState('empty');
        } else {
            this.removeState('empty');
        }
        var htmlArray = [];
        if (this.hasRowHead) {
            htmlArray.push(createTableHead(this));
        }
        htmlArray.push(createTableContent(this, data));
        var queryList = this.getQueryList();
        queryList.setContent(htmlArray.join(''));
    };
    function createTableHead(control) {
        var tableClass = control.helper.getPartClassName('head-table');
        var tpl = ['<table border=0 class="' + tableClass + '"><tr>'];
        var colmNum = control.fields.length;
        for (var i = 0; i < colmNum; i++) {
            var field = control.fields[i];
            tpl.push('' + '<th class="th' + i + '"' + ' style="width:' + field.width + 'px;">' + field.title || '' + '</th>');
        }
        tpl.push('<th style="width:30px;"></th>');
        tpl.push('</tr></table>');
        return tpl.join(' ');
    }
    TableRichSelector.prototype.rowTpl = '' + '<tr id="${rowId}" class="${rowClass}" ' + 'index="${index}">${content}</tr>';
    function createTableContent(control, data) {
        var indexData = control.indexData;
        var helper = control.helper;
        var tableClasses = helper.getPartClassName('content-table');
        var tpl = ['<table border=0 class="' + tableClasses + '">'];
        var baseRowClasses = helper.getPartClassName('row');
        var selectedRowClasses = helper.getPartClassName('row-selected');
        var disabledRowClasses = helper.getPartClassName('row-disabled');
        u.each(data, function (item, index) {
            var rowClasses = [baseRowClasses];
            if (item.isSelected) {
                rowClasses.push(selectedRowClasses);
            }
            if (item.isDisabled) {
                rowClasses.push(disabledRowClasses);
            }
            tpl.push(lib.format(control.rowTpl, {
                rowId: control.helper.getId('row-' + item.id),
                rowClass: rowClasses.join(' '),
                index: indexData[item.id],
                content: createRow(control, item, index)
            }));
        });
        tpl.push('</table>');
        return tpl.join(' ');
    }
    function createRow(control, item, index, tr) {
        var fields = control.fields;
        var html = [];
        var fieldClasses = control.helper.getPartClassName('row-field');
        u.each(fields, function (field, i) {
            var content = field.content;
            var innerHTML = 'function' === typeof content ? content.call(control, item, index, i) : item[content];
            if (tr) {
                var td = tr.insertCell();
                td.style.width = field.width + 'px';
                td.title = innerHTML;
                td.innerHTML = innerHTML;
            } else {
                var contentHtml = '' + '<td class="' + fieldClasses + '" title="' + innerHTML + '" style="width:' + field.width + 'px;">' + innerHTML + '</td>';
                html.push(contentHtml);
            }
        });
        var arrowClasses = control.helper.getPartClassName('row-action-icon');
        var arrowHTML = '<span class="' + arrowClasses + '"></span>';
        if (tr) {
            var td = tr.insertCell();
            td.style.width = '30px';
            td.innerHTML = arrowHTML;
        } else {
            html.push('<td style="width:30px;">' + arrowHTML + '</td>');
            return html.join(' ');
        }
    }
    TableRichSelector.prototype.eventDispatcher = function (e) {
        var tar = e.target;
        var helper = this.helper;
        var rowClasses = helper.getPartClassName('row');
        var actionClasses = helper.getPartClassName('row-action-icon');
        while (tar && tar !== document.body) {
            var rowDOM;
            if (this.hasIcon && this.fireOnIcon && lib.hasClass(tar, actionClasses)) {
                rowDOM = tar.parentNode;
            } else {
                if (lib.hasClass(tar, rowClasses)) {
                    rowDOM = tar;
                }
            }
            if (rowDOM) {
                this.operateRow(rowDOM);
                return;
            }
            tar = tar.parentNode;
        }
    };
    TableRichSelector.prototype.operateRow = function (row) {
        var disabledClasses = this.helper.getPartClassName('row-disabled');
        if (lib.hasClass(row, disabledClasses)) {
            return;
        }
        var index = parseInt(row.getAttribute('index'), 10);
        var item = this.allData[index];
        if (!item) {
            return;
        }
        if (this.mode === 'add') {
            actionForAdd(this, row, item);
        } else if (this.mode === 'delete') {
            actionForDelete(this, row, item);
        } else if (this.mode === 'load') {
            actionForLoad(this, row, item);
        }
    };
    function actionForAdd(control, row, item) {
        var selectedClasses = control.helper.getPartClassName('row-selected');
        var fire = false;
        if (lib.hasClass(row, selectedClasses)) {
            if (!control.multi) {
                selectItem(control, item.id, false);
                fire = true;
            }
        } else {
            selectItem(control, item.id, true);
            fire = true;
        }
        if (fire) {
            control.fire('add');
        }
    }
    function selectItem(control, id, toBeSelected) {
        var indexData = control.indexData;
        var data = control.allData;
        var index = indexData[id];
        var item = data[index];
        if (!control.multi) {
            unselectCurrent(control);
            control.curSeleId = toBeSelected ? id : null;
        }
        updateSingleItemStatus(control, item, toBeSelected);
    }
    function unselectCurrent(control) {
        var curId = control.curSeleId;
        if (curId) {
            var index = control.indexData[curId];
            var item = control.allData[index];
            updateSingleItemStatus(control, item, false);
            control.curSeleId = null;
        }
    }
    function updateSingleItemStatus(control, item, toBeSelected) {
        if (!item) {
            return;
        }
        item.isSelected = toBeSelected;
        var itemDOM = control.helper.getPart('row-' + item.id);
        var changeClass = toBeSelected ? lib.addClass : lib.removeClass;
        changeClass(itemDOM, control.helper.getPartClassName('row-selected'));
    }
    TableRichSelector.prototype.selectAll = function () {
        var data = this.isQuery() ? this.queriedData : this.allData;
        var me = this;
        u.each(data, function (item) {
            selectItem(me, item.id, true);
        });
        this.fire('add');
    };
    TableRichSelector.prototype.selectItems = function (items, toBeSelected) {
        var allData = this.allData;
        var indexData = this.indexData;
        var me = this;
        u.each(items, function (item) {
            var id = item.id !== 'undefined' ? item.id : item;
            var itemIndex = indexData[id];
            if (itemIndex !== null && itemIndex !== undefined) {
                var rawItem = allData[itemIndex];
                selectItem(me, rawItem.id, toBeSelected);
            }
        });
    };
    function actionForDelete(control, row, item) {
        deleteItem(control, item.id);
        control.fire('delete', { items: [item] });
    }
    function deleteItem(control, id) {
        var indexData = control.indexData;
        var index = indexData[id];
        var newData = [].slice.call(control.datasource, 0);
        newData.splice(index, 1);
        control.set('datasource', newData);
    }
    TableRichSelector.prototype.deleteAll = function () {
        var items = u.clone(this.datasource);
        this.set('datasource', []);
        this.fire('delete', { items: items });
    };
    function actionForLoad(control, row, item) {
        var selectedClasses = control.helper.getPartClassName('row-selected');
        if (!lib.hasClass(row, selectedClasses)) {
            selectItem(control, item.id, true);
            control.fire('load');
        }
    }
    TableRichSelector.prototype.queryItem = function (keyword) {
        var queriedData = [];
        u.each(this.allData, function (data, index) {
            if (data.name.indexOf(keyword) !== -1) {
                queriedData.push(data);
            }
        });
        this.queriedData = queriedData;
        this.addState('queried');
        this.refreshContent();
    };
    TableRichSelector.prototype.clearData = function () {
        this.queriedData = [];
    };
    TableRichSelector.prototype.getSelectedItems = function () {
        var rawData = this.datasource;
        var allData = this.allData;
        var mode = this.mode;
        if (mode === 'delete') {
            return allData;
        }
        var selectedData = u.filter(rawData, function (item, index) {
                return allData[index].isSelected;
            });
        return selectedData;
    };
    TableRichSelector.prototype.getCurrentStateItemsCount = function () {
        var data = this.isQuery() ? this.queriedData : this.allData;
        data = data || [];
        return data.length;
    };
    require('esui').register(TableRichSelector);
    return TableRichSelector;
});