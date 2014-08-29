define('esui/validator/MinRule', [
    'require',
    './Rule',
    './ValidityState',
    '../lib',
    '../main'
], function (require) {
    var Rule = require('./Rule');
    var ValidityState = require('./ValidityState');
    function MinRule() {
        Rule.apply(this, arguments);
    }
    MinRule.prototype.type = 'min';
    MinRule.prototype.errorMessage = '${title}\u4E0D\u80FD\u5C0F\u4E8E${min}';
    MinRule.prototype.check = function (value, control) {
        var valueOfNumber = +value;
        var isValidNumber = !isNaN(valueOfNumber) && valueOfNumber >= this.getLimitCondition(control);
        return new ValidityState(!value || isValidNumber, this.getErrorMessage(control));
    };
    require('../lib').inherits(MinRule, Rule);
    require('../main').registerRule(MinRule, 300);
    return MinRule;
});