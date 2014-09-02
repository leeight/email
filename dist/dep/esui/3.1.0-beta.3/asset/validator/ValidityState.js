define('esui/validator/ValidityState', [], function () {
    function ValidityState(state, message) {
        this.state = state;
        this.message = message || '';
    }
    ValidityState.prototype.getMessage = function () {
        return this.message;
    };
    ValidityState.prototype.getState = function () {
        return this.state;
    };
    ValidityState.prototype.setMessage = function (message) {
        this.message = message;
    };
    ValidityState.prototype.setState = function (state) {
        this.state = state;
    };
    return ValidityState;
});