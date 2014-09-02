define('er/Enum', [
    'require',
    'eoo'
], function (require) {
    var exports = {};
    exports.constructor = function () {
        this.valueIndex = [];
        this.aliasIndex = {};
        this.textIndex = {};
        for (var i = 0; i < arguments.length; i++) {
            var element = arguments[i];
            if (element.value == null) {
                element.value = i;
            }
            this.addElement(element);
        }
    };
    exports.addElement = function (element) {
        if (this.hasOwnProperty(element.value)) {
            throw new Error('Already defined an element with value' + element.value + ' in this enum type');
        }
        if (this.hasOwnProperty(element.alias)) {
            throw new Error('Already defined an element with alias "' + element.alias + '" in this enum type');
        }
        this[element.value] = element.alias;
        this[element.alias] = element.value;
        this.valueIndex[element.value] = element;
        this.aliasIndex[element.alias] = element;
        this.textIndex[element.text] = element;
    };
    exports.fromValue = function (value) {
        return this.valueIndex[value];
    };
    exports.fromAlias = function (alias) {
        return this.aliasIndex[alias];
    };
    exports.fromText = function (text) {
        return this.textIndex[text];
    };
    exports.getTextFromValue = function (value) {
        return this.fromValue(value).text;
    };
    exports.getTextFromAlias = function (alias) {
        return this.fromAlias(alias).text;
    };
    exports.getValueFromAlias = function (alias) {
        return this.fromAlias(alias).value;
    };
    exports.getValueFromText = function (text) {
        return this.fromText(text).value;
    };
    exports.getAliasFromValue = function (value) {
        return this.fromValue(value).alias;
    };
    exports.getAliasFromText = function (text) {
        return this.fromText(text).alias;
    };
    exports.toArray = function () {
        var array = [];
        if (arguments.length > 0) {
            for (var i = 0; i < arguments.length; i++) {
                var hint = arguments[i];
                if (typeof hint === 'string') {
                    array.push(this.fromAlias(hint));
                } else {
                    array.push(hint);
                }
            }
        } else {
            for (var i = 0; i < this.valueIndex.length; i++) {
                if (this.valueIndex[i]) {
                    array.push(this.valueIndex[i]);
                }
            }
        }
        return array;
    };
    var Enum = require('eoo').create(exports);
    return Enum;
});