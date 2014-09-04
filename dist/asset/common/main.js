define('common/main', [
    'require',
    'common/config',
    '../mail/config',
    '../dev/config',
    'ui/MailAddressInput',
    'common/notification',
    'bat-ria/system/user',
    'bat-ria/main'
], function (require) {
    var config = require('common/config');
    function requireConfigs() {
        require('../mail/config');
        require('../dev/config');
        require('ui/MailAddressInput');
    }
    requireConfigs();
    function init() {
        var notification = require('common/notification');
        notification.enable();
        var user = require('bat-ria/system/user');
        var visitor = user.visitor;
    }
    function start() {
        require('bat-ria/main').start(config).then(init);
    }
    return { start: start };
});