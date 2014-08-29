define('esui/RichCalendar', [
    'require',
    './Button',
    './MonthView',
    './TextBox',
    './lib',
    './controlHelper',
    './InputControl',
    './main',
    'moment'
], function (require) {
    require('./Button');
    require('./MonthView');
    require('./TextBox');
    var lib = require('./lib');
    var helper = require('./controlHelper');
    var InputControl = require('./InputControl');
    var ui = require('./main');
    var m = require('moment');
    function RichCalendar(options) {
        InputControl.apply(this, arguments);
    }
    function getLayerHtml(calendar) {
        var displayNum = calendar.displayNum;
        var monthViewContainerTpl = '' + '<div id="${id}" class="${className}">${monthView}</div>';
        var monthViews = [];
        for (var i = 0; i < displayNum; i++) {
            monthViews.push(lib.format(monthViewContainerTpl, {
                id: helper.getId(calendar, 'month-' + i),
                className: helper.getPartClasses(calendar, 'month-container'),
                monthView: getCalendarHtml(calendar, i)
            }));
        }
        return monthViews.join('');
    }
    function getCalendarHtml(calendar, index) {
        var tpl = '' + '<div' + ' data-ui-type="MonthView"' + ' data-ui-child-name="${calName}"' + ' data-ui-mode="multi">' + '</div>';
        return lib.format(tpl, { calName: 'monthView' + index });
    }
    function showLayer(calendar) {
        var layer = calendar.layer;
        layer.style.zIndex = helper.layer.getZIndex(calendar.main);
        helper.layer.attachTo(layer, calendar.main, {
            top: 'bottom',
            left: 'left',
            spaceDetection: 'both'
        });
        helper.removePartClasses(calendar, 'layer-hidden', calendar.layer);
        calendar.addState('active');
    }
    function hideLayer(calendar) {
        if (calendar.layer) {
            helper.addPartClasses(calendar, 'layer-hidden', calendar.layer);
            calendar.removeState('active');
        }
    }
    function closeLayer(e) {
        var tar = e.target || e.srcElement;
        while (tar && tar != document.body) {
            if (tar == this.layer) {
                return;
            }
            var button = this.getChild('modifyBtn').main;
            if (tar == button) {
                return;
            }
            tar = tar.parentNode;
        }
        hideLayer(this);
    }
    function openLayer(calendar) {
        var layer = calendar.layer;
        if (!layer) {
            layer = helper.layer.create('div');
            helper.addPartClasses(calendar, 'layer', layer);
            layer.innerHTML = getLayerHtml(calendar);
            calendar.layer = layer;
            hideLayer(calendar);
            document.body.appendChild(layer);
            calendar.initChildren(layer);
        }
        paintCals(calendar, true);
        showLayer(calendar);
    }
    function syncValueOfMonthViews(calendar, index) {
        var rawValue = this.getRawValue();
        var displayNum = calendar.displayNum;
        for (var i = 0; i < displayNum; i++) {
            if (i !== index) {
                var monthView = calendar.getChild('monthView' + i);
                monthView.setRawValueWithoutFireChange(rawValue);
            }
        }
        calendar.rawValue = rawValue;
        updateMain(calendar, rawValue);
    }
    function updateMonthOrYear(calendar, index) {
        var displayNum = calendar.displayNum;
        var syncDate = new Date(this.year, this.month, 1);
        for (var i = 0; i < displayNum; i++) {
            if (i !== index) {
                var monthView = calendar.getChild('monthView' + i);
                monthView.un('changemonth');
                monthView.un('changeyear');
                var scope = index - i;
                var newDate;
                if (scope > 0) {
                    newDate = m(syncDate).subtract('month', scope);
                } else {
                    newDate = m(syncDate).add('month', -scope);
                }
                monthView.setProperties({
                    month: newDate.month() + 1,
                    year: newDate.year()
                });
                monthView.on('changeyear', lib.curry(updateMonthOrYear, calendar, i));
                monthView.on('changemonth', lib.curry(updateMonthOrYear, calendar, i));
            }
        }
    }
    function paintCals(calendar, bindEvent) {
        var displayNum = calendar.displayNum;
        var startMonth = calendar.startMonth;
        var startYear = calendar.startYear;
        for (var i = 0; i < displayNum; i++) {
            var rangeBegin = calendar.range.begin;
            var rangeEnd = calendar.range.end;
            var rangeBeginYear = rangeBegin.getFullYear();
            var rangeBeginMonth = rangeBegin.getMonth();
            var rangeEndYear = rangeEnd.getFullYear();
            var rangeEndMonth = rangeEnd.getMonth();
            var trueRange;
            var realEnd;
            var realBegin;
            if (i === 0) {
                realEnd = new Date(rangeEndYear, rangeEndMonth - displayNum + 2, 0);
                trueRange = {
                    begin: calendar.range.begin,
                    end: realEnd
                };
            } else if (i == displayNum - 1) {
                realBegin = new Date(rangeBeginYear, rangeBeginMonth + displayNum - 1, 1);
                trueRange = {
                    begin: realBegin,
                    end: calendar.range.end
                };
            } else {
                realBegin = new Date(rangeBeginYear, rangeBeginMonth + i, 1);
                realEnd = new Date(rangeEndYear, rangeEndMonth - displayNum - i + 2, 0);
                trueRange = {
                    begin: realBegin,
                    end: realEnd
                };
            }
            var options = {
                    year: startYear,
                    month: startMonth + i,
                    rawValue: calendar.rawValue,
                    range: calendar.range,
                    viewRange: trueRange
                };
            paintCal(calendar, options, i, bindEvent);
        }
    }
    function paintCal(calendar, options, index, bindEvent) {
        var monthView = calendar.getChild('monthView' + index);
        monthView.setProperties(options);
        if (bindEvent === true) {
            monthView.on('change', lib.curry(syncValueOfMonthViews, calendar, index));
            monthView.on('changeyear', lib.curry(updateMonthOrYear, calendar, index));
            monthView.on('changemonth', lib.curry(updateMonthOrYear, calendar, index));
        }
    }
    function updateMain(calendar, value) {
        var inputId = helper.getId(calendar, 'param-value');
        lib.g(inputId).value = calendar.stringifyValue(value);
        var textInput = calendar.getChild('textInput');
        var textValue = getValueText(calendar, value);
        textInput.setProperties({ rawValue: textValue });
        updateTotalInfo(calendar, value);
        calendar.fire('change');
    }
    function updateTotalInfo(calendar, rawValue) {
        var totalNum = lib.g(helper.getId(calendar, 'total-num'));
        totalNum.innerHTML = rawValue.length;
    }
    function deleteAll(calendar) {
        calendar.set('rawValue', []);
    }
    function toggleLayer(calendar) {
        if (calendar.disabled) {
            return;
        }
        if (!calendar.layer) {
            openLayer(calendar);
        } else {
            var layer = calendar.layer;
            var classes = helper.getPartClasses(calendar, 'layer-hidden');
            if (lib.hasClass(layer, classes[0])) {
                openLayer(calendar);
            } else {
                hideLayer(calendar);
            }
        }
    }
    function convertToRaw(value) {
        var strDates = value.split(',');
        if (strDates.length === 1) {
            strDates.push('2046-11-04');
        } else if (strDates[0] === '') {
            strDates[0] = '1983-09-03';
        } else if (strDates[1] === '') {
            strDates[1] = '2046-11-04';
        }
        return {
            begin: parseToDate(strDates[0]),
            end: parseToDate(strDates[1])
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
        if (!dateStr) {
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
    function getValueText(calendar, rawValue) {
        var dateStrs = [];
        var tempDate = [];
        var tempIndex = 0;
        var oneDay = 86400000;
        for (var i = 0; i < rawValue.length; i++) {
            if (i === 0) {
                dateStrs.push(lib.date.format(rawValue[i], calendar.paramFormat));
                tempDate.push(rawValue[i]);
                tempIndex++;
            } else {
                if (rawValue[i] - rawValue[i - 1] > oneDay) {
                    if (rawValue[i - 1] - tempDate[tempIndex - 1] !== 0) {
                        dateStrs.push('\u81F3');
                        dateStrs.push(lib.date.format(rawValue[i - 1], calendar.paramFormat));
                        tempDate.push(rawValue[i - 1]);
                        tempIndex++;
                    }
                    dateStrs.push('\n');
                    dateStrs.push(lib.date.format(rawValue[i], calendar.paramFormat));
                    tempDate.push(rawValue[i]);
                    tempIndex++;
                } else if (i == rawValue.length - 1) {
                    dateStrs.push('\u81F3');
                    dateStrs.push(lib.date.format(rawValue[i], calendar.paramFormat));
                } else {
                    continue;
                }
            }
        }
        return dateStrs.join('');
    }
    function updateRawValueByTyping(calendar) {
        var textInputValue = this.getValue();
        var items = textInputValue.replace(/\n{2,}/g, '\n').split('\n');
        var result = [];
        var container = {};
        var invalid = false;
        for (var i = 0, len = items.length; i < len; i++) {
            var item = lib.trim(items[i]);
            if (item.length === 0 || container[item]) {
                continue;
            }
            container[item] = 1;
            var beginEnd = item.split('\u81F3');
            var begin = beginEnd[0];
            var end = begin;
            if (beginEnd.length > 1) {
                end = beginEnd[1];
            }
            if (isDate(begin) && isDate(end)) {
                result.push(begin);
                result.push(end);
            } else {
                invalid = true;
            }
        }
        var value = result.join(',');
        calendar.rawValue = calendar.parseValue(value);
        this.setProperties({ rawValue: getValueText(calendar, calendar.rawValue) });
        calendar.fire('change');
    }
    function isDate(date) {
        var reg = /^(\d{4})(-)(\d{2})\2(\d{2})$/;
        var r = date.match(reg);
        if (r == null) {
            return false;
        }
        var d = new Date(r[1], r[3] - 1, r[4]);
        var newStr = '' + d.getFullYear() + r[2] + (d.getMonth() + 1) + r[2] + d.getDate();
        date = r[1] + r[2] + (r[3] - 1 + 1) + r[2] + (r[4] - 1 + 1);
        return newStr == date;
    }
    RichCalendar.prototype = {
        type: 'RichCalendar',
        initOptions: function (options) {
            var now = new Date();
            var properties = {
                    now: now,
                    range: {
                        begin: new Date(1983, 8, 3),
                        end: new Date(2046, 10, 4)
                    },
                    paramFormat: 'YYYY-MM-DD',
                    rawValue: [],
                    displayNum: 2,
                    startYear: now.getFullYear(),
                    startMonth: now.getMonth() + 1
                };
            helper.extractValueFromInput(this, options);
            if (options.range && typeof options.range === 'string') {
                options.range = convertToRaw(options.range);
            }
            lib.extend(properties, options);
            this.setProperties(properties);
        },
        setProperties: function (properties) {
            if (properties.rawValue == null || properties.rawValue.length === 0) {
                if (properties.value) {
                    properties.rawValue = this.parseValue(properties.value);
                }
            }
            if (properties.rawValue && properties.rawValue.length) {
                var startDate = properties.rawValue[0];
                properties.startYear = startDate.getFullYear();
                properties.startMonth = startDate.getMonth() + 1;
            }
            var changes = InputControl.prototype.setProperties.apply(this, arguments);
            return changes;
        },
        initStructure: function () {
            if (lib.isInput(this.main)) {
                helper.replaceMain(this);
            }
            var tpl = [
                    '<div class="${className}" id="${id}">',
                    '<textarea data-ui-type="TextBox"',
                    ' data-ui-mode="textarea"',
                    ' data-ui-height="100"',
                    ' data-ui-child-name="textInput"></textarea>',
                    '<div data-ui-type="Panel" class="${generalPanelClass}"',
                    ' data-ui-child-name="generalPanel">',
                    '\u5171<span id="${totalNumId}" ',
                    'class="${totalNumClass}"></span>\u5929,',
                    '<span data-ui-type="Button" data-ui-skin="link"',
                    ' data-ui-child-name="deleteBtn">\u5168\u90E8\u5220\u9664</span>',
                    '</div>',
                    '<div data-ui-type="Button" data-ui-skin="calendar"',
                    ' data-ui-child-name="modifyBtn">\u4FEE\u6539\u65F6\u95F4</div>',
                    '</div>',
                    '<input type="hidden" id="${inputId}" name="${name}"',
                    ' value="" />'
                ];
            var getClass = helper.getPartClasses;
            this.main.innerHTML = lib.format(tpl.join('\n'), {
                className: getClass(this, 'text').join(' '),
                id: helper.getId(this, 'text'),
                name: this.name,
                inputId: helper.getId(this, 'param-value'),
                generalPanelClass: getClass(this, 'general-info').join(' '),
                totalNumId: helper.getId(this, 'total-num'),
                totalNumClass: getClass(this, 'total-num').join(' ')
            });
            this.initChildren(this.main);
        },
        initEvents: function () {
            var modifyBtn = this.getChild('modifyBtn');
            modifyBtn.on('click', lib.curry(toggleLayer, this));
            var deleteAllBtn = this.getChild('generalPanel').getChild('deleteBtn');
            deleteAllBtn.on('click', lib.curry(deleteAll, this));
            var textInput = this.getChild('textInput');
            textInput.on('blur', lib.curry(updateRawValueByTyping, this));
            helper.addDOMEvent(this, document, 'mousedown', closeLayer);
        },
        repaint: helper.createRepaint(InputControl.prototype.repaint, {
            name: [
                'rawValue',
                'range'
            ],
            paint: function (calendar, rawValue, range) {
                if (range) {
                    if (typeof range === 'string') {
                        range = convertToRaw(range);
                    }
                    if (!range.begin) {
                        range.begin = new Date(1983, 8, 3);
                    } else if (!range.end) {
                        range.end = new Date(2046, 10, 4);
                    }
                    calendar.range = range;
                }
                if (rawValue) {
                    updateMain(calendar, rawValue);
                }
                if (calendar.layer) {
                    paintCals(calendar);
                }
            }
        }, {
            name: [
                'disabled',
                'hidden',
                'readOnly'
            ],
            paint: function (calendar, disabled, hidden, readOnly) {
                if (disabled || hidden || readOnly) {
                    hideLayer(calendar);
                }
            }
        }),
        setRawValue: function (date) {
            this.setProperties({ 'rawValue': date });
        },
        getRawValue: function () {
            return this.rawValue;
        },
        stringifyValue: function (rawValue) {
            var dateStrs = [];
            var oneDay = 86400000;
            for (var i = 0; i < rawValue.length; i++) {
                if (i === 0) {
                    dateStrs.push(lib.date.format(rawValue[i], this.paramFormat));
                } else {
                    if (rawValue[i] - rawValue[i - 1] > oneDay) {
                        dateStrs.push(lib.date.format(rawValue[i - 1], this.paramFormat));
                        dateStrs.push(lib.date.format(rawValue[i], this.paramFormat));
                    }
                }
                if (i === rawValue.length - 1) {
                    dateStrs.push(lib.date.format(rawValue[i], this.paramFormat));
                }
            }
            return dateStrs.join(',');
        },
        getRanges: function () {
            var rawValue = this.rawValue;
            var dateStrs = this.stringifyValue(rawValue).split(',');
            var range = [];
            for (var i = 0; i < dateStrs.length - 1; i += 2) {
                var begin = parseToDate(dateStrs[i]);
                var end = parseToDate(dateStrs[i + 1]);
                range.push({
                    begin: begin,
                    end: end
                });
            }
            return range;
        },
        setRanges: function (rangeValue) {
            var dates = {};
            for (var i = 0; i < rangeValue.length; i++) {
                var begin = rangeValue[i].begin;
                var end = rangeValue[i].end;
                var temp;
                if (!begin || !end) {
                    continue;
                }
                if (begin - end === 0) {
                    dates[begin] = begin;
                } else {
                    temp = begin;
                    while (temp <= end) {
                        dates[temp] = temp;
                        temp = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate() + 1);
                    }
                }
            }
            var rawDates = [];
            for (var key in dates) {
                rawDates.push(dates[key]);
            }
            rawDates.sort(function (a, b) {
                return a - b;
            });
            this.set('rawValue', rawDates);
        },
        parseValue: function (value) {
            var dateStrs = value.split(',');
            var dates = {};
            for (var i = 0; i < dateStrs.length - 1; i += 2) {
                var begin = parseToDate(dateStrs[i]);
                var end = parseToDate(dateStrs[i + 1]);
                var temp;
                if (!begin || !end) {
                    continue;
                }
                if (begin - end === 0) {
                    dates[begin] = begin;
                } else {
                    temp = begin;
                    while (temp <= end) {
                        dates[temp] = temp;
                        temp = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate() + 1);
                    }
                }
            }
            var rawDates = [];
            for (var key in dates) {
                rawDates.push(dates[key]);
            }
            rawDates.sort(function (a, b) {
                return a - b;
            });
            return rawDates;
        },
        dispose: function () {
            if (helper.isInStage(this, 'DISPOSED')) {
                return;
            }
            var layer = this.layer;
            if (layer) {
                layer.parentNode.removeChild(layer);
                this.layer = null;
            }
            InputControl.prototype.dispose.apply(this, arguments);
        }
    };
    lib.inherits(RichCalendar, InputControl);
    ui.register(RichCalendar);
    return RichCalendar;
});