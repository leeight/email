define(
    function (require) {
        var actions = [
            {
                path: '/',
                type: 'member/List'
            },
            {
                path: '/member/list',
                type: 'member/List'
            },
            {
                path: '/member/create',
                type: 'member/Form',
                args: { formType: 'create' }
            },
            {
                path: '/member/update',
                type: 'member/Form',
                args: { formType: 'update' }
            }
        ];

        var controller = require('er/controller');
        actions.forEach(controller.registerAction);

        var config = {};

        config.Gender = {
            MALE: 0,
            FEMALE: 1,
            UNKNOWN: 2,

            0: '女',
            1: '男',
            2: '保密'
        };

        return config;
    }
);