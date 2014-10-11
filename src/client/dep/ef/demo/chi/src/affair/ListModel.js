define(
    function (require) {
        var Model = require('er/Model');
        var datasource = require('er/datasource');

        function AffairListModel() {
            Model.apply(this, arguments);

            var url = this.get('url');
            this.datasource = {
                list: datasource.remote(
                    '/affair/list', 
                    {
                        method: 'GET',
                        data: {
                            page: url.getQuery('page') || 0,
                            pageSize: url.getQuery('pageSize') || 0
                        }
                    }
                )
            };
        }

        require('er/util').inherits(AffairListModel, Model);
        return AffairListModel;
    }
);