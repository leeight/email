/**
 * @file 404页 Action
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var util = require('er/util');
    var Action = require('er/Action');

    /**
     * 404页 Action
     *
     * @extends er/Action
     * @constructor
     */
    function NotFoundAction() {
        Action.apply(this, arguments);
    }

    util.inherits(NotFoundAction, Action);

    NotFoundAction.prototype.modelType = require('./NotFoundModel');
    NotFoundAction.prototype.viewType = require('./NotFoundView');

    return NotFoundAction;
});

