define(
    function (require) {
        var Model = require('er/Model');
        var datasource = require('er/datasource');

        function MemberListModel() {
            Model.apply(this, arguments);

            var url = this.get('url');
            this.datasource = {
                list: datasource.remote(
                    '/member/list', 
                    {
                        method: 'GET',
                        dataType: 'json',
                        data: {
                            page: url.getQuery('page'),
                            pageCount: url.getQuery('pageCount')
                        }
                    }
                )
            }
        };

        MemberListModel.prototype.removeData = function (id) {
            var postData = {id: id};
            var ajax = require('er/ajax');
            if (id) {
                return ajax.post('/member/remove', postData);
            }
        };

        require('er/util').inherits(MemberListModel, Model);
        return MemberListModel;
    }
);