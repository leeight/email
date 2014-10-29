/**
 * @file common/netdisk.js ~ 2014/10/23 16:32:52
 * @author leeight(liyubei@baidu.com)
 **/
define(function(require) {
var Deferred = require('er/Deferred');

var kApiKey = 'sO9daRmMp9hY6GZ0WfGTfZX1';
var kScope = 'netdisk';

var exports = {};

function getAuthorizationCodeUrl() {
    return 'http://openapi.baidu.com/oauth/2.0/authorize?' +
      'response_type=code&' +
      'client_id=' + kApiKey + '&' +
      'redirect_uri=http%3A%2F%2F' + encodeURIComponent(location.host) + '%2Fapi%2Fpcs%2Foauth_redirect&' +
      'scope=' + kScope + '&' +
      'display=popup';
}


var wHandle = null;
exports.auth = function() {
    var defer = new Deferred();

    if (!wHandle || wHandle.closed) {
        var url = getAuthorizationCodeUrl();
        wHandle = window.open(url, "netdisk", "height=490,width=860");
    }
    else {
        wHandle.focus();
    }

    return defer.promise;
};

return exports;

});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
