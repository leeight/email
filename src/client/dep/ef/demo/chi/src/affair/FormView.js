define(
    function (require) {
        require('er/tpl!./form.tpl');
        require('esui/Form');
        require('esui/Label');
        require('esui/Button');
        require('esui/TextBox');
        require('esui/Select');
        require('esui/Calendar');
        // css
        require('css!./css/form.css');

        var AffairType = require('./config').AffairType;


        var UIView = require('ef/UIView');

        function AffairFormView() {
            UIView.apply(this, arguments);
        }

        function submit() {
            var form = this.get('form');
            var data = form.getData();
            this.fire('submit', {affair: data});
        }

        function cancel() {
            this.fire('cancel');
        }

        AffairFormView.prototype.template = 'affairForm';

        AffairFormView.prototype.enterDocument = function() {
            UIView.prototype.enterDocument.apply(this, arguments);
            var form = this.get('form');
            form.on('submit', require('er/util').bind(submit, this));

            var cancelButton = this.get('cancel-button');
            cancelButton.on('click', require('er/util').bind(cancel, this))
        };


        require('er/util').inherits(AffairFormView, UIView);
        return AffairFormView;
    }
);