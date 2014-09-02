define('esui/TextLine', [
    'require',
    'underscore',
    './lib',
    './InputControl',
    './main',
    './TextBox',
    './painters'
], function (require) {
    var u = require('underscore');
    var lib = require('./lib');
    var InputControl = require('./InputControl');
    var ui = require('./main');
    require('./TextBox');
    function TextLine(options) {
        InputControl.apply(this, arguments);
    }
    function getMainHTML(textLine) {
        var textareaHTML = '' + '<textarea wrap="off" ' + 'id="' + textLine.helper.getId('text') + '"' + '</textarea>';
        var html = [
                textLine.helper.getPartBeginTag('num-line', 'div'),
                '1',
                textLine.helper.getPartEndTag('num-line', 'div'),
                textLine.helper.getPartBeginTag('text-container', 'div'),
                textareaHTML,
                textLine.helper.getPartEndTag('text-container', 'div')
            ];
        return html.join('');
    }
    function refreshOnInput(e) {
        if (e.type === 'input' || e.propertyName === 'value') {
            refreshLineNum.call(this);
        }
    }
    function refreshLineNum() {
        var num = this.helper.getPart('text').value.split('\n').length;
        if (num !== this.number) {
            this.number = num;
            var numLine = this.helper.getPart('num-line');
            numLine.innerHTML = u.range(1, num + 1).join('<br />');
        }
        this.resetScroll();
        this.fire('change');
    }
    TextLine.prototype = {
        type: 'TextLine',
        initOptions: function (options) {
            var properties = {
                    width: 300,
                    height: 200,
                    value: ''
                };
            if (lib.isInput(this.main)) {
                this.helper.extractOptionsFromInput(this.main, properties);
            }
            u.extend(properties, options);
            if (!properties.hasOwnProperty('title') && this.main.title) {
                properties.title = this.main.title;
            }
            this.setProperties(properties);
        },
        initStructure: function () {
            if (lib.isInput(this.main)) {
                this.helper.replaceMain();
            }
            this.main.innerHTML = getMainHTML(this);
            this.helper.initChildren();
        },
        initEvents: function () {
            var textArea = this.helper.getPart('text');
            var inputEvent = 'oninput' in textArea ? 'input' : 'propertychange';
            this.helper.addDOMEvent(textArea, inputEvent, refreshOnInput);
            this.helper.addDOMEvent(textArea, 'scroll', this.resetScroll);
        },
        repaint: require('./painters').createRepaint(InputControl.prototype.repaint, {
            name: 'height',
            paint: function (textLine, height) {
                height = height || 300;
                var lineNumDiv = textLine.helper.getPart('num-line');
                lineNumDiv.style.height = height + 'px';
                textLine.main.style.height = height + 'px';
            }
        }, {
            name: 'width',
            paint: function (textLine, width) {
                width = width || 300;
                textLine.main.style.width = width + 'px';
            }
        }, {
            name: 'rawValue',
            paint: function (textLine, value) {
                var textArea = textLine.helper.getPart('text');
                if (value) {
                    if (u.isArray(value)) {
                        textLine.value = u.unescape(value.join('\n'));
                    } else if (typeof value === 'string') {
                        textLine.value = u.unescape(value);
                    }
                    var inputEvent = 'oninput' in textArea ? 'input' : 'propertychange';
                    textLine.helper.removeDOMEvent(textArea, inputEvent, refreshOnInput);
                    textArea.value = textLine.value;
                    textLine.helper.addDOMEvent(textArea, inputEvent, refreshOnInput);
                    refreshLineNum.call(textLine);
                }
            }
        }, {
            name: [
                'disabled',
                'readOnly'
            ],
            paint: function (textLine, disabled, readOnly) {
                var textArea = textLine.helper.getPart('text');
                textArea.disabled = !!disabled;
                textArea.readOnly = !!readOnly;
            }
        }),
        resetScroll: function () {
            var textArea = this.helper.getPart('text');
            var lineNumber = this.helper.getPart('num-line');
            lineNumber.style.height = textArea.clientHeight + 'px';
            lineNumber.scrollTop = textArea.scrollTop;
        },
        stringifyValue: function (rawValue) {
            return rawValue.join('\n');
        },
        parseValue: function (value) {
            return lib.trim(value.replace(/\n{2,}/g, '\n')).split('\n');
        },
        getRawValue: function () {
            return u.unique(this.getValueRepeatableItems());
        },
        getValueRepeatableItems: function () {
            var text = this.helper.getPart('text').value;
            var items = text.split('\n');
            return u.chain(items).map(lib.trim).compact().value();
        },
        getRowsNumber: function () {
            var items = this.getValue().split('\n');
            return items.length;
        },
        addLines: function (lines) {
            var content = lines.join('\n');
            var value = this.getValue();
            if (value.length > 0) {
                content = value + '\n' + content;
            }
            this.setRawValue(content);
        }
    };
    lib.inherits(TextLine, InputControl);
    ui.register(TextLine);
    return TextLine;
});