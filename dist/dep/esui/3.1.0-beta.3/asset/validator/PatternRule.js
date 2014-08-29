define('esui/validator/PatternRule', [
    'require',
    './Rule',
    './ValidityState',
    '../lib',
    '../main'
], function (require) {
    var Rule = require('./Rule');
    var ValidityState = require('./ValidityState');
    function PatternRule() {
        Rule.apply(this, arguments);
    }
    PatternRule.prototype.type = 'pattern';
    PatternRule.prototype.errorMessage = '${title}\u683C\u5F0F\u4E0D\u7B26\u5408\u8981\u6C42';
    PatternRule.prototype.check = function (value, control) {
        var regex = new RegExp(this.getLimitCondition(control));
        return new ValidityState(!value || regex.test(value), this.getErrorMessage(control));
    };
    require('../lib').inherits(PatternRule, Rule);
    require('../main').registerRule(PatternRule, 200);
    return PatternRule;
});