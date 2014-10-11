define(
    function(require) {
        var Action = require('er/Action');

        function AffairForm() {
            Action.apply(this, arguments);
        }

        function cancelSubmit() {
            this.redirect('/affair/list');
        }

        function submitAffair(e) {
            this.model.save(e.affair).then(saveCallBack.bind(this));
        }

        function saveCallBack(response) {
            if (response.success === true) {
                this.redirect('/affair/list');
            }
            else {
                alert('出错啦！');
            }
        }

        AffairForm.prototype.modelType = require('./FormModel');

        AffairForm.prototype.viewType = require('./FormView');

        AffairForm.prototype.initBehavior = function() {
            this.view.on('submit', submitAffair.bind(this));
            this.view.on('cancel', cancelSubmit.bind(this));
        };

        require('er/util').inherits(AffairForm, Action);

        return AffairForm;
    }
);