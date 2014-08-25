/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var FormAction = require('bat-ria/mvc/FormAction');
    var util = require('er/util')

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
     * 初始化编辑器
     */
    MailCompose.prototype._initEditor = function() {
        var ue = UE.getEditor('email-body-editor');
        ue.destroy();
        ue.reset();
        console.log(ue);
    };

    /**
     * inheritDoc
     *
     * @protected
     * @override
     */
    MailCompose.prototype.initBehavior = function () {
        FormAction.prototype.initBehavior.apply(this, arguments);

        // bind event handlers here
        this.on('entercomplete', util.bind(this._initEditor, this))
    };

    require('er/util').inherits(MailCompose, FormAction);
    return MailCompose;
});
