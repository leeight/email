/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    // require template
    require('bat-ria/tpl!../mail/view.tpl.html');
    require('bat-ria/tpl!./view.tpl.html');

    var BaseView = require('bat-ria/mvc/BaseView');

    /**
     * [Please Input View Description]
     *
     * @constructor
     */
    function ThreadViewView() {
        BaseView.apply(this, arguments);
    }

    /**
     * @inheritDoc
     */
    ThreadViewView.prototype.template = 'TPL_thread_view';

    /**
     * @inheritDoc
     */
    ThreadViewView.prototype.uiProperties = {

    };

    /**
     * @inheritDoc
     */
    ThreadViewView.prototype.uiEvents = {};

    require('er/util').inherits(ThreadViewView, BaseView);
    return ThreadViewView;
});
