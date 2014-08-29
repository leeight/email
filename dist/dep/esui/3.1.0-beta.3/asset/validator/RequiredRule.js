define('esui/validator/RequiredRule', [
    'require',
    './Rule',
    './ValidityState',
    '../lib',
    '../main'
], function (require) {
    var Rule = require('./Rule');
    var ValidityState = require('./ValidityState');
    function RequiredRule() {
        Rule.apply(this, arguments);
    }
    RequiredRule.prototype.type = 'required';
    RequiredRule.prototype.errorMessage = '${title}\u4E0D\u80FD\u4E3A\u7A7A';
    RequiredRule.prototype.check = function (value, control) {
        return new ValidityState(!!value, this.getErrorMessage(control));
    };
    require('../lib').inherits(RequiredRule, Rule);
    require('../main').registerRule(RequiredRule, 0);
    return RequiredRule;
});