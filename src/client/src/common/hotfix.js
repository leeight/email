/**
 * @file src/common/hotfix.js ~ 2014/11/06 10:24:29
 * @author leeight(liyubei@baidu.com)
 **/
define(function(require) {
var lib = require('esui/lib');
var esui = require('esui');

var exports = {};

var eventObject = null;

exports.init = function() {
    var main = lib.g('main');
    if (main && main.addEventListener) {
        main.addEventListener('click', function(e) {
            eventObject = e;
        }, true);
    }
};

esui.getEventObject = function() {
    return eventObject;
};

return exports;

});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
