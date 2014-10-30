/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var FormAction = require('bat-ria/mvc/FormAction');

    /**
     * Action构造函数
     *
     * @constructor
     */
    function MailCompose() {
        FormAction.apply(this, arguments);
    }

    MailCompose.prototype.modelType = require('./ComposeModel');
    MailCompose.prototype.viewType = require('./ComposeView');

    /**
     * inheritDoc
     *
     * @protected
     * @override
     */
    MailCompose.prototype.initBehavior = function () {
        FormAction.prototype.initBehavior.apply(this, arguments);
    };

    require('er/util').inherits(MailCompose, FormAction);
    return MailCompose;
});
