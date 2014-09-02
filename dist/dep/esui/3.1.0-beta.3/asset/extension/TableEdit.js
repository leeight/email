define('esui/extension/TableEdit', [
    'require',
    '../validator/MaxLengthRule',
    '../validator/MaxRule',
    '../validator/MinRule',
    '../validator/RequiredRule',
    '../validator/PatternRule',
    '../Extension',
    '../lib',
    '../controlHelper',
    '../main',
    '../Table',
    '../validator/ValidityState',
    '../validator/Validity'
], function (require) {
    require('../validator/MaxLengthRule');
    require('../validator/MaxRule');
    require('../validator/MinRule');
    require('../validator/RequiredRule');
    require('../validator/PatternRule');
    var Extension = require('../Extension');
    var lib = require('../lib');
    var helper = require('../controlHelper');
    var main = require('../main');
    var Table = require('../Table');
    var ValidityState = require('../validator/ValidityState');
    var Validity = require('../validator/Validity');
    var layContentTpl = [
            '<div class="${optClass}">',
            '<div id="${inputFieldId}"></div>',
            '<div data-ui="id:${okId};type:Button;">${okText}</div>',
            '<div data-ui="id:${cancelId};type:Button;">',
            '${cancelText}',
            '</div>',
            '</div>',
            '<div class="${errorClass}" id="${errorId}"></div>'
        ].join('');
    var inputFieldId = 'ctrl-table-editor-inputField';
    var inputId = 'ctrl-table-editorInput';
    var validId = 'ctrl-table-editor-validityLabel';
    var okId = 'ctrl-table-editor-ok';
    var cancelId = 'ctrl-table-editor-cancel';
    var errorId = 'ctrl-table-editor-error';
    var okText = '\u786E\u5B9A';
    var cancelText = '\u53D6\u6D88';
    var inputTpl = '<input data-ui="type:TextBox;id:${inputId}"/>';
    var validTpl = '<label data-ui="type:Validity;id:${validId}"></label>';
    var currentRowIndex = -1;
    var currentColIndex = -1;
    var currentState = 0;
    var layer = null;
    var inputCtrl = null;
    var okButton = null;
    var cancelButton = null;
    var currentTable = null;
    var currentField = null;
    var guid = 1;
    function init(table, options) {
        currentTable = table;
        currentRowIndex = options.rowIndex;
        currentColIndex = options.columnIndex;
        if (!layer) {
            layer = helper.layer.create();
            document.body.appendChild(layer);
            layer.className = table.helper.getPartClassName('editor');
            initLayer();
        }
        layer.style.zIndex = table.zIndex || '';
        initInputControl(options);
    }
    function initLayer() {
        fillLayer();
        initButtonControl();
    }
    function initButtonControl() {
        var controlMap = main.init(layer);
        okButton = getControlFromMap(controlMap, okId);
        cancelButton = getControlFromMap(controlMap, cancelId);
        okButton.on('click', getOkHandler());
        cancelButton.on('click', getCancelHandler());
        setButtonDisabled(1);
    }
    function initInputControl(options) {
        if (options.field && currentField !== options.field) {
            inputCtrl && inputCtrl.dispose();
            inputCtrl = null;
            var newInputId = inputId + guid++;
            var newValidId = validId + guid;
            var inputField = lib.g(inputFieldId);
            var errorField = lib.g(errorId);
            inputField.innerHTML = lib.format(inputTpl, { inputId: newInputId });
            errorField.innerHTML = lib.format(validTpl, { validId: newValidId });
            var inputCtrlOptions = { properties: {} };
            inputCtrlOptions.properties[newInputId] = lib.extend({
                id: newInputId,
                width: 145,
                height: 20,
                validityLabel: validId + guid
            }, options.field.editRules);
            inputCtrl = main.init(inputField, inputCtrlOptions)[0];
            main.init(errorField);
            inputCtrl.on('enter', getOkHandler());
            currentField = options.field;
        }
    }
    function disposeEditorControl(table) {
        if (table == currentTable) {
            hideLayer();
            inputCtrl.dispose();
            okButton.dispose();
            cancelButton.dispose();
            try {
                layer && document.body.removeChild(layer);
            } catch (ex) {
            }
            layer = null;
            inputCtrl = null;
            okButton = null;
            cancelButton = null;
            currentTable = null;
            currentField = null;
        }
    }
    function fillLayer() {
        layer.innerHTML = lib.format(layContentTpl, {
            inputFieldId: inputFieldId,
            okId: okId,
            cancelId: cancelId,
            okText: okText,
            cancelText: cancelText,
            optClass: currentTable.helper.getPartClassName('editor-opt'),
            errorClass: currentTable.helper.getPartClassName('editor-error'),
            errorId: errorId
        });
    }
    function getControlFromMap(controlMap, id) {
        for (var i = controlMap.length - 1; i >= 0; i--) {
            var control = controlMap[i];
            if (control.id === id) {
                return control;
            }
        }
    }
    function hideLayer(argument) {
        layer && (layer.style.display = 'none');
    }
    function showLayer(argument) {
        layer && (layer.style.display = '');
    }
    function showErrorMsg(error) {
        if (error) {
            var validity = new Validity();
            validity.addState('TableEditCustomRule', new ValidityState(false, error));
            inputCtrl.showValidity(validity);
        }
    }
    function clearErrorMsg(error) {
        var validity = new Validity();
        validity.addState('TableEditCustomRule', new ValidityState(true));
        inputCtrl.showValidity(validity);
    }
    function getOkHandler() {
        return function () {
            saveEdit();
        };
    }
    function saveEdit() {
        if (inputCtrl.validate()) {
            var eventArgs = {
                    value: getValue(),
                    rowIndex: currentRowIndex,
                    columnIndex: currentColIndex,
                    field: currentTable.realFields[currentColIndex]
                };
            eventArgs = currentTable.fire('saveedit', eventArgs);
            fieldHanlder(currentTable, 'saveedit', eventArgs);
            if (!eventArgs.isDefaultPrevented()) {
                saveSuccessHandler.call(currentTable, eventArgs);
            } else {
                saveFailedHandler.call(currentTable, eventArgs);
            }
        }
    }
    function saveSuccessHandler(eventArgs) {
        if (this === currentTable) {
            hideLayer();
            currentState = 0;
        }
    }
    function saveFailedHandler(eventArgs) {
        if (this === currentTable && eventArgs.errorMsg) {
            showErrorMsg(eventArgs.errorMsg);
        }
    }
    function getCancelHandler() {
        return function () {
            stop();
        };
    }
    function tableEndDragHandler() {
        if (this == currentTable) {
            layerFollow(this);
        }
    }
    function tableResizeHandler() {
        if (this == currentTable) {
            layerFollow(this);
        }
    }
    function layerFollow(table) {
        if (layer) {
            var entrance = lib.g(table.getBodyCellId(currentRowIndex, currentColIndex));
            if (entrance) {
                helper.layer.attachTo(layer, entrance);
            }
        }
    }
    function stop() {
        currentState = 0;
        hideLayer();
        setButtonDisabled(1);
        var eventArgs = {
                rowIndex: currentRowIndex,
                columnIndex: currentColIndex,
                field: currentTable.realFields[currentColIndex]
            };
        eventArgs = currentTable.fire('canceledit', eventArgs);
        fieldHanlder(currentTable, 'canceledit', eventArgs);
    }
    function start(table, options) {
        if (currentState && currentTable) {
            stop();
        }
        currentState = 1;
        init(table, options);
        setButtonDisabled(0);
        showLayer();
        var entrance = lib.g(table.getBodyCellId(options.rowIndex, options.columnIndex));
        helper.layer.attachTo(layer, entrance);
        setValue(options.value);
        clearErrorMsg();
    }
    function setButtonDisabled(disabled) {
        okButton.setDisabled(disabled);
        cancelButton.setDisabled(disabled);
    }
    function setValue(value) {
        inputCtrl.setValue(value);
    }
    function getValue() {
        return inputCtrl.getValue();
    }
    function entranceClickHandler(element, e) {
        var table = this;
        if (table.startEdit) {
            var rowIndex = lib.getAttribute(element, 'data-row');
            var columnIndex = lib.getAttribute(element, 'data-col');
            table.startEdit(rowIndex, columnIndex, element);
        }
    }
    function startEdit(rowIndex, columnIndex, element) {
        if (this.editable) {
            var field = this.realFields[columnIndex];
            var eventArgs = {
                    rowIndex: rowIndex,
                    columnIndex: columnIndex,
                    field: field
                };
            eventArgs = this.fire('startedit', eventArgs);
            fieldHanlder(this, 'startedit', eventArgs);
            if (!eventArgs.isDefaultPrevented()) {
                var data = this.datasource[rowIndex];
                var content = field.editContent;
                var value = 'function' === typeof content ? content.call(this, data, rowIndex, columnIndex) : data[field.field];
                start(this, {
                    field: field,
                    rowIndex: rowIndex,
                    columnIndex: columnIndex,
                    element: element,
                    value: value
                });
            }
        }
    }
    function cancelEdit() {
        if (this == currentTable) {
            stop();
        }
    }
    function hideEditLayer() {
        if (this === currentTable) {
            hideLayer();
        }
    }
    function showEditError() {
        if (this === currentTable) {
            showLayer();
        }
    }
    var editentryTpl = '<div class="${className}" ' + 'data-row="${row}" data-col="${col}"></div>';
    function getColHtml(table, data, field, rowIndex, fieldIndex, extraArgs) {
        if (table.editable && field.editable) {
            return {
                textClass: table.getClass('cell-editable'),
                html: lib.format(editentryTpl, {
                    className: table.getClass('cell-editentry'),
                    row: rowIndex,
                    col: fieldIndex
                })
            };
        }
    }
    function fieldHanlder(table, eventType, args) {
        var handler = args.field['on' + eventType];
        if (handler && '[object Function]' == Object.prototype.toString.call(handler)) {
            handler.call(table, args);
        }
    }
    function TableEdit() {
        Extension.apply(this, arguments);
    }
    TableEdit.prototype.type = 'TableEdit';
    TableEdit.prototype.activate = function () {
        var target = this.target;
        if (!(target instanceof Table)) {
            return;
        }
        target.startEdit = startEdit;
        target.cancelEdit = cancelEdit;
        target.hideEditLayer = hideEditLayer;
        target.showEditError = showEditError;
        target.addRowBuilders([{
                index: 3,
                getColHtml: getColHtml
            }]);
        target.addHandlers('click', {
            handler: entranceClickHandler,
            matchFn: helper.getPartClasses(target, 'cell-editentry')[0]
        });
        target.on('enddrag', tableEndDragHandler);
        target.on('resize', tableResizeHandler);
        Extension.prototype.activate.apply(this, arguments);
    };
    TableEdit.prototype.inactivate = function () {
        var target = this.target;
        if (!(target instanceof Table)) {
            return;
        }
        delete target.startEdit;
        delete target.cancelEdit;
        target.un('enddrag', tableEndDragHandler);
        target.un('resize', tableResizeHandler);
        disposeEditorControl(target);
        Extension.prototype.inactivate.apply(this, arguments);
    };
    lib.inherits(TableEdit, Extension);
    main.registerExtension(TableEdit);
    return TableEdit;
});