define([
    'require',
    'underscore',
    'er-track'
], function (require) {
    var u = require('underscore');
    function activate() {
        var track = require('er-track').create();
        track.use('baidu').setAccount('cac41f6b5121cfab7df3864bcdfe9e68');
        track.includeAll();
        track.start();
    }
    return { activate: u.once(activate) };
});