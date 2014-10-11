/**
 * @file 403页 Action
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var util = require('er/util');
    var Action = require('er/Action');

    /**
     * 403页 Action
     *
     * @extends er/Action
     * @constructor
     */
    function ForbiddenAction() {
        Action.apply(this, arguments);
    }

    util.inherits(ForbiddenAction, Action);

    ForbiddenAction.prototype.modelType = require('./ForbiddenModel');
    ForbiddenAction.prototype.viewType = require('./ForbiddenView');

    return ForbiddenAction;
});

