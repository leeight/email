define('esui/validator/Validity', [
    'require',
    'underscore'
], function (require) {
    var u = require('underscore');
    function Validity() {
        this.states = [];
        this.stateIndex = {};
        this.customMessage = '';
        this.customValidState = null;
    }
    Validity.prototype.addState = function (name, state) {
        if (this.stateIndex[name]) {
            if (this.stateIndex[name] === state) {
                return;
            }
            for (var i = 0; i < this.states.length; i++) {
                if (this.states[i] === this.stateIndex[name]) {
                    this.states.splice(i, 1);
                    break;
                }
            }
        }
        this.states.push(state);
        this.stateIndex[name] = state;
    };
    Validity.prototype.getState = function (name) {
        return this.stateIndex[name] || null;
    };
    Validity.prototype.getStates = function () {
        return this.states.slice();
    };
    Validity.prototype.getCustomMessage = function () {
        return this.customMessage;
    };
    Validity.prototype.setCustomMessage = function (message) {
        this.customMessage = message;
    };
    Validity.prototype.setCustomValidState = function (validState) {
        this.customValidState = validState;
    };
    Validity.prototype.isValid = function () {
        return u.all(this.getStates(), function (state) {
            return state.getState();
        });
    };
    Validity.prototype.getValidState = function () {
        return this.customValidState || (this.isValid() ? 'valid' : 'invalid');
    };
    return Validity;
});