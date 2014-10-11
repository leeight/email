/**
 * @file 404页 View
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    // require template
    require('../tpl!../tpl/not_found.tpl.html');

    var util = require('er/util');
    var View = require('er/View');

    /**
     * 404页 View
     *
     * @extends er.View
     * @constructor
     */
    function NotFoundView() {
        View.apply(this, arguments);
    }

    util.inherits(NotFoundView, View);

    /**
     * @inheritDoc
     */
    NotFoundView.prototype.template = 'TPL_not_found';

    return NotFoundView;
});
