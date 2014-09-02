define('esui/validator/MinLengthRule', [
    'require',
    './Rule',
    './ValidityState',
    '../lib',
    '../main'
], function (require) {
    var Rule = require('./Rule');
    var ValidityState = require('./ValidityState');
    function MinLengthRule() {
        Rule.apply(this, arguments);
    }
    MinLengthRule.prototype.type = 'minLength';
    MinLengthRule.prototype.errorMessage = '${title}\u4E0D\u80FD\u5C0F\u4E8E${minLength}\u4E2A\u5B57\u7B26';
    MinLengthRule.prototype.check = function (value, control) {
        return new ValidityState(value.length >= this.getLimitCondition(control), this.getErrorMessage(control));
    };
    require('../lib').inherits(MinLengthRule, Rule);
    require('../main').registerRule(MinLengthRule, 100);
    return MinLengthRule;
});