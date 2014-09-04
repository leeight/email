define([
    'require',
    'underscore',
    './util',
    'er/config',
    'er/Deferred',
    './system/user',
    './system/constants',
    'common/constants',
    'er',
    './extension/underscore',
    './extension/hooks',
    './extension/ui',
    './extension/track'
], function (require) {
    var config = {};
    var u = require('underscore');
    var util = require('./util');
    function initApiConfig() {
        config.api = util.genRequesters(config.api);
    }
    function initErConfigs() {
        var erConfig = require('er/config');
        erConfig.indexURL = config.index;
        erConfig.systemName = config.systemName;
    }
    function loadData() {
        var Deferred = require('er/Deferred');
        return Deferred.all();
    }
    function initData(session, constants) {
        var user = require('./system/user');
        user.init(session);
        var consts = require('./system/constants');
        var localConstants = require('common/constants');
        consts.init(u.extend(localConstants, constants));
    }
    function init() {
        initErConfigs();
        require('er').start();
    }
    function start(riaConfig) {
        config = riaConfig;
        require('./extension/underscore').activate();
        require('./extension/hooks').activate(config.hooks);
        require('./extension/ui').activate();
        if (!(riaConfig.ext && riaConfig.ext.track === false)) {
            require('./extension/track').activate();
        }
        initApiConfig();
        return loadData().then(init);
    }
    return { start: start };
});