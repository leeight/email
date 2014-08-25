/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var BaseModel = require('bat-ria/mvc/BaseModel');
    var datasource = require('er/datasource');
    var api = require('common/config').api;
    var batUtil = require('bat-ria/util');

    /**
     * [Please Input Model Description]
     * 
     * @constructor
     */
    function DevIndexModel() {
        BaseModel.apply(this, arguments);
    }


    /**
     * @inheritDoc
     */
    DevIndexModel.prototype.datasource = {
        actionList: function (model){
            return Object.keys(require('er/controller').actionPathMapping);
        }
    };


    // return模块
    require('er/util').inherits(DevIndexModel, BaseModel);
    return DevIndexModel;
});
