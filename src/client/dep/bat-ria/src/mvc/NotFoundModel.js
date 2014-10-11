/**
 * @file 404页 Model
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var util = require('er/util');
    var Model = require('er/Model');

    /**
     * 404页 Model
     *
     * @param {Object=} context 初始化时的数据
     *
     * @constructor
     * @extends er/Model
     */
    function NotFoundModel(context) {
        Model.call(this, context);
    }
    util.inherits(NotFoundModel, Model);

    return NotFoundModel;
});
