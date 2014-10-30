/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var FormAction = require('bat-ria/mvc/FormAction');

    /**
     * Action构造函数
     * 
     * @constructor
     */
    function UserSettings() {
        FormAction.apply(this, arguments);
    }

    UserSettings.prototype.modelType = require('./SettingsModel');
    UserSettings.prototype.viewType = require('./SettingsView');

    /**
     * inheritDoc
     *
     * @protected
     * @override
     */
    UserSettings.prototype.initBehavior = function () {
        FormAction.prototype.initBehavior.apply(this, arguments);

        // bind event handlers here
    };

    require('er/util').inherits(UserSettings, FormAction);
    return UserSettings;
});
