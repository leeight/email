define(
    function (require) {
        require('er/tpl!./list.tpl');
        require('esui/Table');
        require('esui/Button');
        require('esui/extension/Command');

        var Gender = require('./config').Gender;
        var tableFields = [
            {
                title: '成员',
                field: 'member' ,
                tip :'成员姓名',
                width: 50,
                content: function (item) {
                    return item.name;
                }
            },
            {
                title: '性别',
                field: 'gender' ,
                tip :'成员性别',
                width: 50,
                content: function (item) {
                    return Gender[item.gender];
                }
            },
            {
                title: '生日',
                field: 'birthday' ,
                tip :'成员的生日',
                width: 100,
                content: function (item) {
                    return item.birthday;
                }
            },
            {
                title: '余额',
                field: 'balance' ,
                tip :'开支后余额',
                width: 100,
                content: function (item) {
                    return item.balance;
                }
            },
            {
                title: '操作',
                width: 150,
                content: function (item) {
                    return '<a class="operation-modify" href="#/member/update~id=' + item.id + '">编辑</a>'
                        + ' | '
                        + '<span class ="operation-remove" data-command="remove" data-command-args="'
                        + item.id + '">删除</span>'
                }
            }
        ];

        var UIView = require('ef/UIView');

        function MemberListView() {
            UIView.apply(this, arguments);
        }

        MemberListView.prototype.template = 'memberListPage';

        MemberListView.prototype.uiProperties = {
            memberList: {
                fields: tableFields,
                sortable: false,
                columnResizable: true,
                subrow: false,
                followHead: true,
                selectMode: 'line'
            }
        };

        MemberListView.prototype.uiEvents = {
            'memberList:command': function (e) {
                if (e.name === 'modify') {
                    this.fire('modifyClicked', {id: e.args});
                }
                if (e.name === 'remove') {
                    this.fire('removeClicked', {args: e.args});
                }
            },
            
            'createButton:click': function (e) {
                this.fire('createNewMember');
            }
        };

        require('er/util').inherits(MemberListView, UIView);
        return MemberListView;
    }
);