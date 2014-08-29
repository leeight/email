define('bat-ria/ui/Uploader', [
    'require',
    'esui/lib',
    'esui/controlHelper',
    'esui/validator/Validity',
    'esui/validator/ValidityState',
    'esui/InputControl',
    'underscore',
    './Image',
    'esui'
], function (require) {
    var lib = require('esui/lib');
    var helper = require('esui/controlHelper');
    var Validity = require('esui/validator/Validity');
    var ValidityState = require('esui/validator/ValidityState');
    var InputControl = require('esui/InputControl');
    var u = require('underscore');
    require('./Image');
    var FILE_TYPES = [
            'auto',
            'image',
            'flash'
        ];
    function Uploader(options) {
        InputControl.apply(this, arguments);
    }
    Uploader.prototype.type = 'Uploader';
    Uploader.defaultProperties = {
        width: 80,
        height: 25,
        fileType: 'image',
        method: 'POST',
        text: '\u70B9\u51FB\u4E0A\u4F20',
        overrideText: '\u91CD\u65B0\u4E0A\u4F20',
        busyText: '\u6B63\u5728\u4E0A\u4F20...',
        completeText: '\u4E0A\u4F20\u5B8C\u6210',
        unloadText: '\u672A\u9009\u62E9\u6587\u4EF6',
        preview: true,
        autoUpload: true
    };
    Uploader.prototype.createMain = function () {
        return document.createElement('div');
    };
    Uploader.prototype.filterAction = function (action) {
        return action;
    };
    Uploader.prototype.initOptions = function (options) {
        var properties = { action: '' };
        lib.extend(properties, Uploader.defaultProperties, options);
        if (lib.isInput(this.main)) {
            if (!options.accept) {
                properties.accept = lib.getAttribute(this.main, 'accept');
            }
            if (!options.name) {
                properties.name = this.main.name;
            }
        } else if (this.main.nodeName.toLowerCase() === 'form') {
            if (!options.action) {
                properties.action = this.main.action;
            }
            if (!options.method && lib.hasAttribute(this.main, 'method')) {
                properties.method = this.main.method;
            }
        }
        if (typeof properties.accept === 'string') {
            properties.accept = properties.accept.split(',');
        }
        if (properties.autoUpload === 'false') {
            properties.autoUpload = false;
        }
        properties.extraArgs = [];
        function buildExtraArgs(key, value) {
            properties[key] = value;
            properties.extraArgs.push({
                name: key,
                value: value
            });
        }
        var keyAndValues = [];
        if (properties.args) {
            if (typeof properties.args === 'string') {
                keyAndValues = properties.args.split('&');
                u.each(keyAndValues, function (keyAndValue) {
                    keyAndValue = keyAndValue.split('=');
                    if (keyAndValue.length === 2) {
                        buildExtraArgs(keyAndValue[0], keyAndValue[1]);
                    }
                });
            } else if (typeof properties.args === 'object') {
                for (var key in properties.args) {
                    buildExtraArgs(key, properties.args[key]);
                }
            }
        }
        if (!properties.hasOwnProperty('title') && this.main.title) {
            properties.title = this.main.title;
        }
        this.setProperties(properties);
    };
    Uploader.prototype.initStructure = function () {
        if (this.main.nodeName.toLowerCase() !== 'form') {
            helper.replaceMain(this);
        }
        this.callbackName = helper.getGUID('');
        if (!window.esuiShowUploadResult) {
            window.esuiShowUploadResult = {};
        }
        window.esuiShowUploadResult[this.callbackName] = lib.bind(this.showUploadResult, this);
        var inputContainerClasses = helper.getStateClasses(this, 'input-container').join(' ');
        var indicatorClasses = helper.getStateClasses(this, 'indicator').join(' ');
        var buttonClasses = helper.getStateClasses(this, 'button').join(' ');
        var labelClasses = helper.getStateClasses(this, 'label').join(' ');
        var iframeId = helper.getId(this, 'iframe');
        var html = [
                '<div id="' + helper.getId(this, 'input-container') + '" ',
                'class="' + inputContainerClasses + '">',
                '<span id="' + helper.getId(this, 'button') + '" ',
                'class="' + buttonClasses + '">',
                '</span>',
                '<input type="hidden" name="callback" ',
                'value="' + 'parent.esuiShowUploadResult[\'' + this.callbackName + '\']" ',
                '/>',
                '<input type="file" ',
                'id="' + helper.getId(this, 'input') + '" ',
                'size="1" ',
                'name="' + (this.dataKey ? this.dataKey : 'filedata') + '" ',
                '/>',
                '<input type="hidden" name="type" ',
                'value="' + this.typeIndex + '"',
                '/>'
            ];
        if (this.extraArgs) {
            u.each(this.extraArgs, function (arg) {
                html.push('<input type="hidden" name="' + arg.name + '" ', 'value="' + arg.value + '"', '/>');
            });
        }
        html.push('</div>', '<div id="' + helper.getId(this, 'indicator-wrapper') + '"', 'class="' + indicatorClasses + '">', '<span id="' + helper.getId(this, 'indicator') + '">', '</span>', '</div>', '<div id="' + helper.getId(this, 'label') + '"', 'class="' + labelClasses + '">' + this.unloadText + '</div>', '<iframe id="' + iframeId + '" name="' + iframeId + '"', ' src="about:blank"></iframe>');
        this.main.innerHTML = html.join('');
        var form = document.createElement('form');
        form.className = this.helper.getPartClassName('form');
        form.id = helper.getId(this, 'form');
        form.setAttribute('enctype', 'multipart/form-data');
        form.target = iframeId;
        document.body.appendChild(form);
        var input = lib.g(helper.getId(this, 'input'));
        helper.addDOMEvent(this, input, 'change', function () {
            if (input.value !== '') {
                this.receiveFile();
            }
        });
    };
    function setStateToComplete(info) {
        this.removeState('busy');
        this.fire('complete');
        this.addState('complete');
        this.addState('uploaded');
        var button = lib.g(helper.getId(this, 'button'));
        button.innerHTML = lib.encodeHTML(this.overrideText);
        var label = lib.g(helper.getId(this, 'label'));
        label.innerHTML = lib.encodeHTML(this.getFileName() || info.url);
        var validity = new Validity();
        this.showValidity(validity);
        this.fire('change');
        if (this.preview) {
            this.showPreview(info);
        }
        window.up = this;
    }
    Uploader.prototype.repaint = helper.createRepaint(InputControl.prototype.repaint, {
        name: [
            'method',
            'action'
        ],
        paint: function (uploader, method, action) {
            var form = uploader.helper.getPart('form');
            form.method = method;
            form.action = uploader.filterAction(action);
        }
    }, {
        name: [
            'text',
            'overrideText'
        ],
        paint: function (uploader, text, overrideText) {
            var button = lib.g(helper.getId(uploader, 'button'));
            var html = uploader.hasState('uploaded') ? lib.encodeHTML(overrideText) : lib.encodeHTML(text);
            button.innerHTML = html;
        }
    }, {
        name: [
            'busyText',
            'completeText'
        ],
        paint: function (uploader, busyText, completeText) {
            var indicator = lib.g(helper.getId(uploader, 'indicator'));
            var html = uploader.hasState('busy') ? lib.encodeHTML(busyText) : lib.encodeHTML(completeText);
            indicator.innerHTML = html;
        }
    }, {
        name: 'accept',
        paint: function (uploader, accept) {
            var input = lib.g(helper.getId(uploader, 'input'));
            if (accept) {
                lib.setAttribute(input, 'accept', accept.join(','));
            } else {
                lib.removeAttribute(input, 'accept');
            }
        }
    }, {
        name: [
            'disabled',
            'readOnly'
        ],
        paint: function (uploader, disabled, readOnly) {
            var input = lib.g(helper.getId(uploader, 'input'));
            input.disabled = disabled;
            input.readOnly = readOnly;
        }
    }, {
        name: [
            'width',
            'height'
        ],
        paint: function (uploader, width, height) {
            var widthWithUnit = width + 'px';
            var heightWithUnit = height + 'px';
            uploader.main.style.height = heightWithUnit;
            var container = lib.g(helper.getId(uploader, 'input-container'));
            container.style.width = widthWithUnit;
            container.style.height = heightWithUnit;
            var button = lib.g(helper.getId(uploader, 'button'));
            button.style.lineHeight = heightWithUnit;
            var indicatorWrapper = lib.g(helper.getId(uploader, 'indicator-wrapper'));
            indicatorWrapper.style.width = widthWithUnit;
            var indicator = lib.g(helper.getId(uploader, 'indicator'));
            indicator.style.lineHeight = heightWithUnit;
            var label = lib.g(helper.getId(uploader, 'label'));
            label.style.lineHeight = heightWithUnit;
        }
    }, {
        name: 'rawValue',
        paint: function (uploader, rawValue) {
            if (!rawValue) {
                return;
            }
            var type = uploader.fileType;
            uploader.fileInfo = {
                url: rawValue,
                type: type
            };
            setStateToComplete.call(uploader, uploader.fileInfo);
            uploader.removeState('complete');
        }
    });
    var mimeTypes = {
            image: {
                '.jpg': true,
                '.jpeg': true,
                '.gif': true,
                '.bmp': true,
                '.tif': true,
                '.tiff': true,
                '.png': true
            },
            flash: {
                '.flv': true,
                '.swf': true
            }
        };
    Uploader.prototype.checkFileFormat = function (filename) {
        if (this.accept) {
            var extension = filename.split('.');
            extension = '.' + extension[extension.length - 1].toLowerCase();
            var isValid = false;
            for (var i = 0; i < this.accept.length; i++) {
                var acceptPattern = this.accept[i].toLowerCase();
                if (acceptPattern === extension) {
                    isValid = true;
                    break;
                }
                if (acceptPattern.slice(-1)[0] === '*') {
                    var mimeType = acceptPattern.split('/')[0];
                    var targetExtensions = mimeTypes[mimeType];
                    if (targetExtensions && targetExtensions.hasOwnProperty(extension)) {
                        isValid = true;
                        break;
                    }
                }
            }
            if (!isValid) {
                var message = this.acceptErrorMessage || '\u4EC5\u63A5\u53D7\u4EE5\u4E0B\u6587\u4EF6\u683C\u5F0F\uFF1A' + this.accept.join(',');
                this.notifyFail(message);
            }
            return isValid;
        } else {
            return true;
        }
    };
    Uploader.prototype.submit = function () {
        this.showUploading();
        var inputs = this.helper.getPart('input-container');
        var form = this.helper.getPart('form');
        form.appendChild(inputs);
        form.submit();
        this.main.insertBefore(inputs, this.main.firstChild);
    };
    Uploader.prototype.receiveFile = function () {
        var input = lib.g(helper.getId(this, 'input'));
        var filename = input.value;
        if (this.checkFileFormat(filename)) {
            this.fire('receive');
            if (this.autoUpload) {
                this.submit();
            }
        }
    };
    Uploader.prototype.showUploading = function () {
        this.removeState('complete');
        this.addState('busy');
        var indicator = lib.g(helper.getId(this, 'indicator'));
        indicator.innerHTML = lib.encodeHTML(this.busyText);
    };
    Uploader.prototype.showUploadResult = function (options) {
        var result = options.result;
        if (options.success === false || options.success === 'false') {
            this.notifyFail(options.message);
        } else if (result) {
            if (!options.hasOwnProperty('type')) {
                options.result.type = this.fileType;
            } else if (typeof options.type === 'number') {
                options.result.type = FILE_TYPES[options.result.type];
            }
            this.fileInfo = result;
            this.rawValue = result.url || result.previewUrl || '';
            this.notifyComplete(options.result);
        }
    };
    Uploader.prototype.notifyFail = function (message) {
        this.fire('fail', message);
        message = message.upload || '\u4E0A\u4F20\u5931\u8D25';
        var validity = new Validity();
        var state = new ValidityState(false, message);
        validity.addState('upload', state);
        this.showValidity(validity);
        this.removeState('busy');
        this.reset();
    };
    Uploader.prototype.notifyComplete = function (info) {
        setStateToComplete.call(this, info);
        var indicator = lib.g(helper.getId(this, 'indicator'));
        indicator.innerHTML = lib.encodeHTML(this.completeText);
        this.timer = setTimeout(lib.bind(this.removeState, this, 'complete'), 1000);
    };
    Uploader.prototype.showPreview = function (info) {
        if (!info) {
            info = this.fileInfo;
        }
        if (this.previewContainer) {
            var container = this.viewContext.get(this.previewContainer);
            if (!container) {
                return;
            }
            var properties = {
                    imageType: info ? info.type : this.fileType || 'auto',
                    url: this.getPreviewUrl(),
                    width: info ? info.width : null,
                    height: info ? info.height : null
                };
            container.setProperties(properties);
        }
    };
    Uploader.prototype.getRawValueProperty = Uploader.prototype.getRawValue;
    Uploader.prototype.getFileName = function (url) {
        var input = lib.g(helper.getId(this, 'input'));
        var value;
        if (url) {
            value = url;
        } else {
            value = input.value;
        }
        return value.split('\\').pop() || '';
    };
    Uploader.prototype.getFileWidth = function () {
        return this.fileInfo ? this.fileInfo.width : -1;
    };
    Uploader.prototype.getFileHeight = function () {
        return this.fileInfo ? this.fileInfo.height : -1;
    };
    Uploader.prototype.getPreviewUrl = function () {
        return this.fileInfo ? this.fileInfo.previewUrl || this.fileInfo.url : '';
    };
    Uploader.prototype.getSessionToken = function () {
        return '';
    };
    Uploader.prototype.reset = function () {
        var input = lib.g(helper.getId(this, 'input'));
        input.value = '';
        return;
    };
    Uploader.prototype.dispose = function () {
        var form = this.helper.getPart('form');
        lib.removeNode(form);
        delete window.esuiShowUploadResult[this.callbackName];
        InputControl.prototype.dispose.apply(this, arguments);
    };
    lib.inherits(Uploader, InputControl);
    require('esui').register(Uploader);
    return Uploader;
});