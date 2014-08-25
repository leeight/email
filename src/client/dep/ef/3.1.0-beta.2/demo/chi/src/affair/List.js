define(
    function (require) {
        var Action = require('er/Action');

        function AffairList() {
            Action.apply(this, arguments);
        }

        AffairList.prototype.modelType = require('./ListModel');

        AffairList.prototype.viewType = require('./ListView');

        AffairList.prototype.initBehavior = function () {
            var action = this;
            this.view.on(
                'modify', 
                function (e) {
                    action.redirect('/affair/update~id=' + e.id);
                }
            );
            this.view.on(
                'create', 
                this.redirect.bind(this, '/affair/create')
            );
        };

        require('er/util').inherits(AffairList, Action);
        return AffairList;
    }
);