define('esui/RangeCalendar', [
    'require',
    './Button',
    './MonthView',
    './CheckBox',
    './Label',
    './lib',
    './InputControl',
    './controlHelper',
    './Layer',
    './main',
    'moment',
    'underscore'
], function (require) {
    require('./Button');
    require('./MonthView');
    require('./CheckBox');
    require('./Label');
    var lib = require('./lib');
    var InputControl = require('./InputControl');
    var helper = require('./controlHelper');
    var Layer = require('./Layer');
    var ui = require('./main');
    var m = require('moment');
    var u = require('underscore');
    function RangeCalendarLayer() {
        Layer.apply(this, arguments);
    }
    lib.inherits(RangeCalendarLayer, Layer);
    RangeCalendarLayer.prototype.render = function (element) {
        var calendar = this.control;
        document.body.appendChild(element);
        element.innerHTML = getLayerHtml(calendar);
        calendar.helper.initChildren(element);
        var shortcutDom = calendar.helper.getPart('shortcut');
        helper.addDOMEvent(calendar, shortcutDom, 'click', shortcutClick);
        paintCal(calendar, 'begin', calendar.view.begin, true);
        paintCal(calendar, 'end', calendar.view.end, true);
        var selectedIndex = getSelectedIndex(calendar, calendar.view);
        paintMiniCal(calendar, selectedIndex);
        var endlessCheck = calendar.getChild('endlessCheck');
        if (endlessCheck) {
            endlessCheck.on('change', lib.curry(makeCalendarEndless, calendar));
            if (calendar.isEndless) {
                endlessCheck.setChecked(true);
                calendar.helper.addPartClasses('shortcut-disabled', calendar.helper.getPart(calendar));
            }
        }
        var okBtn = calendar.getChild('okBtn');
        okBtn.on('click', lib.curry(commitValue, calendar));
        var cancelBtn = calendar.getChild('cancelBtn');
        cancelBtn.on('click', u.bind(calendar.layer.hide, calendar.layer));
        var closeBtn = calendar.getChild('closeBtn');
        closeBtn.on('click', u.bind(calendar.layer.hide, calendar.layer));
    };
    RangeCalendarLayer.prototype.toggle = function () {
        var element = this.getElement();
        if (!element || this.control.helper.isPart(element, 'layer-hidden')) {
            var calendar = this.control;
            paintLayer(calendar, calendar.rawValue);
            this.show();
        } else {
            this.hide();
        }
    };
    function paintLayer(calendar, value) {
        calendar.view.begin = value.begin;
        calendar.view.end = value.end;
        calendar.value = calendar.convertToParam(value);
        paintCal(calendar, 'begin', value.begin);
        paintCal(calendar, 'end', value.end);
        var selectedIndex = getSelectedIndex(calendar, calendar.view);
        paintMiniCal(calendar, selectedIndex);
        var isEndless;
        if (!value.end) {
            isEndless = true;
        } else {
            isEndless = false;
        }
        calendar.setProperties({ isEndless: isEndless });
    }
    function RangeCalendar(options) {
        this.now = new Date();
        InputControl.apply(this, arguments);
        this.layer = new RangeCalendarLayer(this);
    }
    function getLayerHtml(calendar) {
        var tpl = '' + '<div class="${shortCutClass}" id="${shortcutId}">' + '${shortCut}</div>' + '<div class="${bodyClass}">' + '${beginCalendar}${endCalendar}' + '</div>' + '<div class="${footClass}">' + '<div class="${okBtnClass}"' + ' data-ui="type:Button;childName:okBtn;">\u786E\u5B9A</div>' + '<div class="${cancelBtnClass}"' + ' data-ui="type:Button;childName:cancelBtn;">\u53D6\u6D88</div>' + '</div>' + '<div data-ui="type:Button;childName:' + 'closeBtn;skin:layerClose;height:12;"></div>';
        return lib.format(tpl, {
            bodyClass: calendar.helper.getPartClassName('body'),
            shortcutId: calendar.helper.getId('shortcut'),
            shortCutClass: calendar.helper.getPartClassName('shortcut'),
            shortCut: getMiniCalendarHtml(calendar),
            beginCalendar: getCalendarHtml(calendar, 'begin'),
            endCalendar: getCalendarHtml(calendar, 'end'),
            footClass: calendar.helper.getPartClassName('foot'),
            okBtnClass: calendar.helper.getPartClassName('okBtn'),
            cancelBtnClass: calendar.helper.getPartClassName('cancelBtn')
        });
    }
    function startOfDay(day) {
        return m(day).startOf('day').toDate();
    }
    function endOfDay(day) {
        return m(day).endOf('day').toDate();
    }
    function isOutOfRange(calendar, shortItem) {
        var range = calendar.range;
        var itemValue = shortItem.getValue.call(calendar);
        if (startOfDay(range.begin) > startOfDay(range.begin) || endOfDay(itemValue.end) < endOfDay(itemValue.end)) {
            return true;
        }
        return false;
    }
    function getMiniCalendarHtml(calendar) {
        var shownShortCut = calendar.shownShortCut.split(',');
        var shownShortCutHash = {};
        for (var k = 0; k < shownShortCut.length; k++) {
            shownShortCutHash[shownShortCut[k]] = true;
        }
        var tplItem = '' + '<span data-index="${shortIndex}" class="' + calendar.helper.getPartClassName('shortcut-item') + ' ${shortClass}"' + ' id="${shortId}">${shortName}</span>';
        var shortItems = calendar.shortCutItems;
        var len = shortItems.length;
        var html = [];
        for (var i = 0; i < len; i++) {
            var shortItem = shortItems[i];
            if (shownShortCutHash[shortItem.name]) {
                var shortName = shortItem.name;
                var shortClasses = [];
                if (i === 0) {
                    shortClasses = shortClasses.concat(calendar.helper.getPartClasses('shortcut-item-first'));
                }
                var disabled = isOutOfRange(calendar, shortItem);
                if (disabled) {
                    shortClasses = shortClasses.concat(calendar.helper.getPartClasses('shortcut-item-disabled'));
                }
                var shortId = calendar.helper.getId('shortcut-item' + i);
                html.push(lib.format(tplItem, {
                    shortIndex: i,
                    shortClass: shortClasses.join(' '),
                    shortId: shortId,
                    shortName: shortName
                }));
            }
        }
        return html.join('');
    }
    function getCalendarHtml(calendar, type) {
        var endlessCheckDOM = '';
        if (calendar.endlessCheck && type === 'end') {
            endlessCheckDOM = '' + '<input type="checkbox" title="\u4E0D\u9650\u7ED3\u675F" ' + 'data-ui-type="CheckBox" ' + 'data-ui-child-name="endlessCheck" />';
        }
        var tpl = '' + '<div class="${frameClass}">' + '<div class="${labelClass}">' + '<h3>${labelTitle}</h3>' + endlessCheckDOM + '</div>' + '<div class="${calClass}">' + '<div data-ui="type:MonthView;' + 'childName:${calName}"></div>' + '</div>' + '</div>';
        return lib.format(tpl, {
            frameClass: calendar.helper.getPartClassName(type),
            labelClass: calendar.helper.getPartClassName('label'),
            labelTitle: type == 'begin' ? '\u5F00\u59CB\u65E5\u671F' : '\u7ED3\u675F\u65E5\u671F',
            titleId: calendar.helper.getId(type + 'Label'),
            calClass: calendar.helper.getPartClassName(type + '-cal'),
            calName: type + 'Cal'
        });
    }
    function makeCalendarEndless(calendar) {
        var endCalendar = calendar.getChild('endCal');
        var shortCutItems = calendar.helper.getPart('shortcut');
        var selectedIndex;
        if (this.isChecked()) {
            calendar.isEndless = true;
            endCalendar.disable();
            selectedIndex = -1;
            calendar.view.end = null;
            calendar.helper.addPartClasses('shortcut-disabled', shortCutItems);
        } else {
            calendar.isEndless = false;
            endCalendar.enable();
            updateView.apply(calendar, [
                endCalendar,
                'end'
            ]);
            calendar.helper.removePartClasses('shortcut-disabled', shortCutItems);
        }
    }
    function isSameDate(date1, date2) {
        if (!date1 && date2 || date1 && !date2) {
            return false;
        } else if (!date1 && !date2) {
            return true;
        }
        return m(date1).isSame(date2, 'day');
    }
    function getSelectedIndex(calendar, value) {
        var shortcutItems = calendar.shortCutItems;
        var len = shortcutItems.length;
        for (var i = 0; i < len; i++) {
            var item = shortcutItems[i];
            var itemValue = item.getValue.call(calendar);
            if (isSameDate(value.begin, itemValue.begin) && isSameDate(value.end, itemValue.end)) {
                return i;
            }
        }
        return -1;
    }
    function selectIndex(calendar, index) {
        var me = calendar;
        var shortcutItems = calendar.shortCutItems;
        if (index < 0 || index >= shortcutItems.length) {
            return;
        }
        var value = shortcutItems[index].getValue.call(me);
        var begin = value.begin;
        var end = value.end;
        calendar.view = {
            begin: begin,
            end: end
        };
        paintCal(calendar, 'begin', begin);
        paintCal(calendar, 'end', end);
        paintMiniCal(me, index);
    }
    function paintMiniCal(calendar, index) {
        var shortcutItems = calendar.shortCutItems;
        var miniMode = calendar.miniMode;
        if (miniMode !== null && miniMode !== index) {
            calendar.helper.removePartClasses('shortcut-item-selected', calendar.helper.getPart('shortcut-item' + miniMode));
        }
        calendar.miniMode = index;
        if (index >= 0) {
            calendar.helper.addPartClasses('shortcut-item-selected', calendar.helper.getPart('shortcut-item' + index));
            calendar.curMiniName = shortcutItems[index].name;
        } else {
            calendar.curMiniName = null;
        }
    }
    function paintCal(calendar, type, value, bindEvent) {
        var monthView = calendar.getChild(type + 'Cal');
        if (!monthView) {
            return;
        }
        monthView.setProperties({
            rawValue: value,
            range: calendar.range
        });
        if (bindEvent === true) {
            monthView.on('change', u.bind(updateView, calendar, monthView, type));
        }
    }
    function shortcutClick(e) {
        if (this.isEndless) {
            return;
        }
        var tar = e.target || e.srcElement;
        var classes = this.helper.getPartClasses('shortcut-item');
        var disableClasses = this.helper.getPartClasses('shortcut-item-disabled');
        while (tar && tar != document.body) {
            if (lib.hasClass(tar, classes[0]) && !lib.hasClass(tar, disableClasses[0])) {
                var index = tar.getAttribute('data-index');
                selectIndex(this, index);
                return;
            }
            tar = tar.parentNode;
        }
    }
    function updateView(monthView, type) {
        var date = monthView.getRawValue();
        if (!date) {
            return;
        }
        this.view[type] = date;
        var selectedIndex = getSelectedIndex(this, this.view);
        paintMiniCal(this, selectedIndex);
    }
    function commitValue(calendar) {
        var me = calendar;
        var view = calendar.view;
        var begin = view.begin;
        var end = view.end;
        if (calendar.isEndless) {
            end = null;
        }
        var dvalue = end - begin;
        if (!end) {
            dvalue = begin;
        }
        var value;
        if (dvalue > 0) {
            value = {
                'begin': begin,
                'end': end
            };
        } else if (end !== null) {
            value = {
                'begin': end,
                'end': begin
            };
        }
        var event = me.fire('beforechange', { value: value });
        if (event.isDefaultPrevented()) {
            return false;
        }
        me.rawValue = value;
        me.value = me.convertToParam(value);
        updateMain(me, value);
        me.layer.hide();
        me.fire('change', value);
    }
    function updateMain(calendar, range) {
        var text = calendar.helper.getPart('text');
        text.innerHTML = getValueText(calendar, range);
    }
    RangeCalendar.prototype.convertToParam = function (rawValue) {
        var beginTime = rawValue.begin;
        var endTime = rawValue.end;
        var timeResult = [];
        timeResult.push(m(beginTime).format('YYYY-MM-DD'));
        if (endTime) {
            timeResult.push(m(endTime).format('YYYY-MM-DD'));
        }
        return timeResult.join(',');
    };
    RangeCalendar.prototype.convertToRaw = function (value) {
        var strDates = value.split(',');
        if (strDates.length === 1) {
            strDates.push('2046-11-04');
        } else if (strDates[0] === '') {
            strDates[0] = '1983-09-03';
        } else if (strDates[1] === '') {
            strDates[1] = '2046-11-04';
        }
        return {
            begin: m(strDates[0], 'YYYY-MM-DD').toDate(),
            end: m(strDates[1], 'YYYY-MM-DD').toDate()
        };
    };
    function getValueText(calendar, rawValue) {
        var dateText = getDateValueText(calendar, rawValue);
        if (calendar.isEndless && dateText) {
            return dateText;
        }
        var shortcut = '';
        if (!calendar.curMiniName && calendar.miniMode !== null && calendar.miniMode >= 0 && calendar.miniMode < calendar.shortCutItems.length) {
            calendar.curMiniName = calendar.shortCutItems[calendar.miniMode].name;
        }
        if (calendar.curMiniName) {
            shortcut = calendar.curMiniName + '&nbsp;&nbsp;';
        }
        if (dateText) {
            return shortcut + dateText;
        }
        return '';
    }
    function getDateValueText(calendar, rawValue) {
        rawValue = rawValue || calendar.getRawValue();
        var begin = rawValue.begin;
        var end = rawValue.end;
        var pattern = calendar.dateFormat;
        if (begin && end) {
            return m(begin).format(pattern) + ' \u81F3 ' + m(end).format(pattern);
        } else if (!end) {
            return m(begin).format(pattern) + ' \u8D77 ';
        }
        return '';
    }
    RangeCalendar.defaultProperties = {
        dateFormat: 'YYYY-MM-DD',
        endlessCheck: false,
        shortCutItems: [
            {
                name: '\u6628\u5929',
                value: 0,
                getValue: function () {
                    var yesterday = new Date(this.now.getTime());
                    yesterday.setDate(yesterday.getDate() - 1);
                    return {
                        begin: yesterday,
                        end: yesterday
                    };
                }
            },
            {
                name: '\u6700\u8FD17\u5929',
                value: 1,
                getValue: function () {
                    var mDate = m(this.now);
                    return {
                        begin: mDate.clone().subtract('day', 7).toDate(),
                        end: mDate.clone().subtract('day', 1).toDate()
                    };
                }
            },
            {
                name: '\u4E0A\u5468',
                value: 2,
                getValue: function () {
                    var now = this.now;
                    var begin = new Date(now.getTime());
                    var end = new Date(now.getTime());
                    var startOfWeek = 1;
                    if (begin.getDay() < startOfWeek % 7) {
                        begin.setDate(begin.getDate() - 14 + startOfWeek - begin.getDay());
                    } else {
                        begin.setDate(begin.getDate() - 7 - begin.getDay() + startOfWeek % 7);
                    }
                    begin.setHours(0, 0, 0, 0);
                    end.setFullYear(begin.getFullYear(), begin.getMonth(), begin.getDate() + 6);
                    end.setHours(0, 0, 0, 0);
                    return {
                        begin: begin,
                        end: end
                    };
                }
            },
            {
                name: '\u672C\u6708',
                value: 3,
                getValue: function () {
                    return {
                        begin: m(this.now).startOf('month').toDate(),
                        end: m(this.now).toDate()
                    };
                }
            },
            {
                name: '\u4E0A\u4E2A\u6708',
                value: 4,
                getValue: function () {
                    var begin = m(this.now).subtract('month', 1).startOf('month').toDate();
                    var end = m(this.now).startOf('month').subtract('day', 1).toDate();
                    return {
                        begin: begin,
                        end: end
                    };
                }
            },
            {
                name: '\u4E0A\u4E2A\u5B63\u5EA6',
                value: 5,
                getValue: function () {
                    var now = this.now;
                    var begin = m(now).subtract('month', now.getMonth() % 3 + 3).startOf('month').toDate();
                    var end = m(now).subtract('month', now.getMonth() % 3).startOf('month').subtract('day', 1).toDate();
                    return {
                        begin: begin,
                        end: end
                    };
                }
            }
        ]
    };
    RangeCalendar.prototype.type = 'RangeCalendar';
    RangeCalendar.prototype.initOptions = function (options) {
        var now = this.now;
        var defaultRaw = {
                begin: now,
                end: now
            };
        var properties = {
                range: {
                    begin: new Date(1983, 8, 3),
                    end: new Date(2046, 10, 4)
                },
                rawValue: defaultRaw,
                view: u.clone(defaultRaw),
                value: this.convertToParam(defaultRaw),
                shownShortCut: '\u6628\u5929,\u6700\u8FD17\u5929,\u4E0A\u5468,\u672C\u6708,\u4E0A\u4E2A\u6708,\u4E0A\u4E2A\u5B63\u5EA6'
            };
        lib.extend(properties, RangeCalendar.defaultProperties);
        helper.extractValueFromInput(this, options);
        if (options.value) {
            options.rawValue = this.convertToRaw(options.value);
            options.view = {
                begin: options.rawValue.begin,
                end: options.rawValue.end
            };
            options.miniMode = null;
        } else if (options.rawValue) {
            options.miniMode = null;
        } else if (!options.rawValue && options.miniMode != null) {
            var shortcutItem = properties.shortCutItems[options.miniMode];
            if (shortcutItem) {
                options.rawValue = shortcutItem.getValue.call(this);
                options.miniMode = parseInt(options.miniMode, 10);
            } else {
                options.miniMode = null;
            }
        }
        lib.extend(properties, options);
        if (properties.range && typeof properties.range === 'string') {
            properties.range = this.convertToRaw(properties.range);
        }
        if (properties.endlessCheck === 'false') {
            properties.endlessCheck = false;
        }
        if (properties.endlessCheck) {
            if (properties.isEndless === 'false') {
                properties.isEndless = false;
            }
        } else {
            if (!properties.rawValue.end) {
                properties.endlessCheck = true;
                properties.isEndless = true;
            }
        }
        if (properties.isEndless) {
            properties.endlessCheck = true;
            properties.rawValue.end = null;
            properties.view.end = null;
            properties.view.value = this.convertToParam({
                begin: now,
                end: null
            });
        }
        this.setProperties(properties);
    };
    RangeCalendar.prototype.initStructure = function () {
        if (lib.isInput(this.main)) {
            helper.replaceMain(this);
        }
        var tpl = [
                '<div class="${className}" id="${id}"></div>',
                '<div class="${arrow}"></div>'
            ];
        this.main.innerHTML = lib.format(tpl.join('\n'), {
            className: this.helper.getPartClassName('text'),
            id: helper.getId(this, 'text'),
            arrow: this.helper.getPartClassName('arrow')
        });
    };
    RangeCalendar.prototype.initEvents = function () {
        this.helper.addDOMEvent(this.main, 'mousedown', u.bind(this.layer.toggle, this.layer));
    };
    RangeCalendar.prototype.repaint = helper.createRepaint(InputControl.prototype.repaint, {
        name: [
            'rawValue',
            'range'
        ],
        paint: function (calendar, rawValue, range) {
            if (range) {
                if (typeof range === 'string') {
                    range = calendar.convertToRaw(range);
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
                paintLayer(calendar, rawValue);
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
                calendar.layer.hide();
            }
        }
    }, {
        name: 'isEndless',
        paint: function (calendar, isEndless) {
            if (!calendar.endlessCheck) {
                calendar.isEndless = false;
            } else {
                var endlessCheck = calendar.getChild('endlessCheck');
                if (endlessCheck) {
                    endlessCheck.setChecked(isEndless);
                }
            }
        }
    });
    RangeCalendar.prototype.setRawValue = function (date) {
        this.setProperties({ 'rawValue': date });
    };
    RangeCalendar.prototype.getRawValue = function () {
        return this.rawValue;
    };
    RangeCalendar.prototype.stringifyValue = function (rawValue) {
        return this.convertToParam(rawValue) || '';
    };
    RangeCalendar.prototype.parseValue = function (value) {
        return this.convertToRaw(value);
    };
    RangeCalendar.prototype.dispose = function () {
        if (helper.isInStage(this, 'DISPOSED')) {
            return;
        }
        if (this.layer) {
            this.layer.dispose();
            this.layer = null;
        }
        InputControl.prototype.dispose.apply(this, arguments);
    };
    lib.inherits(RangeCalendar, InputControl);
    ui.register(RangeCalendar);
    return RangeCalendar;
});