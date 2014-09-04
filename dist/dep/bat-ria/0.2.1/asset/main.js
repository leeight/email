define('bat-ria/main', [
    'require',
    'underscore',
    './util',
    'er/Deferred',
    'er/config',
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
    var Deferred = require('er/Deferred');
    function initApiConfig() {
        config.api = util.genRequesters(config.api);
    }
    function initErConfigs() {
        var erConfig = require('er/config');
        erConfig.indexURL = config.index;
        erConfig.systemName = config.systemName;
    }
    function loadData(extra) {
        extra = extra ? u.map(extra, function (api) {
            if (typeof api === 'string') {
                return util.genRequesters(api);
            } else {
                return api;
            }
        }) : [];
        var requests = [
                config.api.user,
                config.api.constants
            ].concat(extra || []);
        return Deferred.all.apply(Deferred, u.map(requests, function (requester) {
            return Deferred.when(requester());
        }));
    }
    function initData(session, constants) {
        var user = require('./system/user');
        user.init(session);
        var consts = require('./system/constants');
        var localConstants = require('common/constants');
        consts.init(u.extend(localConstants, constants));
        var extra = [].slice.call(arguments).slice(2);
        return Deferred.all.apply(Deferred, u.map(extra, function (result) {
            return Deferred.resolved(result);
        }));
    }
    function init() {
        initErConfigs();
        require('er').start();
    }
    function start(riaConfig, requesters, callback) {
        config = riaConfig;
        require('./extension/underscore').activate();
        require('./extension/hooks').activate(config.hooks);
        require('./extension/ui').activate();
        if (!(riaConfig.ext && riaConfig.ext.track === false)) {
            require('./extension/track').activate();
        }
        initApiConfig();
        return loadData(requesters).then(initData).then(callback).then(init);
    }
    return { start: start };
});

define('bat-ria', ['bat-ria/main'], function ( main ) { return main; });