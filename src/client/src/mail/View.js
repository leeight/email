/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var BaseAction = require('bat-ria/mvc/BaseAction');
    var lib = require('esui/lib');

    /**
     * Action构造函数
     *
     * @constructor
     */
    function MailView() {
        BaseAction.apply(this, arguments);
    }

    MailView.prototype.modelType = require('./ViewModel');
    MailView.prototype.viewType = require('./ViewView');

    /**
     * inheritDoc
     *
     * @protected
     * @override
     */
    MailView.prototype.initBehavior = function () {
        BaseAction.prototype.initBehavior.apply(this, arguments);

        // bind event handlers here
        lib.g('mail-body').onmousedown = function(opt_evt) {
            var evt = opt_evt || window.event;
            var node = evt.target || evt.srcElement;
            if (node.nodeType === 1 && node.nodeName === 'A') {
                if (/^mailto:/.test(node.href)) {
                    node.href = '#/mail/compose~to=' + node.href.replace('mailto:', '')
                }
                else if (node.target !== '_blank') {
                    node.target = '_blank';
                }
            }
        }
    };

    require('er/util').inherits(MailView, BaseAction);
    return MailView;
});
