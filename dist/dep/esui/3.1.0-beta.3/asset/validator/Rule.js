define('esui/validator/Rule', [
    'require',
    './ValidityState',
    '../lib'
], function (require) {
    function Rule() {
    }
    Rule.prototype.type = null;
    Rule.prototype.errorMessage = '${title}\u9A8C\u8BC1\u5931\u8D25';
    Rule.prototype.check = function (value, control) {
        var ValidityState = require('./ValidityState');
        return new ValidityState(true, '');
    };
    Rule.prototype.getErrorMessage = function (control) {
        var lib = require('../lib');
        var errorMessage = control.get(this.type + 'ErrorMessage') || this.errorMessage;
        return lib.format(errorMessage, control);
    };
    Rule.prototype.getLimitCondition = function (control) {
        return control.get(this.type);
    };
    Rule.prototype.getName = function () {
        return this.type;
    };
    return Rule;
});