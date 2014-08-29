define('esui/Extension', [
    'require',
    './lib'
], function (require) {
    var lib = require('./lib');
    function Extension(options) {
        lib.extend(this, options);
    }
    Extension.prototype.target = null;
    Extension.prototype.active = false;
    Extension.prototype.isActive = function () {
        return this.active;
    };
    Extension.prototype.activate = function () {
        this.active = true;
    };
    Extension.prototype.inactivate = function () {
        this.active = false;
    };
    Extension.prototype.attachTo = function (target) {
        if (this.target && this.target !== target) {
            if (this.active) {
                this.inactivate();
            }
        }
        this.target = target;
        if (!this.active) {
            this.activate();
        }
    };
    Extension.prototype.dispose = function () {
        if (this.active) {
            this.inactivate();
        }
        this.target = null;
    };
    return Extension;
});