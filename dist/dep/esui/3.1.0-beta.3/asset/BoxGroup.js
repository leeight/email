define('esui/BoxGroup', [
    'require',
    'underscore',
    './lib',
    './InputControl',
    './painters',
    './main'
], function (require) {
    var u = require('underscore');
    var lib = require('./lib');
    var InputControl = require('./InputControl');
    function BoxGroup() {
        InputControl.apply(this, arguments);
    }
    BoxGroup.prototype.type = 'BoxGroup';
    function extractDatasourceFromDOM(element, options) {
        var boxes = element.getElementsByTagName('input');
        var labels = element.getElementsByTagName('label');
        var labelIndex = {};
        for (var i = labels.length - 1; i >= 0; i--) {
            var label = labels[i];
            var forAttribute = lib.getAttribute(label, 'for');
            if (forAttribute) {
                labelIndex[forAttribute] = label;
            }
        }
        var datasource = [];
        var values = [];
        for (var i = 0, length = boxes.length; i < length; i++) {
            var box = boxes[i];
            if (box.type === options.boxType && (options.name || '') === box.name) {
                var item = { value: box.value };
                var label = box.id && labelIndex[box.id];
                item.title = label ? lib.getText(label) : '';
                if (!item.title) {
                    item.title = box.title || (box.value === 'on' ? box.value : '');
                }
                datasource.push(item);
                if (box.getAttribute('checked') !== null) {
                    values.push(box.value);
                }
            }
        }
        options.datasource = datasource;
        if (!options.rawValue && !options.value) {
            options.rawValue = values;
        }
    }
    BoxGroup.prototype.initOptions = function (options) {
        var properties = {
                datasource: [],
                orientation: 'horizontal',
                boxType: 'radio'
            };
        u.extend(properties, options);
        if (!properties.datasource.length) {
            extractDatasourceFromDOM(this.main, properties);
        }
        if (!properties.rawValue && !properties.value) {
            properties.rawValue = [];
        }
        this.setProperties(properties);
    };
    function syncValue() {
        var result = u.chain(this.getBoxElements()).where({ checked: true }).pluck('value').value();
        this.rawValue = result;
        this.fire('change');
    }
    var itemTemplate = [
            '<label title="${title}" class="${wrapperClass}">',
            '<input type="${type}" name="${name}" id="${id}"' + ' title="${title}" value="${value}"${checked} />',
            '<span>${title}</span>',
            '</label>'
        ];
    itemTemplate = itemTemplate.join('');
    function render(group, datasource, boxType) {
        group.helper.clearDOMEvents();
        var html = '';
        var classes = [].concat(group.helper.getPartClasses(boxType), group.helper.getPartClasses('wrapper'));
        var valueIndex = lib.toDictionary(group.rawValue);
        var name = group.name || lib.getGUID();
        for (var i = 0; i < datasource.length; i++) {
            var item = datasource[i];
            var data = {
                    wrapperClass: classes.join(' '),
                    id: group.helper.getId('box-' + i),
                    type: group.boxType,
                    name: name,
                    title: lib.trim(item.title || item.name || item.text),
                    value: item.value,
                    checked: valueIndex[item.value] ? ' checked="checked"' : ''
                };
            html += lib.format(itemTemplate, data);
        }
        group.main.innerHTML = html;
        var eventName = group.main.addEventListener ? 'change' : 'click';
        u.each(group.getBoxElements(), function (box) {
            this.helper.addDOMEvent(box, eventName, syncValue);
        }, group);
    }
    BoxGroup.prototype.setProperties = function (properties) {
        if ((properties.datasource || properties.boxType) && (!properties.rawValue && !properties.value) && (!this.rawValue || !this.rawValue.length)) {
            properties.rawValue = [];
        }
        var changes = InputControl.prototype.setProperties.apply(this, arguments);
        if (changes.hasOwnProperty('rawValue')) {
            this.fire('change');
        }
    };
    BoxGroup.prototype.repaint = require('./painters').createRepaint(InputControl.prototype.repaint, {
        name: [
            'datasource',
            'boxType'
        ],
        paint: render
    }, {
        name: [
            'disabled',
            'readOnly'
        ],
        paint: function (group, disabled, readOnly) {
            u.each(group.getBoxElements(), function (box) {
                box.disabled = disabled;
                box.readOnly = readOnly;
            });
        }
    }, {
        name: 'rawValue',
        paint: function (group, rawValue) {
            rawValue = rawValue || [];
            group.rawValue = rawValue;
            var map = {};
            for (var i = 0; i < rawValue.length; i++) {
                map[rawValue[i]] = true;
            }
            u.each(group.getBoxElements(), function (box) {
                box.checked = map.hasOwnProperty(box.value);
            });
        }
    }, {
        name: 'orientation',
        paint: function (group, orientation) {
            group.removeState('vertical');
            group.removeState('horizontal');
            group.addState(orientation);
        }
    });
    BoxGroup.prototype.parseValue = function (value) {
        return value.split(',');
    };
    BoxGroup.prototype.getBoxElements = function () {
        return u.where(this.main.getElementsByTagName('input'), { type: this.boxType });
    };
    lib.inherits(BoxGroup, InputControl);
    require('./main').register(BoxGroup);
    return BoxGroup;
});