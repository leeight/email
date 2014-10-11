define(
    function (require) {
        var UIModel = require('ef/UIModel');
        var datasource = require('er/datasource');

        var types = [
            {
                text: '充值',
                value: 0
            },
            {
                text: '支出',
                value: 1
            }
        ];

        function AffairFormModel() {
            UIModel.apply(this, arguments);

            var url = this.get('url');

            this.datasource = {
                members: datasource.remote(
                    '/member/list', 
                    { method: 'GET' }
                ),
                types: datasource.constant(types)
            };

            if (this.get('formType') === 'update') {

                this.datasource.detail = datasource.remote(
                    '/affair/find', 
                    {
                        method: 'GET',
                        data: {
                            id: url.getQuery('id'),
                        }
                    }
                );
            }
            else {
                var detail = { balance: 0, member: {} };
                this.datasource.detail = datasource.constant(detail);
            }
        }

        AffairFormModel.prototype.prepare = function () {
            var members = this.get('members').results;
            var list = members.map(
                function (m) { return { text: m.name, value: m.id } });
            this.set('members', list);
        }

        AffairFormModel.prototype.save = function(data) {
            this.fill(data);

            var postData = this.getPart.apply(this, Object.keys(data));
            // update请求要多个id字段
            if (this.get('formType') === 'update') {
                var url = this.get('url');
                postData.id = url.getQuery('id');
            }

            var ajax = require('er/ajax');
            var url = this.get('formType') === 'update'
                ? '/affair/update'
                : '/affair/save';
            return ajax.post(url, postData);
        };

        AffairFormModel.prototype.formatters = {
            time: UIModel.formatters.time
        };

        require('er/util').inherits(AffairFormModel, UIModel);
        return AffairFormModel;
    }
);