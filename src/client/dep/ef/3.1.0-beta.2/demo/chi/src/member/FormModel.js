define(
    function (require) {
        var UIModel = require('ef/UIModel');
        var datasource = require('er/datasource');

        function MemberFormModel() {
            UIModel.apply(this, arguments);

            var url = this.get('url');
            var config = require('./config');
            if (this.get('formType') === 'update') {
                this.datasource = {
                    Gender: datasource.constant(config.Gender),
                    detail: datasource.remote(
                        '/member/find', 
                        {
                            method: 'GET',
                            data: {
                                id: url.getQuery('id'),
                            }
                        }
                    ),
                    crumbPath: datasource.constant(
                        [{ text: '成员列表', href: '#/member/list' }]
                    )
                };
            }
            else {
                this.datasource = {
                    Gender: datasource.constant(config.Gender),
                    detail: datasource.constant({}),
                    crumbPath: datasource.constant(
                        [
                            { text: '成员列表', href: '#/member/list' },
                            { text: '新建成员' }
                        ]
                    )
                };
            }
        }

        MemberFormModel.prototype.prepare = function () {
            if (this.get('formType') === 'update') {
                var textLable = this.get('detail').name;
                var crumbPath = this.get('crumbPath');
                crumbPath.push({ text: textLable });
                this.set('crumbPath', crumbPath);
            }
        };

        MemberFormModel.prototype.saveOrUpdate = function (data) {
            this.fill(data);

            // Model里有很多其它的东西，比如`url`之类的，
            // 但送给服务器的只是表单提交的这些个字段，
            // 所以这里要用`getPart`只拿出一部分来
            var postData = this.getPart.apply(this, Object.keys(data));
            // update请求要多个id字段
            if (this.get('formType') === 'update') {
                var url = this.get('url');
                postData.id = url.getQuery('id');
            }

            var ajax = require('er/ajax');
            var url = this.get('formType') === 'update'
                ? '/member/update'
                : '/member/save';
            return ajax.post(url, postData);
        };

        // 对非字符串的字段进行一下处理
        MemberFormModel.prototype.formatters = {
            birthday: UIModel.formatters.date
        };

        require('er/util').inherits(MemberFormModel, UIModel);
        return MemberFormModel;
    }
);