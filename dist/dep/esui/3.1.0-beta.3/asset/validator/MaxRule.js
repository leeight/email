define('esui/validator/MaxRule', [
    'require',
    './Rule',
    './ValidityState',
    '../lib',
    '../main'
], function (require) {
    var Rule = require('./Rule');
    var ValidityState = require('./ValidityState');
    function MaxRule() {
        Rule.apply(this, arguments);
    }
    MaxRule.prototype.type = 'max';
    MaxRule.prototype.errorMessage = '${title}\u4E0D\u80FD\u5927\u4E8E${max}';
    MaxRule.prototype.check = function (value, control) {
        var valueOfNumber = +value;
        var isValidNumber = !isNaN(valueOfNumber) && valueOfNumber <= this.getLimitCondition(control);
        return new ValidityState(!value || isValidNumber, this.getErrorMessage(control));
    };
    require('../lib').inherits(MaxRule, Rule);
    require('../main').registerRule(MaxRule, 301);
    return MaxRule;
});