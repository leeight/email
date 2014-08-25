define(
    function(require) {
        var Action = require('er/Action');

        function MemberForm() {
            Action.apply(this, arguments);
        }

        function submit(e) {
            this.model
                .saveOrUpdate(e.data)
                .then(checkResponse.bind(this));
        }

        function checkResponse(response) {
            if (response.success === true) {
                this.redirect('/member/list');
            }
            else {
                alert('出错啦！');
            }
        }

        MemberForm.prototype.modelType = require('./FormModel');

        MemberForm.prototype.viewType = require('./FormView');

        MemberForm.prototype.initBehavior = function() {
            this.view.on('submit', submit.bind(this));
            this.view.on('cancel', this.redirect.bind(this, '/member/list'));
        };

        require('er/util').inherits(MemberForm, Action);

        return MemberForm;
    }
);