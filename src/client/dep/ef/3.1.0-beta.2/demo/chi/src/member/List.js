define(
    function (require) {
        var Action = require('er/Action');
        function MemberList() {
            Action.apply(this, arguments);
        }

        MemberList.prototype.modelType = require('./ListModel');

        MemberList.prototype.viewType = require('./ListView');

        function findWhatByID(results, id, what) {
            for (var i = 0; i < results.length; i++) {
                if (results[i].id === parseInt(id)) {
                    return results[i][what];
                }
            }
        }

        function removeByID(id) {
            this.model.removeData(id).then(removeCallBack.bind(this));
        }

        function removeCallBack() {
            var options = {
                force: true
            };
            var locator = require('er/locator');
            locator.reload();
        }

        MemberList.prototype.initBehavior = function () {
            var action = this;
            var Dialog = require('esui/Dialog');
            this.view.on('removeClicked', function (e) {
                var name = findWhatByID(
                    action.model.get('list').results,
                    e.args, 
                    'name'
                );
                Dialog.confirm({
                        title: '删除成员警告',
                        content: '是否确定删除成员：' + name,
                        onok: removeByID.bind(action, e.args),
                        oncancel: function(dialog) {
                        },
                        width: 400
                    });
            });
            this.view.on('modifyClicked', function (e) {
                action.redirect('/member/update~id=' + e.id);
            });
            this.view.on('createNewMember', function (e) {
                action.redirect('/member/create');
            });
        };

        require('er/util').inherits(MemberList, Action);
        return MemberList;
    }
);