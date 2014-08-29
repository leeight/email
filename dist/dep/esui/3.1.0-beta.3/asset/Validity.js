define('esui/Validity', [
    'require',
    'underscore',
    './lib',
    './Control',
    './Helper',
    './painters',
    './main'
], function (require) {
    var u = require('underscore');
    var lib = require('./lib');
    var Control = require('./Control');
    var Helper = require('./Helper');
    function Validity() {
        Control.apply(this, arguments);
    }
    Validity.prototype.type = 'Validity';
    Validity.prototype.createMain = function () {
        return document.createElement('label');
    };
    Validity.prototype.initOptions = function (options) {
        var properties = u.extend({}, Validity.defaultProperties, options);
        Control.prototype.initOptions.call(this, properties);
    };
    function getClasses(label, state) {
        var target = label.target;
        var targetHelper = null;
        if (target || label.targetType) {
            var targetContext = {
                    type: label.targetType || target.type,
                    skin: target && target.skin
                };
            targetHelper = new Helper(targetContext);
        }
        var classes = label.helper.getPartClasses();
        if (targetHelper) {
            classes.push.apply(classes, targetHelper.getPartClasses('validity-label'));
        }
        if (state) {
            classes.push.apply(classes, label.helper.getPartClasses(state));
            if (targetHelper) {
                classes.push.apply(classes, targetHelper.getPartClasses('validity-label-' + state));
            }
        }
        if (target && target.isHidden() || label.isHidden()) {
            classes.push.apply(classes, label.helper.getStateClasses('hidden'));
            if (target) {
                classes.push.apply(classes, target.helper.getPartClasses('validity-label-hidden'));
            }
        }
        return classes;
    }
    Validity.prototype.display = function (validState, message, validity) {
        this.main.innerHTML = message;
    };
    Validity.prototype.repaint = require('./painters').createRepaint(Control.prototype.repaint, {
        name: [
            'target',
            'targetType'
        ],
        paint: function (label) {
            var validState = label.validity ? label.validity.getValidState() : '';
            var classes = getClasses(label, validState);
            label.main.className = classes.join(' ');
        }
    }, {
        name: 'focusTarget',
        paint: function (label, focusTarget) {
            if (label.main.nodeName.toLowerCase() === 'label') {
                if (focusTarget && focusTarget.id) {
                    lib.setAttribute(label.main, 'for', focusTarget.id);
                } else {
                    lib.removeAttribute(label.main, 'for');
                }
            }
        }
    }, {
        name: 'validity',
        paint: function (label, validity) {
            var validState = validity && validity.getValidState();
            var classes = getClasses(label, validState);
            label.main.className = classes.join(' ');
            label.disposeChildren();
            if (validity) {
                var message = validity.getCustomMessage();
                if (!message) {
                    var invalidState = u.find(validity.getStates(), function (state) {
                            return !state.getState();
                        });
                    message = invalidState && invalidState.getMessage();
                }
                label.display(validState, message || '', validity);
                label.helper.initChildren();
                if (message) {
                    label.show();
                } else {
                    label.hide();
                }
            } else {
                label.main.innerHTML = '';
                label.hide();
            }
        }
    });
    Validity.prototype.dispose = function () {
        if (this.helper.isInStage('DISPOSED')) {
            return;
        }
        if (this.target) {
            this.target.validityLabel = null;
            this.target = null;
        }
        this.focusTarget = null;
        if (this.main.parentNode) {
            this.main.parentNode.removeChild(this.main);
        }
        Control.prototype.dispose.apply(this, arguments);
    };
    lib.inherits(Validity, Control);
    require('./main').register(Validity);
    return Validity;
});