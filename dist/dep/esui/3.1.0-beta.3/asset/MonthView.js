define('esui/MonthView', [
    'require',
    './Button',
    './Select',
    './Panel',
    './lib',
    './controlHelper',
    './Control',
    './main',
    'moment'
], function (require) {
    require('./Button');
    require('./Select');
    require('./Panel');
    var lib = require('./lib');
    var helper = require('./controlHelper');
    var Control = require('./Control');
    var ui = require('./main');
    var m = require('moment');
    function MonthView(options) {
        Control.apply(this, arguments);
    }
    function getYearOptions(monthView) {
        var range = monthView.viewRange || monthView.range;
        var ds = [];
        var end = range.end.getFullYear();
        for (var i = range.begin.getFullYear(); i <= end; i++) {
            ds.push({
                text: i,
                value: i
            });
        }
        return ds;
    }
    function getMonthOptions(monthView, year) {
        var range = monthView.viewRange || monthView.range;
        var ds = [];
        var len = 11;
        var i = 0;
        if (year == range.begin.getFullYear()) {
            i = range.begin.getMonth();
        }
        if (year == range.end.getFullYear()) {
            len = range.end.getMonth();
        }
        for (; i <= len; i++) {
            ds.push({
                text: i + 1,
                value: i
            });
        }
        return ds;
    }
    function getMainHTML(monthView) {
        var tpl = [
                '<div class="${headClass}"><table><tr>',
                '<td width="40" align="left">',
                '<div class="${monthBackClass}"',
                ' data-ui-type="Button"',
                ' data-ui-child-name="monthBack"',
                ' data-ui-id="${monthBackId}"',
                '></div>',
                '</td>',
                '<td>',
                '<div class="${yearSelectClass}"',
                ' data-ui="type:Select;childName:yearSel;',
                ' id:${yearSelId};"></div>',
                '</td>',
                '<td>',
                '<div class="${monthSelectClass}"',
                ' data-ui="type:Select;childName:monthSel;',
                ' id:${monthSelId};"></div>',
                '</td>',
                '<td width="40" align="right">',
                '<div class="${monthForClass}"',
                ' data-ui-type="Button"',
                ' data-ui-child-name="monthForward"',
                ' data-ui-id="${monthForwardId}"',
                '></div>',
                '</td>',
                '</tr></table></div>',
                '<div id="${monthMainId}" class="${monthMainClass}"></div>'
            ];
        tpl = tpl.join('');
        return lib.format(tpl, {
            headClass: monthView.helper.getPartClassName('head'),
            monthBackId: monthView.helper.getId('monthBack'),
            monthForwardId: monthView.helper.getId('monthForward'),
            yearSelId: monthView.helper.getId('yearSel'),
            monthSelId: monthView.helper.getId('monthSel'),
            monthMainId: monthView.helper.getId('monthMain'),
            monthMainClass: monthView.helper.getPartClassName('month'),
            monthBackClass: monthView.helper.getPartClassName('month-back'),
            monthForClass: monthView.helper.getPartClassName('month-forward'),
            yearSelectClass: monthView.helper.getPartClassName('year-select'),
            monthSelectClass: monthView.helper.getPartClassName('month-select')
        });
    }
    function getMonthMainHTML(monthView) {
        var titles = [];
        if (monthView.mode === 'multi') {
            titles.push('');
        }
        titles = titles.concat([
            '\u4E00',
            '\u4E8C',
            '\u4E09',
            '\u56DB',
            '\u4E94',
            '\u516D',
            '\u65E5'
        ]);
        var tplHead = '' + '<table border="0" cellpadding="0" cellspacing="0" ' + 'class="${className}"><thead><tr>';
        var html = [];
        html.push(lib.format(tplHead, { className: monthView.helper.getPartClassName('month-main') }));
        var tplHeadItem = '' + '<td id="${id}" data-index="${index}" class="${className}">' + '${text}</td>';
        var headItemClass = monthView.helper.getPartClassName('month-title');
        var headItemId = monthView.helper.getId('month-title');
        var emptyHeadItemClass = monthView.helper.getPartClassName('month-select-all');
        var tLen = titles.length;
        for (var tIndex = 0; tIndex < tLen; tIndex++) {
            html.push(lib.format(tplHeadItem, {
                className: titles[tIndex] === '' ? emptyHeadItemClass : headItemClass,
                text: titles[tIndex],
                index: tIndex,
                id: headItemId + '-' + tIndex
            }));
        }
        html.push('</tr></thead><tbody><tr>');
        var tplItem = '' + '<td data-year="${year}" data-month="${month}" ' + 'data-date="${date}" class="${className}" ' + 'id="${id}">${date}</td>';
        var rowSelectClass = monthView.helper.getPartClassName('month-row-select');
        var tplRowSelectId = monthView.helper.getId('row-select');
        var rowTagIndex = 0;
        var tplRowSelectTpl = '' + '<td id="${id}" class="' + rowSelectClass + '">&gt;</td>';
        var index = 0;
        var year = monthView.year;
        var month = monthView.month;
        var repeater = new Date(year, month, 1);
        var nextMonth = new Date(year, month + 1, 1);
        var begin = 1 - (repeater.getDay() + 6) % 7;
        repeater.setDate(begin);
        var itemClass = monthView.helper.getPartClassName('month-item');
        var todayClass = monthView.helper.getPartClassName('month-item-today');
        var virClass = monthView.helper.getPartClassName('month-item-virtual');
        var disabledClass = monthView.helper.getPartClassName('month-item-disabled');
        var range = monthView.range;
        if (monthView.mode === 'multi') {
            html.push(lib.format(tplRowSelectTpl, { 'id': tplRowSelectId + '-' + rowTagIndex++ }));
        }
        while (nextMonth - repeater > 0 || index % 7 !== 0) {
            if (begin > 1 && index % 7 === 0) {
                html.push('</tr><tr>');
                if (monthView.mode === 'multi') {
                    html.push(lib.format(tplRowSelectTpl, { 'id': tplRowSelectId + '-' + rowTagIndex++ }));
                }
            }
            var virtual = repeater.getMonth() != month;
            var disabled = false;
            if (repeater < range.begin) {
                disabled = true;
            } else if (repeater > range.end) {
                disabled = true;
            }
            var currentClass = itemClass;
            if (virtual) {
                currentClass += ' ' + virClass;
            } else if (m().isSame(repeater, 'day')) {
                currentClass += ' ' + todayClass;
            }
            if (disabled) {
                currentClass += ' ' + disabledClass;
            }
            html.push(lib.format(tplItem, {
                year: repeater.getFullYear(),
                month: repeater.getMonth(),
                date: repeater.getDate(),
                className: currentClass,
                id: getItemId(monthView, repeater)
            }));
            repeater = new Date(year, month, ++begin);
            index++;
        }
        monthView.rowTagNum = rowTagIndex;
        html.push('</tr></tbody></table>');
        return html.join('');
    }
    function getItemId(monthView, date) {
        return monthView.helper.getId(date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate());
    }
    function monthViewClick(e) {
        var tar = e.target || e.srcElement;
        var allSelectClasses = helper.getPartClasses(this, 'month-select-all');
        var headClasses = helper.getPartClasses(this, 'month-title');
        var itemClasses = helper.getPartClasses(this, 'month-item');
        var rowSelectClasses = helper.getPartClasses(this, 'month-row-select');
        var virClasses = helper.getPartClasses(this, 'month-item-virtual');
        var disabledClasses = helper.getPartClasses(this, 'month-item-disabled');
        while (tar && tar != document.body) {
            if (lib.hasClass(tar, itemClasses[0]) && !lib.hasClass(tar, virClasses[0]) && !lib.hasClass(tar, disabledClasses[0])) {
                selectByItem(this, tar);
                return;
            } else if (this.mode === 'multi') {
                if (lib.hasClass(tar, rowSelectClasses[0])) {
                    selectByTagClick(this, tar);
                    return;
                }
                if (lib.hasClass(tar, headClasses[0])) {
                    selectByColumn(this, tar);
                    return;
                }
                if (lib.hasClass(tar, allSelectClasses[0])) {
                    selectAll(this);
                    return;
                }
            }
            tar = tar.parentNode;
        }
    }
    function parseToCache(monthView) {
        var rawValue = monthView.rawValue;
        monthView.viewValue = {};
        for (var i = 0; i < rawValue.length; i++) {
            var singleDay = rawValue[i];
            var year = singleDay.getFullYear();
            var month = singleDay.getMonth();
            var date = singleDay.getDate();
            var id = year + '-' + month + '-' + date;
            monthView.viewValue[id] = {
                isSelected: true,
                value: new Date(year, month, date)
            };
        }
    }
    function isItemSelectable(monthView, dateItem) {
        var virtualClasses = helper.getPartClasses(monthView, 'month-item-virtual');
        var disabledClasses = helper.getPartClasses(monthView, 'month-item-disabled');
        if (!lib.hasClass(dateItem, virtualClasses[0]) && !lib.hasClass(dateItem, disabledClasses[0])) {
            return 1;
        } else if (lib.hasClass(dateItem, virtualClasses[0]) && !lib.hasClass(dateItem, disabledClasses[0])) {
            return -1;
        }
        return 0;
    }
    function setRowTagSelected(monthView, rowTagItem, isSelected) {
        helper.removePartClasses(monthView, 'month-row-select-selected', rowTagItem);
        if (isSelected) {
            helper.addPartClasses(monthView, 'month-row-select-selected', rowTagItem);
        }
    }
    function batchRepaintRowTag(monthView) {
        var rowTagNum = monthView.rowTagNum;
        var rowTagId = helper.getId(monthView, 'row-select');
        for (var i = 0; i < rowTagNum; i++) {
            var rowTag = lib.g(rowTagId + '-' + i);
            repaintRowTag(monthView, rowTag);
        }
    }
    function repaintRowTag(monthView, rowTag) {
        var selectedClasses = helper.getPartClasses(monthView, 'month-item-selected');
        var dateItem = rowTag.nextSibling;
        var isAllSelected = true;
        var selectableNum = 0;
        while (dateItem) {
            if (isItemSelectable(monthView, dateItem) === 1) {
                ++selectableNum;
                if (!lib.hasClass(dateItem, selectedClasses[0])) {
                    isAllSelected = false;
                    break;
                }
            }
            dateItem = dateItem.nextSibling;
        }
        if (selectableNum === 0) {
            isAllSelected = false;
        }
        setRowTagSelected(monthView, rowTag, isAllSelected);
    }
    function selectByColumn(monthView, columnTag) {
        var index = columnTag.getAttribute('data-index');
        var columnSelectedClasses = helper.getPartClasses(monthView, 'month-title-selected');
        var selectAll = true;
        if (lib.hasClass(columnTag, columnSelectedClasses[0])) {
            selectAll = false;
            helper.removePartClasses(monthView, 'month-title-selected', columnTag);
        } else {
            helper.addPartClasses(monthView, 'month-title-selected', columnTag);
        }
        var rowTagNum = monthView.rowTagNum;
        var rowTagId = helper.getId(monthView, 'row-select');
        var viewValue = monthView.viewValue;
        var changedDates = [];
        for (var i = 0; i < rowTagNum; i++) {
            var rowTag = lib.g(rowTagId + '-' + i);
            var sibling = rowTag.parentNode.children[index];
            if (isItemSelectable(monthView, sibling) === 1) {
                var date = sibling.getAttribute('data-date');
                var month = sibling.getAttribute('data-month');
                var year = sibling.getAttribute('data-year');
                var id = year + '-' + month + '-' + date;
                viewValue[id] = {
                    isSelected: selectAll,
                    value: new Date(year, month, date)
                };
                changedDates.push(id);
            }
        }
        if (changedDates && changedDates.length > 0) {
            updateMultiRawValue(monthView);
            updateMultiSelectState(monthView, changedDates, selectAll);
            batchRepaintRowTag(monthView);
            repaintAllSelectTag(monthView);
        }
    }
    function setColumnTagSelected(monthView, columnTagItem, isSelected) {
        helper.removePartClasses(monthView, 'month-title-selected', columnTagItem);
        if (isSelected) {
            helper.addPartClasses(monthView, 'month-title-selected', columnTagItem);
        }
    }
    function batchRepaintColumnTag(monthView) {
        var headItemId = helper.getId(monthView, 'month-title');
        for (var i = 1; i <= 7; i++) {
            var columnTag = lib.g(headItemId + '-' + i);
            repaintColumnTag(monthView, columnTag);
        }
    }
    function repaintColumnTag(monthView, columnTagItem) {
        var selectedClasses = helper.getPartClasses(monthView, 'month-item-selected');
        var index = columnTagItem.getAttribute('data-index');
        var isAllSelected = true;
        var selectableNum = 0;
        var rowTagNum = monthView.rowTagNum;
        var rowTagId = helper.getId(monthView, 'row-select');
        for (var i = 0; i < rowTagNum; i++) {
            var rowTag = lib.g(rowTagId + '-' + i);
            var sibling = rowTag.parentNode.children[index];
            if (isItemSelectable(monthView, sibling) === 1) {
                ++selectableNum;
                if (!lib.hasClass(sibling, selectedClasses[0])) {
                    isAllSelected = false;
                    break;
                }
            }
        }
        if (selectableNum === 0) {
            isAllSelected = false;
        }
        setColumnTagSelected(monthView, columnTagItem, isAllSelected);
    }
    function selectByTagClick(monthView, rowTag) {
        var row = rowTag.parentNode;
        var rowSelectClasses = helper.getPartClasses(monthView, 'month-row-select');
        var rowSelectedClasses = helper.getPartClasses(monthView, 'month-row-select-selected');
        var virtualClasses = helper.getPartClasses(monthView, 'month-item-virtual');
        var disabledClasses = helper.getPartClasses(monthView, 'month-item-disabled');
        var selectAll = true;
        if (lib.hasClass(rowTag, rowSelectedClasses[0])) {
            selectAll = false;
            helper.removePartClasses(monthView, 'month-row-select-selected', rowTag);
        } else {
            helper.addPartClasses(monthView, 'month-row-select-selected', rowTag);
        }
        var children = row.children;
        var viewValue = monthView.viewValue;
        var changedDates = [];
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.nodeType === 1 && !lib.hasClass(child, rowSelectClasses[0]) && !lib.hasClass(child, virtualClasses[0]) && !lib.hasClass(child, disabledClasses[0])) {
                var date = child.getAttribute('data-date');
                var month = child.getAttribute('data-month');
                var year = child.getAttribute('data-year');
                var id = year + '-' + month + '-' + date;
                viewValue[id] = {
                    isSelected: selectAll,
                    value: new Date(year, month, date)
                };
                changedDates.push(id);
            }
        }
        if (changedDates && changedDates.length > 0) {
            updateMultiRawValue(monthView);
            updateMultiSelectState(monthView, changedDates, selectAll);
            batchRepaintColumnTag(monthView);
            repaintAllSelectTag(monthView);
        }
    }
    function repaintAllSelectTag(monthView) {
        var rowTagNum = monthView.rowTagNum;
        var rowTagId = helper.getId(monthView, 'row-select');
        var selectAllTag = lib.g(helper.getId(monthView, 'month-title-0'));
        var rowSelectedClasses = helper.getPartClasses(monthView, 'month-row-select-selected');
        var selectedRowNum = 0;
        for (var i = 0; i < rowTagNum; i++) {
            var rowTag = lib.g(rowTagId + '-' + i);
            if (lib.hasClass(rowTag, rowSelectedClasses[0])) {
                selectedRowNum++;
            }
        }
        if (selectedRowNum === rowTagNum) {
            helper.addPartClasses(monthView, 'month-select-all-selected', selectAllTag);
        } else {
            helper.removePartClasses(monthView, 'month-select-all-selected', selectAllTag);
        }
    }
    function selectAll(monthView) {
        var rowTagNum = monthView.rowTagNum;
        var rowTagId = helper.getId(monthView, 'row-select');
        for (var i = 0; i < rowTagNum; i++) {
            var rowTag = lib.g(rowTagId + '-' + i);
            helper.removePartClasses(monthView, 'month-row-select-selected', rowTag);
            selectByTagClick(monthView, rowTag);
        }
    }
    function updateMultiRawValue(monthView) {
        var selectedDates = [];
        for (var key in monthView.viewValue) {
            if (monthView.viewValue[key].isSelected) {
                selectedDates.push(monthView.viewValue[key].value);
            }
        }
        selectedDates.sort(function (a, b) {
            return a - b;
        });
        monthView.rawValue = selectedDates;
        monthView.fire('change');
    }
    function updateMultiSelectState(monthView, dates, selectAll) {
        if (selectAll) {
            paintMultiSelected(monthView, dates);
        } else {
            resetMultiSelected(monthView, dates);
        }
    }
    function resetMultiSelected(monthView, dates) {
        var me = monthView;
        for (var i = 0; i < dates.length; i++) {
            var id = helper.getId(monthView, dates[i]);
            var item = lib.g(id);
            if (item) {
                lib.removeClasses(item, helper.getPartClasses(me, 'month-item-selected'));
            }
        }
    }
    function paintMultiSelected(monthView, dates) {
        var me = monthView;
        for (var i = 0; i < dates.length; i++) {
            var id = helper.getId(monthView, dates[i]);
            var item = lib.g(id);
            if (item) {
                lib.addClasses(item, helper.getPartClasses(me, 'month-item-selected'));
            }
        }
    }
    function switchState(monthView, item, className) {
        if (!item) {
            return false;
        }
        var classes = helper.getPartClasses(monthView, className);
        if (lib.hasClass(item, classes[0])) {
            helper.removePartClasses(monthView, className, item);
            return false;
        } else {
            helper.addPartClasses(monthView, className, item);
            return true;
        }
    }
    function selectByItem(monthView, item) {
        var date = item.getAttribute('data-date');
        var month = item.getAttribute('data-month');
        var year = item.getAttribute('data-year');
        var id = year + '-' + month + '-' + date;
        if (monthView.mode === 'multi') {
            var state = switchState(monthView, item, 'month-item-selected');
            monthView.viewValue[id] = {
                isSelected: state,
                value: new Date(year, month, date)
            };
            updateMultiRawValue(monthView);
            var rowTag = item.parentNode.firstChild;
            repaintRowTag(monthView, rowTag);
            batchRepaintColumnTag(monthView);
            repaintAllSelectTag(monthView);
        } else {
            var itemSelectClasses = helper.getPartClasses(monthView, 'month-item-selected');
            if (lib.hasClass(item, itemSelectClasses[0])) {
                return;
            }
            var newDate = new Date(year, month, date);
            updateSingleSelectState(monthView, monthView.rawValue, newDate);
            monthView.rawValue = newDate;
            monthView.fire('change');
            monthView.fire('itemclick');
        }
    }
    function reviseYearMonth(monthView, year, month) {
        var me = monthView;
        var range = me.viewRange || me.range;
        var rangeBegin = range.begin.getFullYear() * 12 + range.begin.getMonth();
        var rangeEnd = range.end.getFullYear() * 12 + range.end.getMonth();
        var viewMonth = year * 12 + month;
        var view = new Date(year, month, 1);
        month = view.getMonth();
        if (rangeBegin - viewMonth > 0) {
            month += rangeBegin - viewMonth;
        } else if (viewMonth - rangeEnd > 0) {
            month -= viewMonth - rangeEnd;
        }
        view.setMonth(month);
        month = view.getMonth();
        year = view.getFullYear();
        return {
            year: year,
            month: month
        };
    }
    function repaintMonthView(monthView, year, month) {
        if (year == null) {
            year = monthView.year;
        }
        if (month == null) {
            month = monthView.month;
        }
        var me = monthView;
        var revisedYearMonth = reviseYearMonth(me, year, month);
        me.month = revisedYearMonth.month;
        me.year = revisedYearMonth.year;
        var yearSelect = me.getChild('yearSel');
        var lastYear = yearSelect.getValue();
        yearSelect.setProperties({
            datasource: getYearOptions(me),
            value: me.year
        });
        if (lastYear == me.year) {
            yearSelect.fire('change');
        }
    }
    function updateSingleSelectState(monthView, oldDate, newDate) {
        if (oldDate !== newDate) {
            if (oldDate) {
                var lastSelectedItem = lib.g(getItemId(monthView, oldDate));
                if (lastSelectedItem) {
                    switchState(monthView, lastSelectedItem, 'month-item-selected');
                }
            }
            var curSelectedItem = lib.g(getItemId(monthView, newDate));
            if (curSelectedItem) {
                if (isItemSelectable(monthView, curSelectedItem)) {
                    switchState(monthView, curSelectedItem, 'month-item-selected');
                } else {
                    monthView.rawValue = null;
                    return null;
                }
            }
        }
        return newDate;
    }
    function goToNextMonth(monthView) {
        var nowDate = new Date(monthView.year, monthView.month, 1);
        var newDate = m(nowDate).add('month', 1);
        repaintMonthView(monthView, newDate.year(), newDate.month());
    }
    function goToPrevMonth(monthView) {
        var nowDate = new Date(monthView.year, monthView.month, 1);
        var newDate = m(nowDate).subtract('month', 1);
        repaintMonthView(monthView, newDate.year(), newDate.month());
    }
    function changeYear(monthView, yearSel) {
        var year = parseInt(yearSel.getValue(), 10);
        monthView.year = year;
        var month = monthView.month;
        var revisedYearMonth = reviseYearMonth(monthView, year, month);
        month = revisedYearMonth.month;
        monthView.month = month;
        var monthSelect = monthView.getChild('monthSel');
        var changes = monthSelect.setProperties({
                datasource: getMonthOptions(monthView, monthView.year),
                value: monthView.month
            });
        if (!changes.hasOwnProperty('rawValue')) {
            changeMonth(monthView, monthSelect);
        }
        monthView.fire('changeyear');
    }
    function changeMonth(monthView, monthSel) {
        var month = parseInt(monthSel.getValue(), 10);
        monthView.month = month;
        updateMain(monthView);
        monthView.fire('changemonth');
    }
    function updateMain(monthView) {
        var monthMainId = helper.getId(monthView, 'monthMain');
        var monthMain = lib.g(monthMainId);
        monthMain.innerHTML = getMonthMainHTML(monthView);
        var rowElements = monthMain.getElementsByTagName('tr');
        var lastRow = rowElements[rowElements.length - 1];
        helper.addPartClasses(monthView, 'last-row', lastRow);
        updateSelectStateByValue(monthView);
    }
    function rangeAdapter(range) {
        var begin;
        var end;
        if (typeof range === 'string') {
            var beginAndEnd = range.split(',');
            begin = parseToDate(beginAndEnd[0]);
            end = parseToDate(beginAndEnd[1]);
        } else {
            begin = range.begin;
            end = range.end;
        }
        if (begin > end) {
            return {
                begin: end,
                end: begin
            };
        }
        return {
            begin: begin,
            end: end
        };
    }
    function parseToDate(dateStr) {
        function parse(source) {
            var dates = source.split('-');
            if (dates) {
                return new Date(parseInt(dates[0], 10), parseInt(dates[1], 10) - 1, parseInt(dates[2], 10));
            }
            return null;
        }
        dateStr = dateStr + '';
        var dateAndHour = dateStr.split(' ');
        var date = parse(dateAndHour[0]);
        if (dateAndHour[1]) {
            var clock = dateAndHour[1].split(':');
            date.setHours(clock[0]);
            date.setMinutes(clock[1]);
            date.setSeconds(clock[2]);
        }
        return date;
    }
    function parseValueByMode(value, mode) {
        if (mode === 'single') {
            return parseToDate(value);
        } else {
            var dateStrs = value.split(',');
            var dates = [];
            for (var i = 0; i < dateStrs.length - 1; i += 2) {
                var begin = parseToDate(dateStrs[i]);
                var end = parseToDate(dateStrs[i + 1]);
                var temp;
                if (!begin || !end) {
                    continue;
                }
                if (begin - end === 0) {
                    dates.push(begin);
                } else {
                    temp = begin;
                    while (temp <= end) {
                        dates.push(temp);
                        temp = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate() + 1);
                    }
                }
            }
            return dates;
        }
    }
    function updateSelectStateByValue(monthView) {
        if (monthView.mode === 'multi') {
            var viewValue = monthView.viewValue;
            for (var key in viewValue) {
                var item = lib.g(helper.getId(monthView, key));
                if (item) {
                    var isSelectable = isItemSelectable(monthView, item);
                    if (isSelectable === 1) {
                        if (viewValue[key].isSelected) {
                            helper.addPartClasses(monthView, 'month-item-selected', item);
                        } else {
                            helper.removePartClasses(monthView, 'month-item-selected', item);
                        }
                    } else if (isSelectable === 0) {
                        viewValue[key].isSelected = false;
                        updateMultiRawValue(monthView);
                    }
                }
            }
            batchRepaintRowTag(monthView);
            batchRepaintColumnTag(monthView);
            repaintAllSelectTag(monthView);
        } else {
            updateSingleSelectState(monthView, null, monthView.rawValue);
        }
    }
    MonthView.prototype = {
        type: 'MonthView',
        initOptions: function (options) {
            var properties = {
                    range: {
                        begin: new Date(1982, 10, 4),
                        end: new Date(2046, 10, 4)
                    },
                    dateFormat: 'YYYY-MM-DD',
                    paramFormat: 'YYYY-MM-DD',
                    viewValue: {},
                    mode: 'single'
                };
            lib.extend(properties, options);
            this.setProperties(properties);
        },
        setProperties: function (properties) {
            if (properties.range) {
                properties.range = rangeAdapter(properties.range);
            }
            var now = new Date();
            var mode = properties.mode || this.mode;
            if (properties.rawValue == null) {
                if (properties.value) {
                    properties.rawValue = parseValueByMode(properties.value, mode);
                } else {
                    if (this.rawValue == null) {
                        if (mode === 'single') {
                            properties.rawValue = now;
                        } else {
                            properties.rawValue = [];
                        }
                    }
                }
            }
            var year = properties.year;
            var month = properties.month;
            if (!year && month == null) {
                if (mode === 'single') {
                    if (properties.rawValue) {
                        year = properties.rawValue.getFullYear();
                        month = properties.rawValue.getMonth() + 1;
                    }
                } else {
                    year = now.getFullYear();
                    month = now.getMonth() + 1;
                }
            }
            if (year && month) {
                properties.year = parseInt(year, 10);
                properties.month = parseInt(month, 10) - 1;
            } else if (properties.hasOwnProperty('year')) {
                if (this.month == null) {
                    delete properties.year;
                }
            } else if (properties.hasOwnProperty('month')) {
                if (this.year == null) {
                    delete properties.month;
                } else {
                    properties.month = parseInt(month, 10) - 1;
                }
            }
            var changes = Control.prototype.setProperties.apply(this, arguments);
            if (changes.hasOwnProperty('rawValue')) {
                this.fire('change');
            }
            return changes;
        },
        initStructure: function () {
            this.main.innerHTML = getMainHTML(this);
            this.initChildren(this.main);
            if (this.mode === 'multi') {
                this.addState('multi-select');
            }
        },
        initEvents: function () {
            var monthBack = this.getChild('monthBack');
            monthBack.on('click', lib.curry(goToPrevMonth, this));
            var monthForward = this.getChild('monthForward');
            monthForward.on('click', lib.curry(goToNextMonth, this));
            var monthSel = this.getChild('monthSel');
            monthSel.on('change', lib.curry(changeMonth, this, monthSel));
            var yearSel = this.getChild('yearSel');
            yearSel.on('change', lib.curry(changeYear, this, yearSel));
            var monthMain = this.helper.getPart('monthMain');
            helper.addDOMEvent(this, monthMain, 'click', monthViewClick);
        },
        repaint: helper.createRepaint(Control.prototype.repaint, {
            name: [
                'range',
                'rawValue',
                'year',
                'month'
            ],
            paint: function (monthView, range, rawValue, year, month) {
                if (rawValue) {
                    if (monthView.mode === 'multi') {
                        parseToCache(monthView);
                    }
                }
                repaintMonthView(monthView, monthView.year, monthView.month);
            }
        }, {
            name: 'disabled',
            paint: function (monthView, disabled) {
                var monthBack = monthView.getChild('monthBack');
                monthBack.setProperties({ disabled: disabled });
                var monthForward = monthView.getChild('monthForward');
                monthForward.setProperties({ disabled: disabled });
                var monthSel = monthView.getChild('monthSel');
                monthSel.setProperties({ disabled: disabled });
                var yearSel = monthView.getChild('yearSel');
                yearSel.setProperties({ disabled: disabled });
            }
        }),
        disable: function () {
            this.setProperties({ disabled: true });
            this.addState('disabled');
        },
        enable: function () {
            this.setProperties({ disabled: false });
            this.removeState('disabled');
        },
        setRange: function (range) {
            this.setProperties({ 'range': range });
        },
        setRawValue: function (date) {
            this.setProperties({ 'rawValue': date });
        },
        getRawValue: function () {
            return this.rawValue;
        },
        getValue: function () {
            return this.stringifyValue(this.rawValue);
        },
        stringifyValue: function (rawValue) {
            if (this.mode === 'single') {
                return lib.date.format(rawValue, this.paramFormat) || '';
            } else {
                var dateStrs = [];
                var oneDay = 86400000;
                for (var i = 0; i < rawValue.length; i++) {
                    if (i === 0) {
                        dateStrs.push(lib.date.format(rawValue[i], this.paramFormat));
                    } else {
                        if (rawValue[i] - rawValue[i - 1] > oneDay) {
                            dateStrs.push(lib.date.format(rawValue[i - 1], this.paramFormat));
                            dateStrs.push(lib.date.format(rawValue[i], this.paramFormat));
                        } else if (i == rawValue.length - 1) {
                            dateStrs.push(lib.date.format(rawValue[i], this.paramFormat));
                        } else {
                            continue;
                        }
                    }
                }
                return dateStrs.join(',');
            }
        },
        parseValue: function (value) {
            return parseValueByMode(value, this.mode);
        },
        setRawValueWithoutFireChange: function (value) {
            this.rawValue = value;
            parseToCache(this);
        }
    };
    lib.inherits(MonthView, Control);
    ui.register(MonthView);
    return MonthView;
});