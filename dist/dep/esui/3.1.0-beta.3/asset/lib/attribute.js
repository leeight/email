define('esui/lib/attribute', [
    'require',
    './dom'
], function (require) {
    var dom = require('./dom');
    var lib = {};
    lib.hasAttribute = function (element, name) {
        if (element.hasAttribute) {
            return element.hasAttribute(name);
        } else {
            return element.attributes && element.attributes[name] && element.attributes[name].specified;
        }
    };
    var ATTRIBUTE_NAME_MAPPING = function () {
            var result = {
                    cellpadding: 'cellPadding',
                    cellspacing: 'cellSpacing',
                    colspan: 'colSpan',
                    rowspan: 'rowSpan',
                    valign: 'vAlign',
                    usemap: 'useMap',
                    frameborder: 'frameBorder'
                };
            var div = document.createElement('div');
            div.innerHTML = '<label for="test" class="test"></label>';
            var label = div.getElementsByTagName('label')[0];
            if (label.getAttribute('className') === 'test') {
                result['class'] = 'className';
            } else {
                result.className = 'class';
            }
            if (label.getAttribute('for') === 'test') {
                result.htmlFor = 'for';
            } else {
                result['for'] = 'htmlFor';
            }
            return result;
        }();
    lib.setAttribute = function (element, key, value) {
        element = dom.g(element);
        if (key === 'style') {
            element.style.cssText = value;
        } else {
            key = ATTRIBUTE_NAME_MAPPING[key] || key;
            element.setAttribute(key, value);
        }
        return element;
    };
    lib.getAttribute = function (element, key) {
        element = dom.g(element);
        if (key === 'style') {
            return element.style.cssText;
        }
        key = ATTRIBUTE_NAME_MAPPING[key] || key;
        return element.getAttribute(key);
    };
    lib.removeAttribute = function (element, key) {
        element = dom.g(element);
        key = ATTRIBUTE_NAME_MAPPING[key] || key;
        element.removeAttribute(key);
    };
    return lib;
});