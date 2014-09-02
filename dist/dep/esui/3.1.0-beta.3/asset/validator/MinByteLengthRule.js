define('esui/validator/MinByteLengthRule', [
    'require',
    './Rule',
    './ValidityState',
    '../lib',
    '../main'
], function (require) {
    var Rule = require('./Rule');
    var ValidityState = require('./ValidityState');
    function MinByteLengthRule() {
        Rule.apply(this, arguments);
    }
    MinByteLengthRule.prototype.type = 'minByteLength';
    MinByteLengthRule.prototype.errorMessage = '${title}\u4E0D\u80FD\u5C0F\u4E8E${minByteLength}\u4E2A\u5B57\u7B26';
    MinByteLengthRule.prototype.check = function (value, control) {
        var byteLength = value.replace(/[^\x00-\xff]/g, 'xx').length;
        return new ValidityState(byteLength >= this.getLimitCondition(control), this.getErrorMessage(control));
    };
    require('../lib').inherits(MinByteLengthRule, Rule);
    require('../main').registerRule(MinByteLengthRule, 100);
    return MinByteLengthRule;
});