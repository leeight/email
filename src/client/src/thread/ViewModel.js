/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var BaseModel = require('bat-ria/mvc/BaseModel');
    var api = require('common/config').api;
    var util = require('common/util');

    /**
     * [Please Input Model Description]
     *
     * @constructor
     */
    function ThreadViewModel() {
        BaseModel.apply(this, arguments);
    }


    /**
     * @inheritDoc
     */
    ThreadViewModel.prototype.datasource = {
        emails: function(model) {
            return api.readThread({id: model.get('id')}).then(function(emails){
                var size = emails.length;
                for(var i = 0; i < size; i ++) {
                    emails[i] = util.applyEMailPath(emails[i]);
                    if (i > 0) {
                        emails[i].hide_subject = true;
                    }
                    emails[i].collapse = (i < size - 1) && (emails[i].is_read === 1);

                }
                return emails;
            })
        }
    };

    ThreadViewModel.prototype.getEMailById = function(uidl) {
        var emails = this.get('emails');

        for(var i = 0; i < emails.length; i ++) {
            if (emails[i].uidl == uidl) {
                return emails[i];
            }
        }

        return null;
    };


    // return模块
    require('er/util').inherits(ThreadViewModel, BaseModel);
    return ThreadViewModel;
});
