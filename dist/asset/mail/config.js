define('mail/config', [
    'require',
    'er/controller'
], function (require) {
    var actionsConfig = [
            {
                type: 'mail/Compose',
                path: '/mail/compose'
            },
            {
                type: 'mail/View',
                path: '/mail/view'
            },
            {
                type: 'mail/Inbox',
                path: '/mail/inbox'
            }
        ];
    var controller = require('er/controller');
    controller.registerAction(actionsConfig);
    var config = {};
    return config;
});