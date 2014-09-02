define('esui/Schedule', [
    'require',
    './lib',
    './InputControl',
    './controlHelper',
    './main'
], function (require) {
    var lib = require('./lib');
    var InputControl = require('./InputControl');
    var helper = require('./controlHelper');
    function Schedule(options) {
        InputControl.apply(this, arguments);
    }
    Schedule.defaultProperties = {
        helpSelectedText: '\u6295\u653E\u65F6\u95F4\u6BB5',
        helpText: '\u6682\u505C\u65F6\u95F4\u6BB5',
        dayTexts: [
            '\u661F\u671F\u4E00',
            '\u661F\u671F\u4E8C',
            '\u661F\u671F\u4E09',
            '\u661F\u671F\u56DB',
            '\u661F\u671F\u4E94',
            '\u661F\u671F\u516D',
            '\u661F\u671F\u65E5'
        ],
        shortcut: shortcut()
    };
    function shortcut() {
        function selectByDayStates(dayStates) {
            var value = [];
            for (var i = 0; i < 7 && i < dayStates.length; i++) {
                value[i] = [];
                for (var j = 0; j < 24; j++) {
                    value[i][j] = dayStates[i];
                }
            }
            return value;
        }
        return [
            {
                text: '\u5168\u5468\u6295\u653E',
                tip: '\u5468\u4E00\u5230\u5468\u65E5\u5168\u5929\u6295\u653E',
                getValue: function () {
                    return selectByDayStates([
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1
                    ]);
                }
            },
            {
                text: '\u5468\u4E00\u5230\u5468\u4E94\u6295\u653E',
                tip: '\u5468\u4E00\u5230\u5468\u4E94\u5168\u5929\u6295\u653E',
                getValue: function () {
                    return selectByDayStates([
                        1,
                        1,
                        1,
                        1,
                        1,
                        0,
                        0
                    ]);
                }
            },
            {
                text: '\u5468\u672B\u6295\u653E',
                tip: '\u5468\u516D\u3001\u5468\u65E5\u5168\u5929\u6295\u653E',
                getValue: function () {
                    return selectByDayStates([
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        1
                    ]);
                }
            }
        ];
    }
    function initValue() {
        var value = [];
        for (var i = 0; i < 7; i++) {
            var lineValue = [];
            value.push(lineValue);
            for (var j = 0; j < 24; j++) {
                lineValue.push(0);
            }
        }
        return value;
    }
    function getClass(schedule, part) {
        return helper.getPartClasses(schedule, part).join(' ');
    }
    function getId(schedule, part) {
        return helper.getId(schedule, part);
    }
    function getShortcutHtml(schedule) {
        var me = schedule;
        var html = [];
        var tpl = '' + '<span class="${clazz}" data-item="${index}"' + ' >${text}</span>';
        var textClass = getClass(me, 'shortcut-text-item');
        html.push('<span class="' + textClass + '">\u5FEB\u901F\u8BBE\u5B9A\uFF1A</span>');
        var shortcuts = me.shortcut;
        var clazz = getClass(me, 'shortcut-item');
        for (var i = 0, len = shortcuts.length; i < len; i++) {
            var shortcut = shortcuts[i];
            html.push(lib.format(tpl, {
                clazz: clazz,
                text: shortcut.text,
                index: i
            }));
        }
        return html.join('');
    }
    function initBody(schedule) {
        lib.g(getId(schedule, 'body')).innerHTML = '' + getBodyTimeHtml(schedule) + getBodyDayHtml(schedule) + getBodyItemHtml(schedule);
    }
    function getBodyTimeHtml(schedule) {
        var me = schedule;
        var html = [];
        var timelineClass = getClass(me, 'time-line');
        var bodyHeadId = getId('body-head');
        html.push('<div class="', timelineClass, '" id="', bodyHeadId + '">');
        var timeHClass = getClass(me, 'time-head');
        for (var i = 0; i <= 24; i = i + 2) {
            html.push('<div class="', timeHClass, '" data-time="', i, '" ', 'id="', getId(me, 'time-head' + i), '">', i + ':00', '</div>');
        }
        html.push('</div>');
        return html.join('');
    }
    function getBodyDayHtml(schedule) {
        var me = schedule;
        var html = [];
        var dayHClass = getClass(me, 'day-head');
        var dayHId = getId(me, 'day-head');
        html.push('<div id="', dayHId, '" class="', dayHClass, '">');
        var dayClass = getClass(me, 'day');
        var dayTpl = '' + '<div class="' + dayClass + '">' + '<input type="checkbox" id="${dayId}" value="${value}">' + '&nbsp;<label for="${dayId}">${dayWord}</label>' + '</div>';
        var dayTexts = me.dayTexts;
        for (var i = 0; i < 7; i++) {
            html.push(lib.format(dayTpl, {
                dayWord: dayTexts[i],
                dayId: getId(me, 'line-state' + i),
                value: i
            }));
        }
        html.push('</div>');
        return html.join('');
    }
    function getBodyItemHtml(schedule) {
        var me = schedule;
        var html = [];
        var timeTpl = '' + '<div class="${timeClass}"' + ' id="${itemId}"' + ' data-day="${dayIndex}"' + ' data-time-item="1"' + ' data-time="${timeIndex}">' + '</div>';
        var timeBClass = getClass(me, 'time-body');
        var timeBId = getId(me, 'time-body');
        html.push('<div id="', timeBId, '" class="', timeBClass, '">');
        var lineClass = getClass(me, 'line');
        for (var i = 0; i < 7; i++) {
            var lineId = getId(me, 'line' + i);
            html.push('<div class="', lineClass, '" id="', lineId, '">');
            for (var j = 0; j < 24; j++) {
                var itemId = getId(me, 'time_' + i + '_' + j);
                html.push(lib.format(timeTpl, {
                    itemId: itemId,
                    timeClass: getClass(me, 'time'),
                    dayIndex: i,
                    timeIndex: j
                }));
            }
            html.push('</div>');
        }
        html.push('</div>');
        return html.join('');
    }
    function repaintView(schedule, value) {
        var me = schedule;
        var selectedClass = helper.getPartClasses(me, 'time-selected');
        var hoverClass = helper.getPartClasses(me, 'time-hover');
        for (var i = 0; i < 7; i++) {
            var statusArr = [];
            var lineEl = lib.g(getId(me, 'line' + i));
            removeSelectedLineCoverTip(schedule, lineEl);
            for (var j = 0; j < 24; j++) {
                var item = lib.g(getId(me, 'time_' + i + '_' + j));
                var val = value[i][j];
                if (val) {
                    lib.addClasses(item, selectedClass);
                } else {
                    lib.removeClasses(item, selectedClass);
                }
                lib.removeClasses(item, hoverClass);
                statusArr.push(val);
            }
            createSelectedLineCoverTip(me, statusArr, lineEl, i);
        }
    }
    function createSelectedLineCoverTip(schedule, arr, parent, index) {
        var me = schedule;
        var i = index;
        var checkInput = lib.g(getId(me, 'line-state' + i));
        checkInput.checked = false;
        var patt = /1{3,}/g;
        var statusStr = arr.join('');
        var result;
        var coverClass = getClass(me, 'continue-covertimes');
        var coverTpl = '' + '<div class="${coverClass}">' + '<strong>${text}</strong>' + '</div>';
        while ((result = patt.exec(statusStr)) != null) {
            var length = result[0].length;
            var start = result.index;
            var end = start + length;
            var coverDiv = document.createElement('aside');
            var cssStyle = ';width:' + length * 25 + 'px;top:0;left:' + start * 25 + 'px;';
            checkInput.checked = length == 24 ? true : false;
            coverDiv.setAttribute('data-start-time', start);
            coverDiv.setAttribute('data-end-time', end);
            coverDiv.setAttribute('data-day', i);
            coverDiv.className = coverClass;
            coverDiv.style.cssText += cssStyle;
            coverDiv.innerHTML = lib.format(coverTpl, {
                start: start,
                end: end,
                text: length == 24 ? '\u5168\u5929\u6295\u653E' : start + '.00-' + end + '.00',
                coverClass: getClass(me, 'covertimes-tip')
            });
            parent.appendChild(coverDiv);
            helper.addDOMEvent(me, coverDiv, 'mouseover', lib.curry(coverTipOverHandler, coverDiv));
        }
    }
    function coverTipOverHandler(element) {
        element.style.display = 'none';
    }
    function removeSelectedLineCoverTip(schedule, parent) {
        var removeDiv = parent.getElementsByTagName('aside');
        var len = removeDiv.length;
        while (len) {
            var item = removeDiv[0];
            if (item.getAttribute('data-day') != null) {
                helper.clearDOMEvents(schedule, item);
                parent.removeChild(item);
            }
            len--;
        }
    }
    function showPromptTip(schedule, tipId, mousepos, tipText) {
        var me = schedule;
        tipId = tipId || getId(me, 'tip');
        var tipElement = lib.g(tipId);
        if (tipElement) {
            tipElement.style.top = mousepos.y + 'px';
            tipElement.style.left = mousepos.x + 'px';
            tipElement.innerHTML = tipText;
        } else {
            var cssStyle = '' + ';position:absolute;z-index:50;background:#fff6bd;top:' + mousepos.y + 'px;left:' + mousepos.x + 'px;display:none;';
            var tipClass = getClass(me, 'shortcut-item-tip');
            tipElement = document.createElement('div');
            tipElement.style.cssText = cssStyle;
            tipElement.id = tipId;
            tipElement.className = tipClass;
            tipElement.innerHTML = tipText;
            document.body.appendChild(tipElement);
            me.followTip[tipId] = tipElement;
        }
        me.tipElementTime = setTimeout(function () {
            tipElement.style.display = 'block';
        }, 100);
        return tipElement;
    }
    function hidePromptTip(schedule, tipId) {
        clearTimeout(schedule.tipElementTime);
        var tip = lib.g(tipId);
        tip && (tip.style.display = 'none');
    }
    function dayClickHandler(e) {
        var target = lib.event.getTarget(e);
        if (target.nodeName.toLowerCase() != 'input') {
            return;
        }
        var me = this;
        var dom = target;
        var dayIndex = parseInt(dom.value, 10);
        var dayState = dom.checked;
        var rawValueCopy = rawValueClone(me.rawValue);
        var timeValue = rawValueCopy[dayIndex];
        for (var i = 0, len = timeValue.length; i < len; i++) {
            timeValue[i] = dayState ? 1 : 0;
        }
        me.setRawValue(rawValueCopy);
    }
    function shortcutClickHandler(e) {
        var target = lib.event.getTarget(e);
        if (!target || !lib.hasAttribute(target, 'data-item')) {
            return;
        }
        var index = target.getAttribute('data-item');
        var func = this.shortcut[index].getValue;
        typeof func == 'function' && func.call(this);
        var rawValue;
        if (typeof func == 'function') {
            rawValue = func.call(this);
        } else {
            rawValue = func;
        }
        this.setRawValue(rawValue);
    }
    function shortcutMoveHandler(e) {
        var target = lib.event.getTarget(e);
        if (!target || !target.getAttribute('data-item')) {
            return;
        }
        var element = target;
        var me = this;
        lib.event.getMousePosition(e);
        var mousepos = {};
        mousepos.y = e.pageY + 20;
        mousepos.x = e.pageX + 10;
        var dom = element;
        var index = dom.getAttribute('data-item');
        var tipId = getId(me, 'shortcut-item') + index;
        setTimeout(function () {
            var tipElement = lib.g(tipId);
            if (tipElement) {
                tipElement.style.top = mousepos.y + 'px';
                tipElement.style.left = mousepos.x + 'px';
            }
        }, 0);
    }
    function shortcutOverOutHandler(isOver, e) {
        var target = lib.event.getTarget(e);
        if (!target || !target.getAttribute('data-item')) {
            return;
        }
        var element = target;
        lib.event.getMousePosition(e);
        var mousepos = {};
        mousepos.y = e.pageY + 20;
        mousepos.x = e.pageX + 10;
        var me = this;
        var dom = element;
        var index = dom.getAttribute('data-item');
        var tipId = getId(me, 'shortcut-item') + index;
        var clazz = helper.getPartClasses(me, 'shortcut-item-hover');
        if (isOver) {
            lib.addClasses(dom, clazz);
            var tipText = me.shortcut[index].tip;
            showPromptTip(me, tipId, mousepos, tipText);
        } else {
            lib.removeClasses(dom, clazz);
            hidePromptTip(me, tipId);
        }
    }
    var timeTipTpl = '' + '<div id="${timeId}" class="${timeClass}">${time}</div>' + '<div id="${textId}" class="${textClass}">${text}</div>';
    function timeOverHandler(e) {
        var target = lib.event.getTarget(e);
        if (!target || !target.getAttribute('data-time-item')) {
            return;
        }
        var element = target;
        lib.addClasses(element, helper.getPartClasses(this, 'time-hover'));
        lib.event.getMousePosition(e);
        var mousepos = {};
        mousepos.y = e.pageY + 20;
        mousepos.x = e.pageX + 10;
        var me = this;
        var time = parseInt(element.getAttribute('data-time'), 10);
        var day = parseInt(element.getAttribute('data-day'), 10);
        var tipText = lib.format(timeTipTpl, {
                time: '<strong>' + time + ':00</strong>&nbsp;\u2014&nbsp;<strong>' + (time + 1) + ':00</strong>',
                text: '\u70B9\u51FB/\u62D6\u52A8\u9F20\u6807\u9009\u62E9',
                timeId: getId(me, 'timeitem-tip-head'),
                textId: getId(me, 'timeitem-tip-body'),
                timeClass: getClass(me, 'timeitem-tip-head'),
                textClass: getClass(me, 'timeitem-tip-body')
            });
        var tipId = getId(me, 'timeitem-tip');
        showPromptTip(me, tipId, mousepos, tipText);
        var timebody = lib.g(getId(me, 'time-body'));
        var timeCovers = timebody.getElementsByTagName('aside');
        for (var i = 0, len = timeCovers.length; i < len; i++) {
            var item = timeCovers[i];
            var startCT = parseInt(item.getAttribute('data-start-time'), 10);
            var endCT = parseInt(item.getAttribute('data-end-time'), 10);
            var CoverDay = parseInt(item.getAttribute('data-day'), 10);
            if (time >= startCT && time < endCT && day == CoverDay) {
                item.style.display = 'none';
            } else {
                item.style.display = 'block';
            }
        }
    }
    function timeOutHandler(e) {
        var target = lib.event.getTarget(e);
        if (!target || !target.getAttribute('data-time-item')) {
            return;
        }
        lib.removeClasses(target, helper.getPartClasses(this, 'time-hover'));
        hidePromptTip(this, getId(this, 'timeitem-tip'));
    }
    var getTimeBodyMoveHandler;
    var getTimeBodyUpHandler;
    function timeBodyDownHandler(e) {
        var me = this;
        var doc = document;
        getTimeBodyMoveHandler = lib.bind(timeBodyMoveHandler, me);
        getTimeBodyUpHandler = lib.bind(timeBodyUpHandler, me);
        lib.on(doc, 'mousemove', getTimeBodyMoveHandler);
        lib.on(doc, 'mouseup', getTimeBodyUpHandler);
        lib.event.getMousePosition(e);
        this.dragStartPos = {
            x: e.pageX,
            y: e.pageY
        };
        var timebody = lib.g(getId(me, 'time-body'));
        me.dragRange = [];
        var timebodyTop = lib.getOffset(timebody).top;
        var timebodyLeft = lib.getOffset(timebody).left;
        me.dragRange.push(timebodyTop);
        me.dragRange.push(timebodyLeft + timebody.offsetWidth);
        me.dragRange.push(timebodyTop + timebody.offsetHeight);
        me.dragRange.push(timebodyLeft);
        ondragHuck(timebody);
        var cellPos = getTragTimeCellPos(this, {
                x: e.pageX,
                y: e.pageY
            });
        var tipId = getId(me, 'timeitem-tip');
        lib.g(tipId) && (lib.g(tipId).style.display = 'none');
        repaintFollowEle(this, cellPos);
    }
    function timeBodyMoveHandler(e) {
        lib.event.getMousePosition(e);
        var cellPos = getTragTimeCellPos(this, {
                x: e.pageX,
                y: e.pageY
            });
        repaintFollowEle(this, cellPos);
    }
    function timeBodyUpHandler(e) {
        var me = this;
        offDragHuck(lib.g(getId(me, 'time-body')));
        var followEle = lib.g(getId(me, 'follow-item'));
        followEle.style.display = 'none';
        lib.event.getMousePosition(e);
        var cellPos = getTragTimeCellPos(me, {
                x: e.pageX,
                y: e.pageY
            });
        setTimeout(function () {
            setSelectedAreaValue(me, cellPos);
        }, 10);
        var doc = document;
        lib.un(doc, 'mousemove', getTimeBodyMoveHandler);
        lib.un(doc, 'mouseup', getTimeBodyUpHandler);
    }
    function setSelectedAreaValue(schedule, cellPos) {
        var me = schedule;
        var startcell = cellPos.startcell;
        var endcell = cellPos.endcell;
        var minXCell = Math.min(startcell.x, endcell.x);
        var minYCell = Math.min(startcell.y, endcell.y);
        var maxXCell = Math.max(startcell.x, endcell.x);
        var maxYCell = Math.max(startcell.y, endcell.y);
        var rawValueCopy = rawValueClone(me.rawValue);
        for (var i = minYCell; i <= maxYCell; i++) {
            for (var j = minXCell; j <= maxXCell; j++) {
                if (rawValueCopy[i][j]) {
                    rawValueCopy[i][j] = 0;
                } else {
                    rawValueCopy[i][j] = 1;
                }
            }
        }
        me.setRawValue(rawValueCopy);
    }
    function getTragTimeCellPos(schedule, mousepos) {
        var me = schedule;
        var timeBodyPos = me.dragRange;
        var dragStartPos = me.dragStartPos;
        var rangePos = {};
        if (mousepos.x <= timeBodyPos[1] && mousepos.x >= timeBodyPos[3]) {
            rangePos.x = mousepos.x;
        } else {
            rangePos.x = mousepos.x - dragStartPos.x < 0 ? timeBodyPos[3] : timeBodyPos[1];
        }
        if (mousepos.y <= timeBodyPos[2] && mousepos.y >= timeBodyPos[0]) {
            rangePos.y = mousepos.y;
        } else {
            rangePos.y = mousepos.y - dragStartPos.y < 0 ? timeBodyPos[0] : timeBodyPos[2];
        }
        var cellrange = {
                startcell: {},
                endcell: {}
            };
        cellrange.startcell.x = Math.floor((dragStartPos.x - me.dragRange[3]) / 25);
        cellrange.startcell.y = Math.floor((dragStartPos.y - me.dragRange[0]) / 25);
        cellrange.endcell.x = Math.floor((rangePos.x - me.dragRange[3]) / 25);
        cellrange.endcell.y = Math.floor((rangePos.y - me.dragRange[0]) / 25);
        if (cellrange.endcell.x >= 23) {
            cellrange.endcell.x = 23;
        }
        if (cellrange.endcell.y >= 6) {
            cellrange.endcell.y = 6;
        }
        return cellrange;
    }
    function repaintFollowEle(schedule, cellPos) {
        var me = schedule;
        var followEleId = getId(schedule, 'follow-item');
        var followEle = lib.g(followEleId);
        if (!followEle) {
            followEle = document.createElement('div');
            followEle.className = getClass(me, 'follow-item');
            followEle.id = followEleId;
            lib.g(getId(me, 'time-body')).appendChild(followEle);
        }
        var startcell = cellPos.startcell;
        var endcell = cellPos.endcell;
        var startcellX = startcell.x;
        var startcellY = startcell.y;
        var endcellX = endcell.x;
        var endcellY = endcell.y;
        var divTop;
        var divLeft;
        var divHeight;
        var divWidth;
        if (endcellY >= startcellY) {
            divTop = startcellY * 25;
            divHeight = (endcellY - startcellY + 1) * 25 - 2;
        } else {
            divTop = endcellY * 25;
            divHeight = (startcellY - endcellY + 1) * 25 - 2;
        }
        if (endcellX >= startcellX) {
            divLeft = startcellX * 25;
            divWidth = (endcellX - startcellX + 1) * 25 - 2;
        } else {
            divLeft = endcellX * 25;
            divWidth = (startcellX - endcellX + 1) * 25 - 2;
        }
        var cssStyles = '' + ';display:block;' + ';width:' + divWidth + 'px' + ';height:' + divHeight + 'px' + ';top:' + divTop + 'px' + ';left:' + divLeft + 'px' + ';background:#faffbe';
        followEle.style.cssText += cssStyles;
    }
    function ondragHuck(target) {
        var doc = document;
        lib.on(doc, 'selectstart', dragUnSelect);
        if (target.setCapture) {
            target.setCapture();
        } else if (window.captureEvents) {
            window.captureEvents(window.Event.MOUSEMOVE | window.Event.MOUSEUP);
        }
        if (document.selection) {
            document.selection.empty && document.selection.empty();
        } else if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
    }
    function offDragHuck(target) {
        var doc = document;
        if (target.releaseCapture) {
            target.releaseCapture();
        } else if (window.releaseEvents) {
            window.releaseEvents(window.Event.MOUSEMOVE | window.Event.MOUSEUP);
        }
        lib.un(doc, 'selectstart', dragUnSelect);
    }
    function dragUnSelect(e) {
        lib.event.preventDefault(e);
    }
    function rawValueClone(rawValue) {
        var val = [];
        for (var i = 0, len = rawValue.length; i < len; i++) {
            val.push([].slice.call(rawValue[i], 0));
        }
        return val;
    }
    function setDayCheckboxState(schedule, state, value) {
        var dayHead = lib.g(getId(schedule, 'day-head'));
        var inputs = dayHead.getElementsByTagName('input');
        for (var i = 0, len = inputs.length; i < len; i++) {
            inputs[i][state] = value;
        }
    }
    function dealValueByCoord(schedule, isSelect, coord) {
        var rawValueCopy = rawValueClone(schedule.rawValue);
        for (var i = 0, len = coord.length; i < len; i++) {
            var item = coord[i];
            if (rawValueCopy[item[0]] != null && rawValueCopy[item[0]][item[1]] != null) {
                rawValueCopy[item[0]][item[1]] = isSelect ? 1 : 0;
            }
        }
        schedule.setRawValue(rawValueCopy);
    }
    Schedule.prototype = {
        constructor: Schedule,
        type: 'Schedule',
        createMain: function (options) {
            if (!options.tagName) {
                return InputControl.prototype.createMain.call(this);
            }
            return document.createElement(options.tagName);
        },
        initOptions: function (options) {
            var properties = {};
            lib.extend(properties, Schedule.defaultProperties, options);
            this.setProperties(properties);
            if (this.rawValue == null) {
                this.setRawValue(initValue());
            }
            this.followTip = {};
        },
        initStructure: function () {
            var me = this;
            this.main.tabIndex = 0;
            var tpl = '' + '<input type="hidden" name="${name}" id="${inputId}"/>' + '<div class="${bodyClass}" id="${bodyId}"></div>' + '<div class="${headClass}">' + '<div class="${helpClass}">' + '<div class="${helpSelectedClass}"></div>' + '<div class="${helpTextClass}">' + '${helpSelected}' + '</div>' + '<div class="${helpUnselectedClass}"></div>' + '<div class="${helpTextClass}">${help}</div>' + '</div>' + '<div class="${shortcutClass}" id="${shortcutId}">' + '${shortcutHtml}' + '</div>' + '</div>';
            this.main.innerHTML = lib.format(tpl, {
                name: this.name,
                inputId: getId(me, 'value-input'),
                headClass: getClass(me, 'head'),
                bodyClass: getClass(me, 'body'),
                helpClass: getClass(me, 'help'),
                helpSelectedClass: getClass(me, 'help-selected'),
                helpUnselectedClass: getClass(me, 'help-unselected'),
                helpTextClass: getClass(me, 'help-text'),
                shortcutClass: getClass(me, 'shortcut'),
                shortcutId: getId(me, 'shortcut'),
                bodyId: getId(me, 'body'),
                helpSelected: me.helpSelectedText,
                help: me.helpText,
                shortcutHtml: getShortcutHtml(me)
            });
            initBody(me);
        },
        initEvents: function () {
            var timebody = lib.g(getId(this, 'time-body'));
            this.helper.addDOMEvent(timebody, 'mousedown', timeBodyDownHandler);
            this.helper.addDOMEvent(timebody, 'mouseover', timeOverHandler);
            this.helper.addDOMEvent(timebody, 'mouseout', timeOutHandler);
            this.helper.addDOMEvent(lib.g(getId(this, 'day-head')), 'click', dayClickHandler);
            var shortcut = this.helper.getPart('shortcut');
            this.helper.addDOMEvent(shortcut, 'click', shortcutClickHandler);
            this.helper.addDOMEvent(shortcut, 'mouseover', lib.curry(shortcutOverOutHandler, true));
            this.helper.addDOMEvent(shortcut, 'mouseout', lib.curry(shortcutOverOutHandler, false));
            this.helper.addDOMEvent(shortcut, 'mousemove', shortcutMoveHandler);
        },
        setProperties: function (properties) {
            var changes = InputControl.prototype.setProperties.call(this, properties);
            var rawValueObj = changes.rawValue;
            if (rawValueObj && this.stringifyValue(rawValueObj.oldValue) !== this.stringifyValue(rawValueObj.newValue)) {
                this.fire('change', { rawValue: this.rawValue });
            }
        },
        repaint: helper.createRepaint(InputControl.prototype.repaint, {
            name: 'rawValue',
            paint: function (schedule, rawValue) {
                var value = schedule.stringifyValue(rawValue);
                lib.g(getId(schedule, 'value-input')).value = value == null ? '' : value;
                repaintView(schedule, rawValue);
            }
        }, {
            name: 'disabled',
            paint: function (schedule, value) {
                setDayCheckboxState(schedule, 'disabled', value);
            }
        }, {
            name: 'readonly',
            paint: function (schedule, value) {
                setDayCheckboxState(schedule, 'readonly', value);
            }
        }),
        parseValue: function (value) {
            var arr = [];
            var step = 24;
            for (var i = 0, len = value.length; i < len; i = i + step) {
                var inner = value.substring(i, i + step).split('');
                var innerOut = [];
                for (var j = 0; j < inner.length; j++) {
                    innerOut.push(inner[j] - 0);
                }
                arr.push(innerOut);
            }
            return arr;
        },
        stringifyValue: function (rawValue) {
            var arr = [];
            if (!rawValue) {
                return null;
            }
            for (var i = 0, len = rawValue.length; i < len; i++) {
                arr.push(rawValue[i].join(''));
            }
            return arr.join('');
        },
        setRawValue: function (rawValue) {
            this.setProperties({ rawValue: rawValue });
        },
        getRawValue: function () {
            return this.rawValue;
        },
        select: function (coord) {
            dealValueByCoord(this, 1, [].slice.call(arguments));
        },
        unselect: function (coord) {
            dealValueByCoord(this, 0, [].slice.call(arguments));
        },
        dispose: function () {
            helper.beforeDispose(this);
            var followTip = this.followTip;
            for (var key in followTip) {
                if (followTip[key]) {
                    document.body.removeChild(followTip[key]);
                }
            }
            helper.dispose(this);
            helper.afterDispose(this);
        }
    };
    lib.inherits(Schedule, InputControl);
    require('./main').register(Schedule);
    return Schedule;
});