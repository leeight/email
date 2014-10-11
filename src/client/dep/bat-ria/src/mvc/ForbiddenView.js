/**
 * @file 403页 View
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    // require template
    require('../tpl!../tpl/forbidden.tpl.html');

    var util = require('er/util');
    var View = require('er/View');

    /**
     * 403页 View
     *
     * @extends er.View
     * @constructor
     */
    function ForbiddenView() {
        View.apply(this, arguments);
    }

    util.inherits(ForbiddenView, View);

    /**
     * @inheritDoc
     */
    ForbiddenView.prototype.template = 'TPL_forbidden';

    return ForbiddenView;
});
