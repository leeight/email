/**
 * @file common/notification.js ~ 2014/09/03 10:42:44
 * @author leeight(liyubei@baidu.com)
 * 系统级别的提示
 **/
define(function(require) {
var Notification = window.Notification || window.mozNotification || window.webkitNotification;

var exports = {};
var instance = null;

/**
 * @param {string} title 提示的标题内容.
 * @param {string} body 提示的邮件内容.
 * @return {Notification}
 */
exports.show = function(title, body) {
    if (instance && instance.close) {
        instance.close();
    }
    instance = new Notification(title, { body: body });

    // instance.onclick = function() {
    //     // TODO
    // };

    // instance.onerror = function () {
    //   // Something to do
    // };

    // instance.onshow = function () {
    //   // Something to do
    // };

    // instance.onclose = function () {
    //   // Something to do
    // };

    return instance;
};

exports.enable = function() {
    Notification.requestPermission(function(permission) {
        // TODO
    });
};

return exports;
});











/* vim: set ts=4 sw=4 sts=4 tw=120: */
