define([
    'require',
    'esui/lib',
    'esui/validator/Validity',
    'esui/Extension',
    'esui'
], function (require) {
    var lib = require('esui/lib');
    var Validity = require('esui/validator/Validity');
    var Extension = require('esui/Extension');
    function WordCount(options) {
        Extension.apply(this, arguments);
    }
    WordCount.prototype.type = 'WordCount';
    WordCount.prototype.initialTemplate = '\u6700\u591A\u53EF\u8F93\u5165${available}\u4E2A\u5B57\u7B26';
    WordCount.prototype.remainingTemplate = '\u8FD8\u53EF\u8F93\u5165${available}\u4E2A\u5B57\u7B26';
    WordCount.prototype.exceededTemplate = '\u5DF2\u8D85\u51FA${available}\u4E2A\u5B57\u7B26';
    WordCount.prototype.getHintMessage = function (data) {
        var template;
        if (!data.current) {
            template = this.initialTemplate;
        } else if (data.available >= 0) {
            template = this.remainingTemplate;
        } else {
            template = this.exceededTemplate;
            data.available = -data.available;
        }
        return lib.format(template, data);
    };
    WordCount.prototype.getMaxLength = function () {
        return this.target.get('maxLength') || this.target.get('length');
    };
    function checkLength() {
        var maxLength = this.getMaxLength();
        var currentLength = this.target.getValue().length;
        var data = {
                max: maxLength,
                current: currentLength,
                available: maxLength - currentLength
            };
        var validState = data.available < 0 ? 'error' : 'hint';
        var message = this.getHintMessage(data);
        var validity = new Validity();
        validity.setCustomValidState(validState);
        validity.setCustomMessage(message);
        this.target.showValidity(validity);
    }
    WordCount.prototype.activate = function () {
        var target = this.target;
        var maxLength = target.get('maxLength') || target.get('length');
        if (maxLength) {
            this.target.on('input', checkLength, this);
            this.target.on('afterrender', checkLength, this);
        }
        Extension.prototype.activate.apply(this, arguments);
    };
    WordCount.prototype.inactivate = function () {
        this.target.un('input', checkLength, this);
        this.target.un('afterrender', checkLength, this);
        Extension.prototype.inactivate.apply(this, arguments);
    };
    lib.inherits(WordCount, Extension);
    require('esui').registerExtension(WordCount);
    return WordCount;
});