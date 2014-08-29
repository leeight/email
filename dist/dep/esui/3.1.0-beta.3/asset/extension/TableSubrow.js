define('esui/extension/TableSubrow', [
    'require',
    '../Extension',
    '../lib',
    '../controlHelper',
    '../main',
    '../Table'
], function (require) {
    var Extension = require('../Extension');
    var lib = require('../lib');
    var helper = require('../controlHelper');
    var main = require('../main');
    var Table = require('../Table');
    function getId(table, name) {
        return helper.getId(table, name);
    }
    function getClass(table, name) {
        return helper.getPartClasses(table, name).join(' ');
    }
    function getAttr(element, key) {
        return lib.getAttribute(element, 'data-' + key);
    }
    function setAttr(element, key, value) {
        lib.setAttribute(element, 'data-' + key, value);
    }
    function hasValue(obj) {
        return !(typeof obj === 'undefined' || obj === null);
    }
    function getSubrowId(table, index) {
        return getId(table, 'subrow') + index;
    }
    function getSubentryId(table, index) {
        return getId(table, 'subentry') + index;
    }
    function getSubrowArgs(table, rowIndex) {
        return { subrow: table.subrow && table.subrow != 'false' };
    }
    function entryOverHandler(element, e) {
        entryOver(this, element);
    }
    function entryOver(table, element) {
        var opened = /subentry-opened/.test(element.className);
        var classBase = 'subentry-hover';
        if (opened) {
            classBase = 'subentry-opened-hover';
        }
        helper.addPartClasses(table, classBase, element);
    }
    function entryOutHandler(element, e) {
        entryOut(this, element);
    }
    function entryOut(table, element) {
        helper.removePartClasses(table, 'subentry-hover', element);
        helper.removePartClasses(table, 'subentry-opened-hover', element);
    }
    function fireSubrow(el, e) {
        var table = this;
        var index = getAttr(el, 'index');
        var datasource = table.datasource;
        var dataLen = datasource instanceof Array && datasource.length;
        if (!dataLen || index >= dataLen) {
            return;
        }
        if (!getAttr(el, 'subrowopened')) {
            var dataItem = datasource[index];
            var eventArgs = {
                    index: index,
                    item: dataItem
                };
            eventArgs = table.fire('subrowopen', eventArgs);
            if (!eventArgs.isDefaultPrevented()) {
                openSubrow(table, index, el);
            }
        } else {
            closeSubrow(table, index, el);
        }
        entryOver(table, el);
    }
    function closeSubrow(table, index, entry) {
        var eventArgs = {
                index: index,
                item: table.datasource[index]
            };
        eventArgs = table.fire('subrowclose', eventArgs);
        if (!eventArgs.isDefaultPrevented()) {
            entryOut(table, entry);
            table.subrowIndex = null;
            helper.removePartClasses(table, 'subentry-opened', entry);
            helper.removePartClasses(table, 'row-unfolded', table.getRow(index));
            setAttr(entry, 'title', table.subEntryOpenTip);
            setAttr(entry, 'subrowopened', '');
            lib.g(getSubrowId(table, index)).style.display = 'none';
            return true;
        }
        return false;
    }
    function openSubrow(table, index, entry) {
        var currentIndex = table.subrowIndex;
        var closeSuccess = 1;
        if (hasValue(currentIndex)) {
            closeSuccess = closeSubrow(table, currentIndex, lib.g(getSubentryId(table, currentIndex)));
        }
        if (!closeSuccess) {
            return;
        }
        helper.addPartClasses(table, 'subentry-opened', entry);
        helper.addPartClasses(table, 'row-unfolded', table.getRow(index));
        setAttr(entry, 'title', table.subEntryCloseTip);
        setAttr(entry, 'subrowopened', '1');
        lib.g(getSubrowId(table, index)).style.display = '';
        table.subrowMutex && (table.subrowIndex = index);
    }
    var tplSubEntry = '<div ' + 'class="${className}" ' + 'id="${id}" ' + 'title="${title}" ' + 'data-index="${index}">' + '</div>';
    var tplSubPanel = '<div ' + 'data-ui="type:Panel;id:${id}" ' + 'data-index="${index}">' + '</div>';
    function getSubEntryHtml(table, data, field, rowIndex, fieldIndex, extraArgs) {
        var subrow = extraArgs.subrow;
        var subentry = subrow && field.subEntry;
        var result = {
                notInText: true,
                width: table.subEntryWidth,
                align: 'right'
            };
        if (subentry) {
            var isSubEntryShown = typeof field.isSubEntryShow === 'function' ? field.isSubEntryShow.call(table, data, rowIndex, fieldIndex) : true;
            if (isSubEntryShown !== false) {
                result.html = lib.format(tplSubEntry, {
                    className: getClass(table, 'subentry'),
                    id: getSubentryId(table, rowIndex),
                    title: table.subEntryOpenTip,
                    index: rowIndex
                });
            }
            result.colClass = getClass(table, 'subentryfield');
        }
        return result;
    }
    function getSubrowHtml(table, index, extraArgs) {
        var dataLen = table.datasource ? table.datasource.length : 0;
        return extraArgs.subrow ? '<div id="' + getSubrowId(table, index) + '" class="' + getClass(table, 'subrow') + ' ' + (dataLen === index + 1 ? getClass(table, 'subrow-last') : '') + '"' + ' style="display:none"></div>' : '';
    }
    function getSubrow(table, index) {
        return lib.g(getSubrowId(table, index));
    }
    function getSubrowContainer(table, index) {
        var subrowWrapper = getSubrow(table, index);
        var subrowPanelId = getId(table, 'subrow-panel-' + index);
        var subrowPanel = table.viewContext.get(subrowPanelId);
        if (!subrowPanel) {
            subrowWrapper.innerHTML = lib.format(tplSubPanel, {
                id: subrowPanelId,
                index: index
            });
            table.initChildren(subrowWrapper);
            subrowPanel = table.viewContext.get(subrowPanelId);
            table.addChild(subrowPanel);
        }
        return subrowPanel;
    }
    function TableSubrow() {
        Extension.apply(this, arguments);
    }
    TableSubrow.prototype.type = 'TableSubrow';
    TableSubrow.prototype.activate = function () {
        var target = this.target;
        if (!(target instanceof Table)) {
            return;
        }
        var getPartClasses = helper.getPartClasses;
        var subentryClass = getPartClasses(target, 'subentry')[0];
        target.addRowBuilders([{
                index: 0,
                getRowArgs: getSubrowArgs,
                getColHtml: getSubEntryHtml,
                getSubrowHtml: getSubrowHtml
            }]);
        target.addHandlers('click', {
            handler: fireSubrow,
            matchFn: subentryClass
        });
        target.addHandlers('mouseover', {
            handler: entryOverHandler,
            matchFn: subentryClass
        });
        target.addHandlers('mouseout', {
            handler: entryOutHandler,
            matchFn: subentryClass
        });
        target.getSubrow = function (index) {
            return getSubrow(this, index);
        };
        target.setSubrowContent = function (content, index) {
            var subrowPanel = getSubrowContainer(this, index);
            if (subrowPanel) {
                subrowPanel.set('content', content);
            }
        };
        target.getSubrowContainer = function (index) {
            return getSubrowContainer(this, index);
        };
        Extension.prototype.activate.apply(this, arguments);
    };
    TableSubrow.prototype.inactivate = function () {
        var target = this.target;
        if (!(target instanceof Table)) {
            return;
        }
        delete target.getSubrow;
        Extension.prototype.inactivate.apply(this, arguments);
    };
    lib.inherits(TableSubrow, Extension);
    main.registerExtension(TableSubrow);
    return TableSubrow;
});