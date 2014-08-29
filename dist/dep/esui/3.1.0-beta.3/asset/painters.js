define('esui/painters', [
    'require',
    'underscore',
    './lib'
], function (require) {
    var u = require('underscore');
    var lib = require('./lib');
    var painters = {};
    painters.state = function (name) {
        return {
            name: name,
            paint: function (control, value) {
                var method = value ? 'addState' : 'removeState';
                control[method](this.name);
            }
        };
    };
    painters.attribute = function (name, attribute, value) {
        return {
            name: name,
            attribute: attribute || name,
            value: value,
            paint: function (control, value) {
                value = this.value == null ? value : this.value;
                control.main.setAttribute(this.attribute, value);
            }
        };
    };
    var unitProperties = {
            width: true,
            height: true,
            top: true,
            right: true,
            bottom: true,
            left: true,
            fontSize: true,
            padding: true,
            paddingTop: true,
            paddingRight: true,
            paddingBottom: true,
            paddingLeft: true,
            margin: true,
            marginTop: true,
            marginRight: true,
            marginBottom: true,
            marginLeft: true,
            borderWidth: true,
            borderTopWidth: true,
            borderRightWidth: true,
            borderBottomWidth: true,
            borderLeftWidth: true
        };
    painters.style = function (name, property) {
        return {
            name: name,
            property: property || name,
            paint: function (control, value) {
                if (value == null) {
                    return;
                }
                if (unitProperties.hasOwnProperty(this.property)) {
                    value = value === 0 ? '0' : value + 'px';
                }
                control.main.style[this.property] = value;
            }
        };
    };
    painters.html = function (name, element, generate) {
        return {
            name: name,
            element: element || '',
            generate: generate,
            paint: function (control, value) {
                var element = typeof this.element === 'function' ? this.element(control) : this.element ? control.helper.getPart(this.element) : control.main;
                if (element) {
                    var html = typeof this.generate === 'function' ? this.generate(control, value) : value;
                    element.innerHTML = html || '';
                }
            }
        };
    };
    painters.text = function (name, element, generate) {
        return {
            name: name,
            element: element || '',
            generate: generate,
            paint: function (control, value) {
                var element = typeof this.element === 'function' ? this.element(control) : this.element ? control.helper.getPart(this.element) : control.main;
                if (element) {
                    var html = typeof this.generate === 'function' ? this.generate(control, value) : value;
                    element.innerHTML = u.escape(html || '');
                }
            }
        };
    };
    painters.delegate = function (name, member, method) {
        return {
            name: name,
            member: this.member,
            method: this.method,
            paint: function (control, value) {
                control[this.member][this.method](value);
            }
        };
    };
    painters.createRepaint = function () {
        var painters = [].concat.apply([], [].slice.call(arguments));
        return function (changes, changesIndex) {
            var index = lib.extend({}, changesIndex);
            for (var i = 0; i < painters.length; i++) {
                var painter = painters[i];
                if (typeof painter === 'function') {
                    painter.apply(this, arguments);
                    continue;
                }
                var propertyNames = [].concat(painter.name);
                var shouldPaint = !changes;
                if (!shouldPaint) {
                    for (var j = 0; j < propertyNames.length; j++) {
                        var name = propertyNames[j];
                        if (changesIndex.hasOwnProperty(name)) {
                            shouldPaint = true;
                            break;
                        }
                    }
                }
                if (!shouldPaint) {
                    continue;
                }
                var properties = [this];
                for (var j = 0; j < propertyNames.length; j++) {
                    var name = propertyNames[j];
                    properties.push(this[name]);
                    delete index[name];
                }
                try {
                    painter.paint.apply(painter, properties);
                } catch (ex) {
                    var paintingPropertyNames = '"' + propertyNames.join('", "') + '"';
                    var error = new Error('Failed to paint [' + paintingPropertyNames + '] ' + 'for control "' + (this.id || 'anonymous') + '" ' + 'of type ' + this.type + ' ' + 'because: ' + ex.message);
                    error.actualError = error;
                    throw error;
                }
            }
            var unpainted = [];
            for (var key in index) {
                if (index.hasOwnProperty(key)) {
                    unpainted.push(index[key]);
                }
            }
            return unpainted;
        };
    };
    return painters;
});