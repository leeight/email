define('esui/validator/MaxLengthRule', [
    'require',
    './Rule',
    './ValidityState',
    '../lib',
    '../main'
], function (require) {
    var Rule = require('./Rule');
    var ValidityState = require('./ValidityState');
    function MaxLengthRule() {
        Rule.apply(this, arguments);
    }
    MaxLengthRule.prototype.type = 'maxLength';
    MaxLengthRule.prototype.errorMessage = '${title}\u4E0D\u80FD\u8D85\u8FC7${maxLength}\u4E2A\u5B57\u7B26';
    MaxLengthRule.prototype.check = function (value, control) {
        return new ValidityState(value.length <= this.getLimitCondition(control), this.getErrorMessage(control));
    };
    MaxLengthRule.prototype.getErrorMessage = function (control) {
        var lib = require('../lib');
        var errorMessage = control.get(this.type + 'ErrorMessage') || this.errorMessage;
        var maxLength = this.getLimitCondition(control);
        var data = {
                title: control.get('title'),
                maxLength: maxLength,
                length: maxLength
            };
        return lib.format(errorMessage, data);
    };
    MaxLengthRule.prototype.getLimitCondition = function (control) {
        return control.get('length') || control.get('maxLength');
    };
    require('../lib').inherits(MaxLengthRule, Rule);
    require('../main').registerRule(MaxLengthRule, 100);
    return MaxLengthRule;
});