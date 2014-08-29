define('esui/Table', [
    'require',
    './lib',
    'underscore',
    './controlHelper',
    './Control',
    './main'
], function (require) {
    var lib = require('./lib');
    var u = require('underscore');
    var helper = require('./controlHelper');
    var Control = require('./Control');
    function Table(options) {
        var protectedProperties = {
                followHeightArr: [
                    0,
                    0
                ],
                followWidthArr: [],
                handlers: []
            };
        Control.call(this, u.extend({}, options, protectedProperties));
    }
    Table.defaultProperties = {
        noDataHtml: '\u6CA1\u6709\u6570\u636E',
        noFollowHeadCache: false,
        followHead: false,
        sortable: false,
        encode: false,
        columnResizable: false,
        rowWidthOffset: -1,
        select: '',
        selectMode: 'box',
        subrowMutex: 1,
        subEntryOpenTip: '\u70B9\u51FB\u5C55\u5F00',
        subEntryCloseTip: '\u70B9\u51FB\u6536\u8D77',
        subEntryWidth: 18,
        breakLine: false,
        hasTip: false,
        hasSubrow: false,
        tipWidth: 18,
        sortWidth: 9,
        fontSize: 13,
        colPadding: 8,
        zIndex: 0
    };
    function hasValue(obj) {
        return !(typeof obj === 'undefined' || obj === null);
    }
    function isNullOrEmpty(obj) {
        return !hasValue(obj) || !obj.toString().length;
    }
    function setAttr(element, key, value) {
        lib.setAttribute(element, 'data-' + key, value);
    }
    function getAttr(element, key) {
        return lib.getAttribute(element, 'data-' + key);
    }
    function getStyleNum(dom, styleName) {
        var result = lib.getStyle(dom, styleName);
        return result === '' ? 0 : parseInt(result, 10) || 0;
    }
    function getId(table, name) {
        return helper.getId(table, name);
    }
    function getClass(table, name) {
        return helper.getPartClasses(table, name).join(' ');
    }
    function getHead(table) {
        return lib.g(getId(table, 'head'));
    }
    function getBody(table) {
        return lib.g(getId(table, 'body'));
    }
    function getFoot(table) {
        return lib.g(getId(table, 'foot'));
    }
    function getRow(table, index) {
        return lib.g(getId(table, 'row') + index);
    }
    function getHeadCheckbox(table) {
        return lib.g(getId(table, 'select-all'));
    }
    function setSelectedIndex(table, selectedIndex) {
        table.selectedIndex = selectedIndex;
        var selectedIndexMap = {};
        for (var i = selectedIndex.length - 1; i >= 0; i--) {
            selectedIndexMap[selectedIndex[i]] = 1;
        }
        table.selectedIndexMap = selectedIndexMap;
    }
    function isRowSelected(table, index) {
        if (table.selectedIndexMap) {
            return !!table.selectedIndexMap[index];
        }
        return false;
    }
    function getWidth(table) {
        if (table.width) {
            return table.width;
        }
        var rulerDiv = document.createElement('div');
        var parent = table.main.parentNode;
        parent.appendChild(rulerDiv);
        var width = rulerDiv.offsetWidth;
        rulerDiv.parentNode.removeChild(rulerDiv);
        return width;
    }
    function initFields(table) {
        if (!table.fields) {
            return;
        }
        var fields = table.fields;
        var realFields = fields.slice(0);
        var len = realFields.length;
        while (len--) {
            if (!realFields[len]) {
                realFields.splice(len, 1);
            }
        }
        table.realFields = realFields;
        if (!table.select) {
            return;
        }
        switch (table.select.toLowerCase()) {
        case 'multi':
            realFields.unshift(getMultiSelectField(table));
            break;
        case 'single':
            realFields.unshift(getSingleSelectField(table));
            break;
        }
    }
    var tplTablePrefix = '<table ' + 'cellpadding="0" ' + 'cellspacing="0" ' + 'width="${width}" ' + 'data-control-table="${controlTableId}">';
    function initFollowHead(table) {
        if (table.followHead) {
            cachingFollowDoms(table);
            if (!table.noFollowHeadCache) {
                resetFollowOffset(table);
            }
        }
    }
    function resetFollowHead(table) {
        if (table.followHead) {
            cachingFollowDoms(table);
            resetFollowOffset(table);
        }
    }
    function cachingFollowDoms(table) {
        if (!table.followHead) {
            return;
        }
        var followDoms = table.followDoms = [];
        var walker = table.main.parentNode.firstChild;
        var tableId = table.id;
        while (walker) {
            if (walker.nodeType === 1 && getAttr(walker, 'follow-thead') === tableId) {
                followDoms.push(walker);
            }
            walker = walker.nextSibling;
        }
        resetFollowDomsWidth(table);
        resetFollowHeight(table);
    }
    function resetFollowHeight(table) {
        var followDoms = table.followDoms;
        var followHeights = table.followHeightArr;
        followHeights[0] = 0;
        var i = 0;
        for (var len = followDoms.length; i < len; i++) {
            var dom = followDoms[i];
            followHeights[i + 1] = followHeights[i] + dom.offsetHeight;
        }
        followHeights[i + 1] = followHeights[i];
        followHeights.lenght = i + 2;
    }
    function resetFollowDomsWidth(table) {
        var followDoms = table.followDoms;
        var followWidths = table.followWidthArr;
        for (var i = 0, len = followDoms.length; i < len; i++) {
            var dom = followDoms[i];
            var followWidth = getStyleNum(dom, 'padding-left') + getStyleNum(dom, 'padding-right') + getStyleNum(dom, 'border-left-width') + getStyleNum(dom, 'border-right-width');
            followWidths[i] = followWidth;
            followDoms[i].style.width = table.realWidth - followWidth + 'px';
        }
    }
    function resetFollowOffset(table) {
        var followDoms = table.followDoms;
        var followOffest = lib.getOffset(followDoms[0] || table.main);
        table.followTop = followOffest.top;
        table.followLeft = followOffest.left;
    }
    function initMinColsWidth(table) {
        var fields = table.realFields;
        var result = [];
        var fontSize = table.fontSize;
        var extraWidth = table.colPadding * 2 + 5;
        if (!table.noHead) {
            for (var i = 0, len = fields.length; i < len; i++) {
                var field = fields[i];
                var width = field.minWidth;
                if (!width && !field.breakLine) {
                    width = field.title.length * fontSize + extraWidth + (table.sortable && field.sortable ? table.sortWidth : 0) + (field.tip ? table.tipWidth : 0);
                }
                result[i] = width;
            }
        } else {
            var minWidth = fontSize + extraWidth;
            for (var i = 0, len = fields.length; i < len; i++) {
                result[i] = minWidth;
            }
        }
        table.minColsWidth = result;
    }
    function initColsWidth(table) {
        var fields = table.realFields;
        var canExpand = [];
        table.colsWidth = [];
        var leftWidth = table.realWidth - 1;
        for (var i = 0, len = fields.length; i < len; i++) {
            var field = fields[i];
            var width = field.width;
            width = width ? parseInt(width, 10) : 0;
            table.colsWidth.push(width);
            leftWidth -= width;
            if (!field.stable) {
                canExpand.push(i);
            }
        }
        var len = canExpand.length;
        var leaveAverage = Math.round(leftWidth / len);
        for (var i = 0; i < len; i++) {
            var index = canExpand[i];
            var offset = Math.abs(leftWidth) < Math.abs(leaveAverage) ? leftWidth : leaveAverage;
            leftWidth -= offset;
            table.colsWidth[index] += offset;
            var minWidth = table.minColsWidth[index];
            if (minWidth > table.colsWidth[index]) {
                leftWidth += table.colsWidth[index] - minWidth;
                table.colsWidth[index] = minWidth;
            }
        }
        if (leftWidth < 0) {
            var i = 0;
            while (i < len && leftWidth !== 0) {
                var index = canExpand[i];
                var minWidth = table.minColsWidth[index];
                if (minWidth < table.colsWidth[index]) {
                    var offset = table.colsWidth[canExpand[i]] - minWidth;
                    offset = offset > Math.abs(leftWidth) ? leftWidth : -offset;
                    leftWidth += Math.abs(offset);
                    table.colsWidth[index] += offset;
                }
                i++;
            }
        } else if (leftWidth > 0) {
            table.colsWidth[canExpand[0]] += leftWidth;
        }
    }
    function renderFoot(table) {
        var foot = getFoot(table);
        if (!(table.foot instanceof Array)) {
            foot && (foot.style.display = 'none');
        } else {
            if (!foot) {
                foot = document.createElement('div');
                foot.id = getId(table, 'foot');
                foot.className = getClass(table, 'foot');
                setAttr(foot, 'control-table', table.id);
                table.main.appendChild(foot);
            }
            foot.style.display = '';
            if (table.realWidth) {
                foot.style.width = table.realWidth + 'px';
            }
            foot.innerHTML = getFootHtml(table);
        }
    }
    function getFootHtml(table) {
        var html = [];
        var footArray = table.foot;
        var fieldIndex = 0;
        var colsWidth = table.colsWidth;
        var thCellClass = getClass(table, 'fcell');
        var thTextClass = getClass(table, 'fcell-text');
        var rowWidthOffset = table.rowWidthOffset;
        html.push(lib.format(tplTablePrefix, {
            width: '100%',
            controlTableId: table.id
        }), '<tr>');
        for (var i = 0, len = footArray.length; i < len; i++) {
            var footInfo = footArray[i];
            var colWidth = colsWidth[fieldIndex];
            var colspan = footInfo.colspan || 1;
            var thClass = [thCellClass];
            var contentHtml = footInfo.content;
            if ('function' == typeof contentHtml) {
                contentHtml = contentHtml.call(table);
            }
            if (isNullOrEmpty(contentHtml)) {
                contentHtml = '&nbsp;';
            }
            for (var j = 1; j < colspan; j++) {
                colWidth += colsWidth[fieldIndex + j];
            }
            fieldIndex += colspan;
            if (footInfo.align) {
                thClass.push(getClass(table, 'cell-align-' + footInfo.align));
            }
            colWidth += rowWidthOffset;
            colWidth < 0 && (colWidth = 0);
            html.push('<th id="' + getFootCellId(table, i) + '" ' + 'class="' + thClass.join(' ') + '"', ' style="width:' + colWidth + 'px;', (colWidth ? '' : 'display:none;') + '">', '<div class="' + thTextClass + '">', contentHtml, '</div></th>');
        }
        html.push('</tr></table>');
        return html.join('');
    }
    function renderHead(table) {
        var head = getHead(table);
        var headPanelId = getId(table, 'head-panel');
        if (!head) {
            head = document.createElement('div');
            head.id = getId(table, 'head');
            head.className = getClass(table, 'head');
            setAttr(head, 'control-table', table.id);
            table.main.appendChild(head);
            head.innerHTML = lib.format('<div id="${id}" data-ui="type:Panel;id:${id};"></div>', { id: headPanelId });
            table.initChildren(head);
            table.headPanel = table.viewContext.get(headPanelId);
            helper.addDOMEvent(table, head, 'mousemove', u.bind(headMoveHandler, head, table));
            helper.addDOMEvent(table, head, 'mousedown', u.bind(dragStartHandler, head, table));
        }
        if (table.noHead) {
            head.style.display = 'none';
            return;
        }
        head.style.display = '';
        if (table.realWidth) {
            head.style.width = table.realWidth + 'px';
        }
        lib.g(headPanelId).innerHTML = getHeadHtml(table);
        initHeadChildren(table, table.viewContext.get(headPanelId));
    }
    function initHeadChildren(table, headPanel) {
        if (headPanel.children) {
            headPanel.disposeChildren();
        }
        if (table.hasTip) {
            headPanel.initChildren();
        }
    }
    var tplSortIcon = '<div class="${className}"></div>';
    var tplTitleTip = '<div id="${id}" ' + 'class="${className}" ' + 'data-ui="type:Tip;id:${id};content:${content}">' + '</div>';
    function getHeadHtml(table) {
        var fields = table.realFields;
        var thCellClass = getClass(table, 'hcell');
        var thTextClass = getClass(table, 'hcell-text');
        var breakClass = getClass(table, 'cell-break');
        var sortClass = getClass(table, 'hsort');
        var selClass = getClass(table, 'hcell-sel');
        var canDragBegin = -1;
        var canDragEnd = -1;
        var rowWidthOffset = table.rowWidthOffset;
        if (!table.disabled) {
            for (var i = 0, len = fields.length; i < len; i++) {
                if (!fields[i].stable) {
                    canDragBegin = i;
                    break;
                }
            }
            for (var i = len - 1; i >= 0; i--) {
                if (!fields[i].stable) {
                    canDragEnd = i;
                    break;
                }
            }
        }
        var html = [];
        html.push(lib.format(tplTablePrefix, {
            width: '100%',
            controlTableId: table.id
        }), '<tr>');
        for (var i = 0, len = fields.length; i < len; i++) {
            var thClass = [thCellClass];
            var field = fields[i];
            var title = field.title;
            var sortable = table.sortable && field.sortable;
            var currentSort = sortable && field.field && field.field == table.orderBy;
            var realThTextClass = thTextClass;
            if (i === 0) {
                realThTextClass += ' ' + getClass(table, 'hcell-text-first');
            }
            if (i === len - 1) {
                realThTextClass += ' ' + getClass(table, 'hcell-text-last');
            }
            var sortIconHtml = '';
            if (sortable) {
                thClass.push(getClass(table, 'hcell-sort'));
                if (currentSort) {
                    thClass.push(getClass(table, 'hcell-' + table.order));
                }
                sortIconHtml = lib.format(tplSortIcon, { className: sortClass });
            }
            if (field.align) {
                thClass.push(getClass(table, 'cell-align-' + field.align));
            }
            if (table.breakLine || field.breakLine) {
                thClass.push(breakClass);
            }
            var titleTipHtml = '';
            var titleTipContent = '';
            var tip = field.tip;
            if (typeof tip === 'function') {
                titleTipContent = tip.call(table);
            } else {
                titleTipContent = tip;
            }
            if (titleTipContent) {
                titleTipHtml = lib.format(tplTitleTip, {
                    id: getId(table, 'htip' + i),
                    className: getClass(table, 'htip'),
                    content: titleTipContent
                });
                table.hasTip = true;
            }
            var contentHtml;
            if (typeof title == 'function') {
                contentHtml = title.call(table);
            } else {
                contentHtml = title;
            }
            if (isNullOrEmpty(contentHtml)) {
                contentHtml = '&nbsp;';
            }
            html.push('<th id="' + getTitleCellId(table, i) + '"', ' data-index="' + i + '"', ' class="' + thClass.join(' ') + '"', sortable ? ' data-sortable="1"' : '', i >= canDragBegin && i < canDragEnd ? ' data-dragright="1"' : '', i <= canDragEnd && i > canDragBegin ? ' data-dragleft="1"' : '', ' style="', 'width:' + (table.colsWidth[i] + rowWidthOffset) + 'px;', (table.colsWidth[i] ? '' : 'display:none') + '">', '<div class="' + realThTextClass + (field.select ? ' ' + selClass : '') + '">', titleTipHtml, contentHtml, sortIconHtml, '</div></th>');
        }
        html.push('</tr></table>');
        return html.join('');
    }
    function getTitleCellId(table, index) {
        return getId(table, 'title-cell') + index;
    }
    function getFootCellId(table, index) {
        return getId(table, 'foot-cell') + index;
    }
    function titleOverHandler(element, e) {
        titleOver(this, element);
    }
    function titleOver(table, element) {
        if (table.isDraging || table.dragReady) {
            return;
        }
        helper.addPartClasses(table, 'hcell-hover', element);
        if (table.sortable) {
            table.sortReady = 1;
            var index = getAttr(element, 'index');
            var field = table.realFields[index];
            if (field && field.sortable) {
                helper.addPartClasses(table, 'hcell-sort-hover', element);
            }
        }
    }
    function titleOutHandler(element, e) {
        titleOut(this, element);
    }
    function titleOut(table, element) {
        helper.removePartClasses(table, 'hcell-hover', element);
        if (table.sortable) {
            table.sortReady = 0;
            helper.removePartClasses(table, 'hcell-sort-hover', element);
        }
    }
    function titleClickHandler(element, e) {
        var table = this;
        if (table.sortable && table.sortReady) {
            var index = getAttr(element, 'index');
            var field = table.realFields[index];
            if (field.sortable) {
                var orderBy = table.orderBy;
                var order = table.order;
                if (orderBy == field.field) {
                    order = !order || order == 'asc' ? 'desc' : 'asc';
                } else {
                    order = 'desc';
                }
                table.setProperties({
                    order: order,
                    orderBy: field.field
                });
                table.fire('sort', {
                    field: field,
                    order: order
                });
            }
        }
    }
    function headMoveHandler(table, e) {
        if (!table.columnResizable) {
            return;
        }
        var dragClass = 'startdrag';
        var range = 8;
        if (table.isDraging) {
            return;
        }
        var tar = e.target;
        tar = findDragCell(table, tar);
        if (!tar) {
            return;
        }
        var el = this;
        var pageX = e.pageX || e.clientX + lib.page.getScrollLeft();
        var pos = lib.getOffset(tar);
        var sortable = getAttr(tar, 'sortable');
        if (getAttr(tar, 'dragleft') && pageX - pos.left < range) {
            sortable && titleOut(table, tar);
            helper.addPartClasses(table, dragClass, el);
            table.dragPoint = 'left';
            table.dragReady = 1;
        } else if (getAttr(tar, 'dragright') && pos.left + tar.offsetWidth - pageX < range) {
            sortable && titleOut(table, tar);
            helper.addPartClasses(table, dragClass, el);
            table.dragPoint = 'right';
            table.dragReady = 1;
        } else {
            helper.removePartClasses(table, dragClass, el);
            sortable && titleOver(table, tar);
            table.dragPoint = '';
            table.dragReady = 0;
        }
    }
    function findDragCell(taable, target) {
        while (target.nodeType == 1) {
            if (target.nodeName == 'TH') {
                return target;
            }
            target = target.parentNode;
        }
        return null;
    }
    function dragStartHandler(table, e) {
        if (!table.columnResizable) {
            return;
        }
        table.fire('startdrag');
        table.fire('dragstart');
        var dragClass = getClass(table, 'startdrag');
        var tar = e.target;
        tar = findDragCell(table, tar);
        if (!tar) {
            return;
        }
        if (lib.g(getId(table, 'head')).className.indexOf(dragClass) < 0) {
            return;
        }
        table.htmlHeight = document.documentElement.clientHeight;
        table.isDraging = true;
        table.dragIndex = getAttr(tar, 'index');
        table.dragStart = e.pageX || e.clientX + lib.page.getScrollLeft();
        initTableOffset(table);
        var realDragingHandler = u.partial(dragingHandler, table);
        var realDragEndHandler = function (e) {
            var retrunResult = true;
            try {
                retrunResult = u.partial(dragEndHandler, table)(e);
            } catch (er) {
            }
            lib.un(document, 'mousemove', realDragingHandler);
            lib.un(document, 'mouseup', realDragEndHandler);
            return retrunResult;
        };
        lib.on(document, 'mousemove', realDragingHandler);
        lib.on(document, 'mouseup', realDragEndHandler);
        showDragMark(table, table.dragStart);
        lib.event.preventDefault(e);
        return false;
    }
    function initTableOffset(table) {
        var tableOffset = lib.getOffset(table.main);
        table.top = tableOffset.top;
        table.left = tableOffset.left;
    }
    function dragingHandler(table, evt) {
        var e = evt || window.event;
        showDragMark(table, e.pageX || e.clientX + lib.page.getScrollLeft());
        lib.event.preventDefault(e);
        return false;
    }
    function showDragMark(table, left) {
        var mark = getDragMark(table);
        var right = table.left + table.realWidth;
        var rangeLeft = table.left + 1;
        var rangeRight = right - 1;
        left = left < rangeLeft ? rangeLeft : left;
        left = left > rangeRight ? rangeRight : left;
        if (!mark) {
            mark = createDragMark(table);
        }
        mark.style.top = table.top + 'px';
        mark.style.left = left + 'px';
        mark.style.zIndex = table.zIndex || '';
        var height = table.htmlHeight - table.top + lib.page.getScrollTop();
        var mainHeight = table.main.offsetHeight;
        height = mainHeight > height ? height : mainHeight;
        mark.style.height = height + 'px';
    }
    function hideDragMark(table) {
        var mark = getDragMark(table);
        mark.style.left = '-10000px';
        mark.style.top = '-10000px';
    }
    function createDragMark(table) {
        var mark = document.createElement('div');
        mark.id = getId(table, 'drag-mark');
        mark.className = getClass(table, 'mark ');
        mark.style.top = '-10000px';
        mark.style.left = '-10000px';
        document.body.appendChild(mark);
        return mark;
    }
    function getDragMark(table) {
        return lib.g(getId(table, 'drag-mark'));
    }
    function dragEndHandler(table, evt) {
        var e = evt || window.event;
        var index = parseInt(table.dragIndex, 10);
        var pageX = e.pageX || e.clientX + lib.page.getScrollLeft();
        var fields = table.realFields;
        var fieldLen = fields.length;
        var alterSum = 0;
        var colsWidth = table.colsWidth;
        var revise = 0;
        if (table.dragPoint == 'left') {
            index--;
        }
        var minWidth = table.minColsWidth[index];
        var offsetX = pageX - table.dragStart;
        var currentWidth = colsWidth[index] + offsetX;
        if (currentWidth < minWidth) {
            offsetX += minWidth - currentWidth;
            currentWidth = minWidth;
        }
        var alters = [];
        var alterWidths = [];
        for (var i = index + 1; i < fieldLen; i++) {
            if (!fields[i].stable && colsWidth[i] > 0) {
                alters.push(i);
                alterWidth = colsWidth[i];
                alterWidths.push(alterWidth);
                alterSum += alterWidth;
            }
        }
        var leave = offsetX;
        var alterLen = alters.length;
        for (var i = 0; i < alterLen; i++) {
            var alter = alters[i];
            var alterWidth = alterWidths[i];
            var roughWidth = offsetX * alterWidth / alterSum;
            var offsetWidth = leave > 0 ? Math.ceil(roughWidth) : Math.floor(roughWidth);
            offsetWidth = Math.abs(offsetWidth) < Math.abs(leave) ? offsetWidth : leave;
            alterWidth -= offsetWidth;
            leave -= offsetWidth;
            minWidth = table.minColsWidth[alter];
            if (alterWidth < minWidth) {
                revise += minWidth - alterWidth;
                alterWidth = minWidth;
            }
            colsWidth[alter] = alterWidth;
        }
        currentWidth -= revise;
        colsWidth[index] = currentWidth;
        resetColumns(table);
        table.isDraging = false;
        hideDragMark(table);
        table.fire('enddrag');
        table.fire('dragend');
        lib.event.preventDefault(e);
        return false;
    }
    function renderBody(table) {
        var tBody = getBody(table);
        var tBodyPanelId = getId(table, 'body-panel');
        if (!tBody) {
            var type = 'body';
            var id = getId(table, type);
            tBody = document.createElement('div');
            tBody.id = id;
            tBody.className = getClass(table, type);
            table.main.appendChild(tBody);
            tBody.innerHTML = lib.format('<div id="${id}" data-ui="type:Panel;id:${id}"></div>', { id: tBodyPanelId });
            table.initChildren(tBody);
            table.bodyPanel = table.viewContext.get(tBodyPanelId);
        }
        var style = tBody.style;
        style.overflowX = 'hidden';
        style.overflowY = 'auto';
        if (table.realWidth) {
            style.width = table.realWidth + 'px';
        }
        table.bodyPanel.disposeChildren();
        lib.g(tBodyPanelId).innerHTML = getBodyHtml(table);
        table.fire('bodyChange');
    }
    function updateBodyMaxHeight(table) {
        var tBody = getBody(table);
        var style = tBody.style;
        var dataLen = table.datasource.length;
        var bodyMaxHeight = table.bodyMaxHeight;
        if (bodyMaxHeight > 0 && dataLen > 0) {
            var totalHeight = bodyMaxHeight;
            var bodyContainer = lib.g(getId(table, 'body-panel'));
            if (bodyContainer) {
                totalHeight = bodyContainer.offsetHeight;
            }
            if (totalHeight >= bodyMaxHeight) {
                style.height = bodyMaxHeight + 'px';
                return;
            }
        }
        style.height = 'auto';
    }
    var noDataHtmlTpl = '<div class="${className}">${html}</div>';
    function getBodyHtml(table) {
        var data = table.datasource || [];
        var dataLen = data.length;
        var html = [];
        if (!dataLen) {
            return lib.format(noDataHtmlTpl, {
                className: getClass(table, 'body-nodata'),
                html: table.noDataHtml
            });
        }
        var rowBuilderList = table.rowBuilderList;
        for (var i = 0; i < dataLen; i++) {
            var item = data[i];
            html.push(getRowHtml(table, item, i, rowBuilderList));
        }
        return html.join('');
    }
    function getBodyCellId(table, rowIndex, fieldIndex) {
        return getId(table, 'cell') + rowIndex + '-' + fieldIndex;
    }
    var tplRowPrefix = '<div ' + 'id="${id}" ' + 'class="${className}" ' + 'data-index="${index}" ${attr}>';
    function addRowBuilderList(table, builderList) {
        var rowBuilderList = table.rowBuilderList || [];
        for (var i = 0, l = builderList.length; i < l; i++) {
            var builder = builderList[i];
            if (!builder.getColHtml) {
                continue;
            }
            if (builder.getSubrowHtml) {
                table.hasSubrow = true;
            }
            if (!hasValue(builder.index)) {
                builder.index = 1000;
            }
            rowBuilderList.push(builder);
        }
        rowBuilderList.sort(function (a, b) {
            return a.index - b.index;
        });
        table.rowBuilderList = rowBuilderList;
    }
    function initBaseBuilderList(table) {
        addRowBuilderList(table, [{
                index: 1,
                getRowArgs: getRowBaseArgs,
                getColHtml: getColBaseHtml
            }]);
    }
    function getRowHtml(table, data, index, builderList) {
        var html = [];
        var fields = table.realFields;
        var rowWidthOffset = table.rowWidthOffset;
        var extraArgsList = [];
        var rowClass = [];
        var rowAttr = [];
        for (var i = 0, l = builderList.length; i < l; i++) {
            var builder = builderList[i];
            var rowArgs = builder.getRowArgs ? builder.getRowArgs(table, index) || {} : {};
            extraArgsList.push(rowArgs);
            rowArgs.rowClass && rowClass.push(rowArgs.rowClass);
            rowArgs.rowAttr && rowAttr.push(rowArgs.rowAttr);
        }
        function sortByIndex(a, b) {
            return a.index - b.index;
        }
        for (var i = 0, l = fields.length; i < l; i++) {
            var field = fields[i];
            var colWidth = table.colsWidth[i];
            var colClass = [];
            var textClass = [];
            var colAttr = [];
            var textAttr = [];
            var textHtml = [];
            var allHtml = [];
            var textStartIndex = -1;
            for (var s = 0, t = builderList.length; s < t; s++) {
                var colResult = builderList[s].getColHtml(table, data, field, index, i, extraArgsList[s]);
                if (!colResult) {
                    continue;
                }
                var colHtml = colResult.html;
                if (colResult.colClass) {
                    colClass.push(colResult.colClass);
                }
                if (colResult.textClass) {
                    textClass.push(colResult.textClass);
                }
                if (colResult.colAttr) {
                    colAttr.push(colResult.colAttr);
                }
                if (colResult.textAttr) {
                    textAttr.push(colResult.textAttr);
                }
                if (hasValue(colHtml)) {
                    if (colResult.notInText) {
                        colResult.index = s;
                        allHtml.push(colResult);
                    } else {
                        textHtml.push(colHtml);
                        textStartIndex < 0 && (textStartIndex = s);
                    }
                }
            }
            var contentHtml = '';
            textHtml = [
                '<div class="' + textClass.join(' ') + '" ',
                textAttr.join(' ') + '>',
                textHtml.join(''),
                '</div>'
            ].join('');
            allHtml.push({
                html: textHtml,
                index: textStartIndex
            });
            allHtml.sort(sortByIndex);
            if (allHtml.length > 1) {
                var contentHtml = [
                        '<table width="100%" cellpadding="0" cellspacing="0">',
                        '<tr>'
                    ];
                for (var s = 0, t = allHtml.length; s < t; s++) {
                    var aHtml = allHtml[s];
                    contentHtml.push('<td ', hasValue(aHtml.width) ? ' width="' + aHtml.width + '" ' : '', aHtml.align ? ' align="' + aHtml.align + '">' : '>', aHtml.html, '</td>');
                }
                contentHtml.push('</tr></table>');
                contentHtml = contentHtml.join('');
            } else {
                contentHtml = textHtml;
            }
            html.push('<td id="' + getBodyCellId(table, index, i) + '" ', 'class="' + colClass.join(' ') + '" ', colAttr.join(' ') + ' ', 'style="width:' + (colWidth + rowWidthOffset) + 'px;', (colWidth ? '' : 'display:none') + '" ', 'data-control-table="' + table.id + '" ', 'data-row="' + index + '" data-col="' + i + '">', contentHtml, '</td>');
        }
        html.unshift(lib.format(tplRowPrefix, {
            id: getId(table, 'row') + index,
            className: rowClass.join(' '),
            attr: rowAttr.join(' '),
            index: index
        }), lib.format(tplTablePrefix, {
            width: '100%',
            controlTableId: table.id
        }));
        html.push('</tr></table></div>');
        if (table.hasSubrow) {
            for (var i = 0, l = builderList.length; i < l; i++) {
                var subrowBuilder = builderList[i].getSubrowHtml;
                if (subrowBuilder) {
                    html.push(subrowBuilder(table, index, extraArgsList[i]));
                }
            }
        }
        return html.join('');
    }
    function getRowBaseArgs(table, rowIndex) {
        var datasource = table.datasource || [];
        var dataLen = datasource.length;
        return {
            tdCellClass: getClass(table, 'cell'),
            tdBreakClass: getClass(table, 'cell-break'),
            tdTextClass: getClass(table, 'cell-text'),
            fieldLen: table.realFields.length,
            rowClass: [
                getClass(table, 'row'),
                getClass(table, 'row-' + (rowIndex % 2 ? 'odd' : 'even')),
                isRowSelected(table, rowIndex) ? getClass(table, 'row-selected') : '',
                dataLen - 1 == rowIndex ? getClass(table, 'row-last') : ''
            ].join(' ')
        };
    }
    var baseColTextTpl = '<span id="${colTextId}">${content}</span>';
    function getColBaseHtml(table, data, field, rowIndex, fieldIndex, extraArgs) {
        var tdCellClass = extraArgs.tdCellClass;
        var tdBreakClass = extraArgs.tdBreakClass;
        var tdTextClass = extraArgs.tdTextClass;
        var tdClass = [tdCellClass];
        var textClass = [tdTextClass];
        var content = field.content;
        if (fieldIndex === 0) {
            textClass.push(getClass(table, 'cell-text-first'));
        }
        if (fieldIndex === extraArgs.fieldLen - 1) {
            textClass.push(getClass(table, 'cell-text-last'));
        }
        if (table.breakLine || field.breakLine) {
            tdClass.push(tdBreakClass);
        }
        if (field.select) {
            textClass.push(getClass(table, 'cell-sel'));
        }
        if (field.align) {
            tdClass.push(getClass(table, 'cell-align-' + field.align));
        }
        if (field.field && field.field == table.orderBy) {
            tdClass.push(getClass(table, 'cell-sorted'));
        }
        var contentHtml = 'function' == typeof content ? content.call(table, data, rowIndex, fieldIndex) : table.encode ? lib.encodeHTML(data[content]) : data[content];
        if (isNullOrEmpty(contentHtml)) {
            contentHtml = '&nbsp;';
        }
        return {
            colClass: tdClass.join(' '),
            textClass: textClass.join(' '),
            html: lib.format(baseColTextTpl, {
                colTextId: getId(table, 'cell-textfield-' + rowIndex + '-' + fieldIndex),
                content: contentHtml
            })
        };
    }
    function rowOverHandler(element, e) {
        if (this.isDraging) {
            return;
        }
        helper.addPartClasses(this, 'row-hover', element);
    }
    function rowOutHandler(element, e) {
        helper.removePartClasses(this, 'row-hover', element);
    }
    function rowClickHandler(element, e) {
        var table = this;
        var rowClassName = helper.getPartClasses(table, 'cell-text')[0];
        if (table.selectMode == 'line' && lib.hasClass(e.target, rowClassName)) {
            if (table.dontSelectLine) {
                table.dontSelectLine = false;
                return;
            }
            var index = getAttr(element, 'index');
            switch (table.select) {
            case 'multi':
                var input = lib.g(getId(table, 'multi-select') + index);
                selectMulti(table, index, !input.checked);
                resetMutilSelectedStatus(table);
                break;
            case 'single':
                selectSingle(table, index, true);
                break;
            }
        }
    }
    function initResizeHandler(table) {
        table.viewWidth = lib.page.getViewWidth();
        table.viewHeight = lib.page.getViewHeight();
        var resizeHandler = function () {
            var viewWidth = lib.page.getViewWidth();
            var viewHeight = lib.page.getViewHeight();
            if (viewWidth == table.viewWidth && viewHeight == table.viewHeight) {
                return;
            }
            table.viewWidth = viewWidth;
            table.viewHeight = viewHeight;
            handleResize(table);
        };
        helper.addDOMEvent(table, window, 'resize', resizeHandler);
    }
    function handleResize(table) {
        var head = getHead(table);
        var foot = getFoot(table);
        table.realWidth = getWidth(table);
        var widthStr = table.realWidth + 'px';
        if (table.realWidth) {
            table.main.style.width = widthStr;
            getBody(table).style.width = widthStr;
            head && (head.style.width = widthStr);
            foot && (foot.style.width = widthStr);
        }
        initColsWidth(table);
        resetColumns(table);
        if (table.followHead) {
            resetFollowDomsWidth(table);
            resetFollowHeight(table);
        }
        initTableOffset(table);
        table.fire('resize');
        table.topReseter && table.topReseter();
    }
    function setPos(dom, pos, top, left) {
        if (dom) {
            dom.style.top = top + 'px';
            dom.style.left = left + 'px';
            dom.style.position = pos;
        }
    }
    function initTopResetHandler(table) {
        if (!table.followHead || table.topReseter) {
            return;
        }
        var domHead = getHead(table);
        var placeHolderId = getId(table, 'top-placeholder');
        var domPlaceholder = document.createElement('div');
        domPlaceholder.id = placeHolderId;
        domPlaceholder.style.width = '100%';
        domPlaceholder.style.display = 'none';
        lib.insertBefore(domPlaceholder, table.main);
        domPlaceholder = null;
        table.topReseter = function () {
            if (!table.followHead) {
                return;
            }
            var scrollTop = lib.page.getScrollTop();
            var posStyle = lib.ie && lib.ie < 7 ? 'absolute' : 'fixed';
            var mainHeight = table.main.offsetHeight;
            var absolutePosition = posStyle == 'absolute';
            var placeHolder = lib.g(placeHolderId);
            var followDoms = table.followDoms;
            if (table.noFollowHeadCache) {
                var position = domHead.style.position;
                if (position !== 'fixed' && position !== 'absolute') {
                    resetFollowOffset(table);
                }
            }
            if (scrollTop > table.followTop && (absolutePosition || scrollTop - table.followTop < mainHeight)) {
                var scrollLeft = lib.page.getScrollLeft();
                var fhArr = table.followHeightArr;
                var fhLen = fhArr.length;
                initTableOffset(table);
                var curLeft = absolutePosition ? table.left : table.left - scrollLeft;
                placeHolder.style.height = fhArr[fhLen - 1] + domHead.offsetHeight + 'px';
                placeHolder.style.display = '';
                if (lib.ie && lib.ie < 8) {
                    domHead.style.zIndex = table.zIndex + 1;
                }
                if (absolutePosition) {
                    for (var i = 0, len = followDoms.length; i < len; i++) {
                        setPos(followDoms[i], posStyle, fhArr[i] + scrollTop, curLeft);
                    }
                    setPos(domHead, posStyle, fhArr[fhLen - 1] + scrollTop, curLeft);
                } else {
                    for (var i = 0, len = followDoms.length; i < len; i++) {
                        setPos(followDoms[i], posStyle, fhArr[i], curLeft);
                    }
                    setPos(domHead, posStyle, fhArr[fhLen - 1], curLeft);
                }
            } else {
                placeHolder.style.height = 0;
                placeHolder.style.display = 'none';
                posStyle = '';
                for (var i = 0, len = followDoms.length; i < len; i++) {
                    setPos(followDoms[i], posStyle, 0, 0);
                }
                setPos(domHead, posStyle, 0, 0);
                domHead.style.zIndex = '';
            }
        };
        helper.addDOMEvent(table, window, 'scroll', table.topReseter);
    }
    function resetColumns(table) {
        var colsWidth = table.colsWidth;
        var foot = table.foot;
        var id = table.id;
        var len = foot instanceof Array && foot.length;
        var tds = getBody(table).getElementsByTagName('td');
        var tdsLen = tds.length;
        var rowWidthOffset = table.rowWidthOffset;
        if (len) {
            var colIndex = 0;
            for (var i = 0; i < len; i++) {
                var item = foot[i];
                var width = colsWidth[colIndex];
                var colspan = item.colspan || 1;
                for (var j = 1; j < colspan; j++) {
                    width += colsWidth[colIndex + j];
                }
                colIndex += colspan;
                var td = lib.g(getFootCellId(table, i));
                width = Math.max(width + rowWidthOffset, 0);
                td.style.width = width + 'px';
                td.style.display = width ? '' : 'none';
            }
        }
        len = colsWidth.length;
        if (!table.noHead) {
            for (var i = 0; i < len; i++) {
                var width = Math.max(colsWidth[i] + rowWidthOffset, 0);
                var td = lib.g(getTitleCellId(table, i));
                td.style.width = width + 'px';
                td.style.display = width ? '' : 'none';
            }
        }
        var j = 0;
        for (var i = 0; i < tdsLen; i++) {
            var td = tds[i];
            if (getAttr(td, 'control-table') == id) {
                var width = Math.max(colsWidth[j % len] + rowWidthOffset, 0);
                td.style.width = width + 'px';
                td.style.display = width ? '' : 'none';
                j++;
            }
        }
    }
    var mutilSelectAllTpl = '<input ' + 'type="checkbox" ' + 'id="${id}" ' + 'class="${className}" ' + 'data-index="${index}" ' + '${disabled}/>';
    var mutilSelectTpl = '<input ' + 'type="checkbox" ' + 'id="${id}" ' + 'class="${className}" ' + 'data-index="${index}" ' + '${disabled} ' + '${checked} />';
    function getMultiSelectField(table) {
        return {
            width: 30,
            stable: true,
            select: true,
            title: function (item, index) {
                var data = {
                        id: getId(table, 'select-all'),
                        className: getClass(table, 'select-all'),
                        disabled: table.disabled ? 'disabled="disabled"' : '',
                        index: index
                    };
                return lib.format(mutilSelectAllTpl, data);
            },
            content: function (item, index) {
                var data = {
                        id: getId(table, 'multi-select') + index,
                        className: getClass(table, 'multi-select'),
                        disabled: table.disabled ? 'disabled="disabled"' : '',
                        index: index,
                        checked: isRowSelected(table, index) ? 'checked="checked"' : ''
                    };
                return lib.format(mutilSelectTpl, data);
            }
        };
    }
    var singleSelectTpl = '<input ' + 'type="radio" ' + 'id="${id}" ' + 'name="${name}" ' + 'class="${className}" ' + 'data-index="${index}" ' + '${disabled} ' + '${checked} />';
    function getSingleSelectField(table) {
        return {
            width: 30,
            stable: true,
            title: '&nbsp;',
            select: true,
            content: function (item, index) {
                var id = getId(table, 'single-select');
                var data = {
                        id: id + index,
                        name: id,
                        className: getClass(table, 'single-select'),
                        index: index,
                        disabled: table.disabled ? 'disabled="disabled"' : '',
                        checked: isRowSelected(table, index) ? 'checked="checked"' : ''
                    };
                return lib.format(singleSelectTpl, data);
            }
        };
    }
    function rowCheckboxClick(element, e) {
        var index = getAttr(element, 'index');
        selectMulti(this, index);
        resetMutilSelectedStatus(this);
    }
    function selectMulti(table, index, isSelected) {
        var selectedClass = 'row-selected';
        if (index >= 0) {
            var input = lib.g(getId(table, 'multi-select') + index);
            if (input) {
                hasValue(isSelected) && (input.checked = isSelected);
                var row = getRow(table, index);
                if (input.checked) {
                    helper.addPartClasses(table, selectedClass, row);
                } else {
                    helper.removePartClasses(table, selectedClass, row);
                }
            }
        } else if (hasValue(isSelected)) {
            var inputs = findSelectBox(table, 'checkbox');
            for (var i = 0, len = inputs.length; i < len; i++) {
                var input = inputs[i];
                input.checked = isSelected;
                var inputIndex = getAttr(input, 'index');
                var row = getRow(table, inputIndex);
                if (isSelected) {
                    helper.addPartClasses(table, selectedClass, row);
                } else {
                    helper.removePartClasses(table, selectedClass, row);
                }
            }
        }
    }
    function resetMutilSelectedStatus(table) {
        var selectAll = getHeadCheckbox(table);
        var inputs = findSelectBox(table, 'checkbox');
        var allChecked = true;
        var selected = [];
        var cbIdPrefix = getId(table, 'multi-select');
        for (var i = 0, len = inputs.length; i < len; i++) {
            var input = inputs[i];
            if (input.id.indexOf(cbIdPrefix) >= 0) {
                var inputIndex = getAttr(input, 'index');
                if (!input.checked) {
                    allChecked = false;
                } else {
                    selected.push(inputIndex);
                }
            }
        }
        setSelectedIndex(table, selected);
        table.fire('select', { selectedIndex: selected });
        selectAll.checked = allChecked;
    }
    function toggleSelectAll(arg) {
        selectAll(this, getHeadCheckbox(this).checked);
    }
    function findSelectBox(table, type) {
        var inputs = getBody(table).getElementsByTagName('input');
        var result = [];
        for (var i = 0, len = inputs.length; i < len; i++) {
            var input = inputs[i];
            var inputId = input.id;
            if (input.getAttribute('type') == type && inputId) {
                result.push(input);
            }
        }
        return result;
    }
    function selectAll(table, checked) {
        selectMulti(table, -1, checked);
        resetMutilSelectedStatus(table);
    }
    function selectSingleHandler(element, e) {
        selectSingle(this, getAttr(element, 'index'));
    }
    function selectSingle(table, index, isSelected) {
        var selectedIndex = table.selectedIndex;
        var input = lib.g(getId(table, 'single-select') + index);
        if (input) {
            hasValue(isSelected) && (input.checked = isSelected);
            table.fire('select', { selectedIndex: index });
            if (selectedIndex && selectedIndex.length) {
                helper.removePartClasses(table, 'row-selected', getRow(table, selectedIndex[0]));
            }
            setSelectedIndex(table, [index]);
            helper.addPartClasses(table, 'row-selected', getRow(table, index));
        }
    }
    function resetMainZIndex(table) {
        table.main.style.zIndex = table.zIndex || '';
    }
    function setDisabledStyle(table) {
        var inputs = findSelectBox(table, table.select == 'multi' ? 'checkbox' : 'radio');
        for (var i = inputs.length - 1; i >= 0; i--) {
            if (table.disabled) {
                inputs[i].setAttribute('disabled', 'disabled');
            } else {
                inputs[i].removeAttribute('disabled');
            }
        }
        if (table.select == 'multi') {
            var selectAll = getHeadCheckbox(table);
            if (selectAll) {
                if (table.disabled) {
                    selectAll.setAttribute('disabled', 'disabled');
                } else {
                    selectAll.removeAttribute('disabled');
                }
            }
        }
        if (table.children && table.children.length) {
            var children = table.children;
            for (var i = children.length - 1; i >= 0; i--) {
                children[i].setDisabled(table.disabled);
            }
        }
    }
    var rclass = /[\t\r\n]/g;
    function getClassMatch(className) {
        var cssClass = ' ' + className + ' ';
        return function (element) {
            var elClassName = ' ' + element.className + ' ';
            return elClassName.replace(rclass, ' ').indexOf(cssClass) >= 0;
        };
    }
    function createHandlerItem(handler, matchFn) {
        var fn = null;
        if (matchFn) {
            fn = 'function' == typeof matchFn ? matchFn : getClassMatch(matchFn);
        }
        return {
            handler: handler,
            matchFn: fn
        };
    }
    function getHandlers(table, el, eventType) {
        var realId = el.id;
        var handlers = table.handlers[realId];
        if (!handlers) {
            handlers = table.handlers[realId] = {};
        }
        if (eventType) {
            handlers = table.handlers[eventType];
            if (!handlers) {
                handlers = table.handlers[eventType] = [];
            }
        }
        return handlers;
    }
    function addHandlers(table, el, eventType, handlers) {
        var handlerQueue = getHandlers(table, el, eventType);
        var addedHandlers = [];
        if (!handlerQueue.length) {
            addDelegate(table, el, eventType);
        }
        for (var i = 0, l = handlers.length; i < l; i++) {
            var item = handlers[i];
            var hanlderItem = createHandlerItem(item.handler, item.matchFn);
            handlerQueue.push(hanlderItem);
            addedHandlers.push(hanlderItem);
        }
        return addedHandlers;
    }
    function removeHandlers(table, el, eventType, handlers) {
        var handlerQueue = getHandlers(table, el, eventType);
        for (var i = 0, len = handlers.length; i < len; i++) {
            var handler = handlers[i];
            for (var j = 0, l = handlerQueue.length; j < l; j++) {
                if (handlerQueue[j] == handler) {
                    handlerQueue.splice(j, 1);
                    j--;
                }
            }
        }
        if (!handlerQueue.length) {
            removeDelegate(table, el, eventType);
        }
    }
    function getDelegateHandler(element, handlerQueue, scrope) {
        return function (e) {
            var e = e || window.event;
            var cur = e.target;
            while (cur) {
                if (cur.nodeType === 1) {
                    for (var i = handlerQueue.length - 1; i >= 0; i--) {
                        var handlerItem = handlerQueue[i];
                        if (!handlerItem.matchFn || handlerItem.matchFn(cur)) {
                            handlerItem.handler.call(scrope, cur, e);
                        }
                    }
                }
                if (cur == element) {
                    break;
                }
                cur = cur.parentNode;
            }
        };
    }
    function addDelegate(control, element, eventType) {
        var handlerQueue = getHandlers(control, element, eventType);
        helper.addDOMEvent(control, element, eventType, getDelegateHandler(element, handlerQueue, control));
    }
    function removeDelegate(control, element, eventType) {
        helper.removeDOMEvent(control, element, eventType);
    }
    function initMainEventhandler(table) {
        var getPartClasses = helper.getPartClasses;
        var rowClass = getPartClasses(table, 'row')[0];
        var titleClass = getPartClasses(table, 'hcell')[0];
        var selectAllClass = getPartClasses(table, 'select-all')[0];
        var multiSelectClass = getPartClasses(table, 'multi-select')[0];
        var singleSelectClass = getPartClasses(table, 'single-select')[0];
        addHandlers(table, table.main, 'mouseover', [
            {
                handler: rowOverHandler,
                matchFn: rowClass
            },
            {
                handler: titleOverHandler,
                matchFn: titleClass
            }
        ]);
        addHandlers(table, table.main, 'mouseout', [
            {
                handler: rowOutHandler,
                matchFn: rowClass
            },
            {
                handler: titleOutHandler,
                matchFn: titleClass
            }
        ]);
        addHandlers(table, table.main, 'click', [
            {
                handler: rowClickHandler,
                matchFn: rowClass
            },
            {
                handler: titleClickHandler,
                matchFn: titleClass
            },
            {
                handler: toggleSelectAll,
                matchFn: selectAllClass
            },
            {
                handler: rowCheckboxClick,
                matchFn: multiSelectClass
            },
            {
                handler: selectSingleHandler,
                matchFn: singleSelectClass
            }
        ]);
    }
    Table.prototype = {
        type: 'Table',
        initOptions: function (options) {
            var properties = {};
            u.extend(properties, Table.defaultProperties, options);
            this.setProperties(properties);
        },
        initStructure: function () {
            this.realWidth = getWidth(this);
            if (this.realWidth) {
                this.main.style.width = this.realWidth + 'px';
            }
            resetMainZIndex(this);
            initBaseBuilderList(this);
            initResizeHandler(this);
            initMainEventhandler(this);
        },
        repaint: function (changes, changesIndex) {
            Control.prototype.repaint.apply(this, arguments);
            var table = this;
            if (!table.realWidth) {
                table.realWidth = getWidth(table);
                if (table.realWidth) {
                    table.main.style.width = table.realWidth + 'px';
                }
            }
            var defaultProperties = Table.defaultProperties;
            var allProperities = {};
            if (!changes) {
                for (var property in defaultProperties) {
                    if (defaultProperties.hasOwnProperty(property)) {
                        allProperities[property] = true;
                    }
                }
            } else {
                for (var i = 0; i < changes.length; i++) {
                    var record = changes[i];
                    allProperities[record.name] = true;
                }
            }
            var fieldsChanged = false;
            var colsWidthChanged = false;
            var tbodyChange = false;
            if (allProperities.fields || allProperities.select || allProperities.selectMode || allProperities.sortable) {
                initFields(table);
                fieldsChanged = true;
            }
            if (fieldsChanged || allProperities.breakLine || allProperities.colPadding || allProperities.fontSize) {
                initMinColsWidth(table);
                initColsWidth(table);
                colsWidthChanged = true;
            }
            if (fieldsChanged || colsWidthChanged || allProperities.noHead || allProperities.order || allProperities.orderBy || allProperities.selectedIndex) {
                renderHead(table);
            }
            if (allProperities.followHead || allProperities.noFollowHeadCache) {
                initFollowHead(table);
                initTopResetHandler(table);
            }
            if (fieldsChanged || colsWidthChanged || allProperities.encode || allProperities.noDataHtml || allProperities.datasource || allProperities.selectedIndex) {
                renderBody(table);
                tbodyChange = true;
            }
            if (tbodyChange || allProperities.bodyMaxHeight) {
                updateBodyMaxHeight(table);
            }
            if (fieldsChanged || colsWidthChanged || allProperities.foot) {
                renderFoot(table);
            }
            table.extraRepaint = helper.createRepaint([
                {
                    name: 'disabled',
                    paint: setDisabledStyle
                },
                {
                    name: 'width',
                    paint: handleResize
                },
                {
                    name: 'zIndex',
                    paint: resetMainZIndex
                }
            ]);
            table.extraRepaint(changes, changesIndex);
            if (tbodyChange && helper.isInStage(table, 'RENDERED')) {
                switch (table.select) {
                case 'multi':
                    setSelectedIndex(table, []);
                    table.fire('select', { selectedIndex: table.selectedIndex });
                    break;
                }
            }
            if (table.realWidth != getWidth(table)) {
                handleResize(table);
            }
        },
        getId: function (id) {
            return getId(this, id);
        },
        getBodyCellId: function (rowIndex, fieldIndex) {
            return getBodyCellId(this, rowIndex, fieldIndex);
        },
        setCellText: function (text, rowIndex, columnIndex, isEncodeHtml) {
            if (isEncodeHtml) {
                text = lib.encodeHTML(text);
            }
            text = isNullOrEmpty(text) ? '&nbsp' : text;
            lib.g(getId(this, 'cell-textfield-' + rowIndex + '-' + columnIndex)).innerHTML = text;
        },
        getClass: function (name) {
            return getClass(this, name);
        },
        getRow: function (index) {
            return getRow(this, index);
        },
        addRowBuilders: function (builders) {
            addRowBuilderList(this, builders);
        },
        addHandlers: function (eventType, handlers) {
            if (!handlers.length) {
                handlers = [handlers];
            }
            return addHandlers(this, this.main, eventType, handlers);
        },
        removeHandlers: function (eventType, handlers) {
            if (!handlers.length) {
                handlers = [handlers];
            }
            removeHandlers(this, this.main, eventType, handlers);
        },
        adjustWidth: function () {
            handleResize(this);
        },
        setDatasource: function (datasource) {
            this.datasource = datasource;
            setSelectedIndex(this, []);
            var record = { name: 'datasource' };
            var record2 = { name: 'selectedIndex' };
            this.repaint([
                record,
                record2
            ], {
                datasource: record,
                selectedIndex: record2
            });
        },
        updateRowAt: function (index, data) {
            data && (this.datasource[index] = data);
            var dataItem = this.datasource[index];
            var rowEl = getRow(this, index);
            if (dataItem && rowEl) {
                this.fire('beforerowupdate', {
                    index: index,
                    data: dataItem
                });
                var container = document.createElement('div');
                container.innerHTML = getRowHtml(this, data, index, this.rowBuilderList);
                var newRowEl = container.children[0];
                rowEl.parentNode.replaceChild(newRowEl, rowEl);
                this.fire('afterrowupdate', {
                    index: index,
                    data: dataItem
                });
            }
        },
        getSelectedItems: function () {
            var selectedIndex = this.selectedIndex;
            var result = [];
            if (selectedIndex) {
                var datasource = this.datasource;
                if (datasource) {
                    for (var i = 0; i < selectedIndex.length; i++) {
                        result.push(datasource[selectedIndex[i]]);
                    }
                }
            }
            return result;
        },
        setRowSelected: function (index, isSelected) {
            var table = this;
            var isMutil = table.select === 'multi';
            var selectedHandler = isMutil ? selectMulti : selectSingle;
            if (u.isArray(index)) {
                if (isMutil) {
                    u.each(index, function (value) {
                        selectedHandler(table, value, isSelected);
                    });
                } else {
                    selectedHandler(table, index[0], isSelected);
                }
            } else {
                selectedHandler(table, index, isSelected);
            }
            if (isMutil) {
                resetMutilSelectedStatus(table);
            }
        },
        setAllRowSelected: function (isSelected) {
            this.setRowSelected(-1, isSelected);
        },
        resetFollowHead: function () {
            resetFollowHead(this);
        },
        dispose: function () {
            if (helper.isInStage(this, 'DISPOSED')) {
                return;
            }
            helper.beforeDispose(this);
            var main = this.main;
            if (main) {
                this.followDoms = null;
                var mark = lib.g(getId(this, 'drag-mark'));
                if (mark) {
                    document.body.removeChild(mark);
                }
            }
            this.rowBuilderList = null;
            this.headPanel.disposeChildren();
            this.bodyPanel.disposeChildren();
            this.headPanel = null;
            this.bodyPanel = null;
            helper.dispose(this);
            helper.afterDispose(this);
        }
    };
    lib.inherits(Table, Control);
    require('./main').register(Table);
    return Table;
});