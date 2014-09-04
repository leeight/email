define('common/notification', ['require'], function (require) {
    var Notification = window.Notification || window.mozNotification || window.webkitNotification;
    var exports = {};
    var instance = null;
    exports.show = function (title, body) {
        if (instance && instance.close) {
            instance.close();
        }
        instance = new Notification(title, { body: body });
        setTimeout(function () {
            if (instance.close) {
                instance.close();
            }
        }, 5000);
        return instance;
    };
    exports.enable = function () {
        Notification.requestPermission(function (permission) {
        });
    };
    return exports;
});