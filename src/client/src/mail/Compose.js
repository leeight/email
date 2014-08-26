/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var FormAction = require('bat-ria/mvc/FormAction');
    var util = require('er/util');

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

        // // bind event handlers here
        // this.on('entercomplete', util.bind(this._initEditor, this));

        // this.view.get('form').on('beforevalidate', function() {
        //     if (ueditorInstance) {
        //         debugger;
        //         var html = ueditorInstance.getContent();
        //         var message = this.view.get('message');
        //         message.setValue(html);
        //     }
        // });
    };

    require('er/util').inherits(MailCompose, FormAction);
    return MailCompose;
});
