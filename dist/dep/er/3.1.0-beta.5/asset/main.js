define('er/main', [
    'require',
    './controller',
    './router',
    './locator'
], function (require) {
    var main = {
            version: '3.1.0-beta.5',
            start: function () {
                require('./controller').start();
                require('./router').start();
                require('./locator').start();
            }
        };
    return main;
});

define('er', ['er/main'], function ( main ) { return main; });