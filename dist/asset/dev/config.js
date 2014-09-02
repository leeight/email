define('dev/config', [
    'require',
    'er/controller'
], function (require) {
    var actionsConfig = [{
                type: 'dev/Index',
                path: '/dev/index'
            }];
    var controller = require('er/controller');
    controller.registerAction(actionsConfig);
    var config = {};
    return config;
});