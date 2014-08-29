define('esui/Select', [
    'require',
    'underscore',
    './lib',
    './InputControl',
    './Layer',
    './painters',
    './main'
], function (require) {
    var u = require('underscore');
    var lib = require('./lib');
    var InputControl = require('./InputControl');
    var Layer = require('./Layer');
    function selectValue(e) {
        var target = lib.event.getTarget(e);
        var layer = this.layer.getElement();
        while (target && target !== layer && !lib.hasAttribute(target, 'data-index')) {
            target = target.parentNode;
        }
        if (target && !this.helper.isPart(target, 'item-disabled')) {
            var index = target.getAttribute('data-index');
            this.set('selectedIndex', +index);
            this.layer.hide();
        }
    }
    function SelectLayer() {
        Layer.apply(this, arguments);
    }
    lib.inherits(SelectLayer, Layer);
    SelectLayer.prototype.nodeName = 'ol';
    SelectLayer.prototype.render = function (element) {
        var html = '';
        for (var i = 0; i < this.control.datasource.length; i++) {
            var item = this.control.datasource[i];
            var classes = this.control.helper.getPartClasses('item');
            if (item.disabled) {
                classes.push.apply(classes, this.control.helper.getPartClasses('item-disabled'));
            }
            html += '<li data-index="' + i + '" ' + 'class="' + classes.join(' ') + '">';
            html += this.control.getItemHTML(item);
            html += '</li>';
        }
        element.innerHTML = html;
    };
    SelectLayer.prototype.initBehavior = function (element) {
        this.control.helper.addDOMEvent(element, 'click', selectValue);
    };
    SelectLayer.prototype.syncState = function (element) {
        var classes = this.control.helper.getPartClasses('item-selected');
        var items = lib.getChildren(element);
        for (var i = items.length - 1; i >= 0; i--) {
            var item = items[i];
            if (i === this.control.selectedIndex) {
                lib.addClasses(item, classes);
            } else {
                lib.removeClasses(item, classes);
            }
        }
    };
    SelectLayer.prototype.dock = { strictWidth: true };
    function Select(options) {
        InputControl.apply(this, arguments);
        this.layer = new SelectLayer(this);
    }
    Select.prototype.type = 'Select';
    function adjustValueProperties(context) {
        if (context.selectedIndex == null && context.rawValue == null && context.value == null) {
            context.selectedIndex = -1;
        }
        if (context.rawValue != null) {
            context.value = null;
            context.selectedIndex = null;
        } else if (context.value != null) {
            context.selectedIndex = null;
        }
        if (context.selectedIndex == null && (context.value != null || context.rawValue != null)) {
            context.selectedIndex = -1;
            var value = context.rawValue || context.value;
            for (var i = 0; i < context.datasource.length; i++) {
                if (context.datasource[i].value == value) {
                    context.selectedIndex = i;
                    break;
                }
            }
            delete context.value;
            delete context.rawValue;
        }
        if (context.selectedIndex < 0 || context.selectedIndex >= context.datasource.length) {
            if (context.emptyText) {
                context.selectedIndex = -1;
            } else {
                context.selectedIndex = -1;
                for (var i = 0; i < context.datasource.length; i++) {
                    if (!context.datasource[i].disabled) {
                        context.selectedIndex = i;
                        break;
                    }
                }
            }
        }
    }
    Select.prototype.initOptions = function (options) {
        var defaults = { datasource: [] };
        var properties = {};
        u.extend(properties, defaults, options);
        if (this.main.nodeName.toLowerCase() === 'select') {
            properties.datasource = [];
            var elements = this.main.getElementsByTagName('option');
            for (var i = 0, length = elements.length; i < length; i++) {
                var item = elements[i];
                var dataItem = {
                        name: item.name || item.text,
                        value: item.value
                    };
                if (item.disabled) {
                    dataItem.disabled = true;
                }
                properties.datasource.push(dataItem);
                if (item.selected && properties.selectedIndex == null && properties.value == null && properties.rawValue == null) {
                    properties.selectedIndex = item.value ? i : 0;
                }
            }
            this.helper.extractOptionsFromInput(this.main, properties);
        }
        if (typeof properties.selectedIndex === 'string') {
            properties.selectedIndex = +properties.selectedIndex;
        }
        this.setProperties(properties);
    };
    Select.prototype.itemTemplate = '<span>${text}</span>';
    Select.prototype.getItemHTML = function (item) {
        var data = {
                text: u.escape(item.name || item.text),
                value: u.escape(item.value)
            };
        return lib.format(this.itemTemplate, data);
    };
    Select.prototype.displayTemplate = '${text}';
    Select.prototype.getDisplayHTML = function (item) {
        if (!item) {
            return u.escape(this.emptyText || '');
        }
        var data = {
                text: u.escape(item.name || item.text),
                value: u.escape(item.value)
            };
        return lib.format(this.displayTemplate, data);
    };
    Select.prototype.initStructure = function () {
        if (this.main.nodeName.toLowerCase() === 'select') {
            this.helper.replaceMain();
        }
        this.main.tabIndex = 0;
        this.main.innerHTML = this.helper.getPartHTML('text', 'span');
    };
    Select.prototype.initEvents = function () {
        this.helper.addDOMEvent(this.main, 'click', u.bind(this.layer.toggle, this.layer));
    };
    function updateValue(select) {
        var textHolder = select.helper.getPart('text');
        var selectedItem = select.selectedIndex === -1 ? null : select.datasource[select.selectedIndex];
        textHolder.innerHTML = select.getDisplayHTML(selectedItem);
        var layerElement = select.layer.getElement(false);
        if (layerElement) {
            select.layer.syncState(layerElement);
        }
    }
    Select.prototype.getRawValue = function () {
        if (this.selectedIndex < 0) {
            return null;
        }
        var item = this.datasource[this.selectedIndex];
        return item ? item.value : null;
    };
    var paint = require('./painters');
    Select.prototype.repaint = paint.createRepaint(InputControl.prototype.repaint, paint.style('width'), paint.style('height'), {
        name: 'datasource',
        paint: function (select) {
            select.layer.repaint();
        }
    }, {
        name: [
            'selectedIndex',
            'emptyText',
            'datasource'
        ],
        paint: updateValue
    }, {
        name: [
            'disabled',
            'hidden',
            'readOnly'
        ],
        paint: function (select, disabled, hidden, readOnly) {
            if (disabled || hidden || readOnly) {
                select.layer.hide();
            }
        }
    });
    Select.prototype.updateDatasource = function (datasource) {
        if (!datasource) {
            datasource = this.datasource;
        }
        this.datasource = datasource;
        var record = { name: 'datasource' };
        this.repaint([record], { datasource: record });
    };
    Select.prototype.setProperties = function (properties) {
        if (properties.datasource == null) {
            properties.datasource = this.datasource;
        }
        if (properties.value == null && properties.rawValue == null && properties.selectedIndex == null && properties.datasource === this.datasource) {
            properties.selectedIndex = this.selectedIndex;
        }
        if (!properties.hasOwnProperty('emptyText')) {
            properties.emptyText = this.emptyText;
        }
        adjustValueProperties(properties);
        var changes = InputControl.prototype.setProperties.apply(this, arguments);
        if (changes.hasOwnProperty('selectedIndex')) {
            this.fire('change');
        }
        return changes;
    };
    Select.prototype.dispose = function () {
        if (this.helper.isInStage('DISPOSED')) {
            return;
        }
        if (this.layer) {
            this.layer.dispose();
            this.layer = null;
        }
        InputControl.prototype.dispose.apply(this, arguments);
    };
    Select.prototype.getSelectedItem = function () {
        return this.get('datasource')[this.get('selectedIndex')];
    };
    lib.inherits(Select, InputControl);
    require('./main').register(Select);
    return Select;
});