define('esui/validator/MaxByteLengthRule', [
    'require',
    './Rule',
    './ValidityState',
    '../lib',
    '../main'
], function (require) {
    var Rule = require('./Rule');
    var ValidityState = require('./ValidityState');
    function MaxByteLengthRule() {
        Rule.apply(this, arguments);
    }
    MaxByteLengthRule.prototype.type = 'maxByteLength';
    MaxByteLengthRule.prototype.errorMessage = '${title}\u4E0D\u80FD\u8D85\u8FC7${maxByteLength}\u4E2A\u5B57\u7B26';
    MaxByteLengthRule.prototype.check = function (value, control) {
        var byteLength = value.replace(/[^\x00-\xff]/g, 'xx').length;
        return new ValidityState(byteLength <= this.getLimitCondition(control), this.getErrorMessage(control));
    };
    require('../lib').inherits(MaxByteLengthRule, Rule);
    require('../main').registerRule(MaxByteLengthRule, 100);
    return MaxByteLengthRule;
});