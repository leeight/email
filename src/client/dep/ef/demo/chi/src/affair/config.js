define(
    function (require) {
        var actions = [
            {
                path: '/',
                type: 'affair/List'
            },
            {
                path: '/affair/list',
                type: 'affair/List'
            },
            {
                path: '/affair/create',
                type: 'affair/Form',
                args: { formType: 'create' }
            },
            {
                path: '/affair/update',
                type: 'affair/Form',
                args: { formType: 'update' }
            }
        ];

        var controller = require('er/controller');
        actions.forEach(controller.registerAction);

        var config = {};
        config.AffairType = {
            'CONSUMPTION': 0,
            'DEPOSITE': 1,
            '0': '充值',
            '1': '支出'
        };

        return config;
    }
);