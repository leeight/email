/**
 * ADM 2.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file Uploader控件
 * @author zhanglili(otakustay@gmail.com)
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var Validity = require('esui/validator/Validity');
        var ValidityState = require('esui/validator/ValidityState');
        var InputControl = require('esui/InputControl');
        var u = require('underscore');

        require('./Image');

        var FILE_TYPES = ['auto', 'image', 'flash'];

        /**
         * Uploader控件
         *
         * @param {Object=} options 初始化参数
         * @extends InputControl
         * @constructor
         * @public
         */
        function Uploader(options) {
            InputControl.apply(this, arguments);
        }

        Uploader.prototype.type = 'Uploader';

        /**
         * 默认属性
         *
         * @type {Object}
         * @public
         */
        Uploader.defaultProperties = {
            width: 80,
            height: 25,
            fileType: 'image',
            method: 'POST',
            text: '点击上传',
            overrideText: '重新上传',
            busyText: '正在上传...',
            completeText: '上传完成',
            unloadText: '未选择文件',
            preview: true,
            autoUpload: true
        };

        /**
         * 创建主元素
         *
         * @return {HTMLElement}
         * @override
         * @protected
         */
        Uploader.prototype.createMain = function () {
            return document.createElement('div');
        };

        /**
         * 修改action属性的过滤器（扩展点）
         *
         * @param {string} action 文件发送的表单action URL
         * @return {string} 修改后的URL
         */
        Uploader.prototype.filterAction = function (action) {
            return action;
        };

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        Uploader.prototype.initOptions = function (options) {
            var properties = {
                action: ''
            };
            lib.extend(properties, Uploader.defaultProperties, options);

            if (lib.isInput(this.main)) {
                if (!options.accept) {
                    properties.accept = lib.getAttribute(this.main, 'accept');
                }
                if (!options.name) {
                    properties.name = this.main.name;
                }
            }
            else if (this.main.nodeName.toLowerCase() === 'form') {
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

            // 会存在一些额外的参数配置
            properties.extraArgs = [];
            function buildExtraArgs(key, value) {
                // 如果有也是直接覆盖，args的优先级最高
                properties[key] = value;
                properties.extraArgs.push({
                    name: key,
                    value: value
                });
            }
            // 现在开始解析args
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
                }
                else if (typeof properties.args === 'object') {
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

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        Uploader.prototype.initStructure = function () {
            if (this.main.nodeName.toLowerCase() !== 'form') {
                helper.replaceMain(this);
            }

            // 往全局下加个函数，用于上传成功后回调
            // TODO: 抛弃IE7的话能改成`postMessage`实现
            this.callbackName = helper.getGUID('');
            if (!window.esuiShowUploadResult) {
                window.esuiShowUploadResult = {};
            }
            window.esuiShowUploadResult[this.callbackName] = lib.bind(this.showUploadResult, this);

            var inputContainerClasses =
                helper.getStateClasses(this, 'input-container').join(' ');
            var indicatorClasses =
                helper.getStateClasses(this, 'indicator').join(' ');
            var buttonClasses =
                helper.getStateClasses(this, 'button').join(' ');
            var labelClasses =
                helper.getStateClasses(this, 'label').join(' ');
            var iframeId = helper.getId(this, 'iframe');

            var html = [
                '<div id="' + helper.getId(this, 'input-container') + '" ',
                    'class="' + inputContainerClasses + '">',
                    // 按钮
                    '<span id="' + helper.getId(this, 'button') + '" ',
                        'class="' + buttonClasses + '">',
                    '</span>',
                    // 回调函数名
                    '<input type="hidden" name="callback" ',
                        'value="' + 'parent.esuiShowUploadResult[\'' + this.callbackName + '\']" ',
                    '/>',
                    // sessionToken
                    // '<input type="hidden" name="sessionToken" ',
                    //     'value="' + this.getSessionToken() + '" ',
                    // '/>',
                    // 文件上传框
                    '<input type="file" ',
                        'id="' + helper.getId(this, 'input') + '" ',
                        'size="1" ',
                        'name="' + (this.dataKey ? this.dataKey : 'filedata') + '" ',
                    '/>',
                    // 类型字段
                    '<input type="hidden" name="type" ',
                        'value="' + this.typeIndex + '"',
                    '/>'
            ];
            // 从附加参数里构造
            if (this.extraArgs) {
                u.each(this.extraArgs, function (arg) {
                    html.push(
                        '<input type="hidden" name="' + arg.name + '" ',
                            'value="' + arg.value + '"',
                        '/>'
                    );
                });
            }
            html.push(
                '</div>',
                // 指示器
                // 虽然`<progress>`更合适，但基本无法写样式，所以改用`<span>`
                '<div id="' + helper.getId(this, 'indicator-wrapper') + '"',
                    'class="' + indicatorClasses + '">',
                    '<span id="' + helper.getId(this, 'indicator') + '">',
                    '</span>',
                '</div>',
                '<div id="' + helper.getId(this, 'label') +
                    '"',
                    'class="' + labelClasses + '">' + this.unloadText +
                '</div>',
                // 用来偷偷上传的`<iframe>`元素
                '<iframe id="' + iframeId + '" name="' + iframeId + '"',
                ' src="about:blank"></iframe>'
            );


            // IE是不允许在一个`<form>`里有另一个`<form>`，
            // 并且设置内层`<form>`的`innerHTML`的，因此先移出去，设完了再回来
            // var nextSibling = this.main.nextSibling;
            // var parent = this.main.parentNode;
            // parent.removeChild(this.main);
            this.main.innerHTML = html.join('');
            // parent.insertBefore(this.main, nextSibling);

            // 放个表单在远放，有用
            var form = document.createElement('form');
            form.className = this.helper.getPartClassName('form');
            form.id = helper.getId(this, 'form');
            form.setAttribute('enctype', 'multipart/form-data');
            form.target = iframeId;
            document.body.appendChild(form);

            var input = lib.g(helper.getId(this, 'input'));
            helper.addDOMEvent(
                this,
                input,
                'change',
                function () {
                    if (input.value !== '') {
                        this.receiveFile();
                    }
                }
            );
        };

        /**
         * 转换为上传完成状态
         *
         * @param {Object} info 成功结果
         */
        function setStateToComplete(info) {
            this.removeState('busy');
            this.fire('complete');
            this.addState('complete');

            // 下次再上传的提示文字要变掉
            this.addState('uploaded');
            var button = lib.g(helper.getId(this, 'button'));
            button.innerHTML = lib.encodeHTML(this.overrideText);

            var label = lib.g(helper.getId(this, 'label'));
            label.innerHTML = lib.encodeHTML(this.getFileName() || info.url);

            // 清掉可能存在的错误信息
            var validity = new Validity();
            this.showValidity(validity);

            this.fire('change');
            if (this.preview) {
                this.showPreview(info);
            }

            window.up = this;
        }

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        Uploader.prototype.repaint = helper.createRepaint(
            InputControl.prototype.repaint,
            {
                name: ['method', 'action'],
                paint: function (uploader, method, action) {
                    var form = uploader.helper.getPart('form');
                    form.method = method;
                    form.action = uploader.filterAction(action);
                }
            },
            {
                name: ['text', 'overrideText'],
                paint: function (uploader, text, overrideText) {
                    var button = lib.g(helper.getId(uploader, 'button'));
                    var html = uploader.hasState('uploaded')
                        ? lib.encodeHTML(overrideText)
                        : lib.encodeHTML(text);
                    button.innerHTML = html;
                }
            },
            {
                name: ['busyText', 'completeText'],
                paint: function (uploader, busyText, completeText) {
                    var indicator = lib.g(helper.getId(uploader, 'indicator'));
                    var html = uploader.hasState('busy')
                        ? lib.encodeHTML(busyText)
                        : lib.encodeHTML(completeText);
                    indicator.innerHTML = html;
                }
            },
            {
                name: 'accept',
                paint: function (uploader, accept) {
                    var input = lib.g(helper.getId(uploader, 'input'));
                    if (accept) {
                        lib.setAttribute(input, 'accept', accept.join(','));
                    }
                    else {
                        lib.removeAttribute(input, 'accept');
                    }
                }
            },
            {
                name: ['disabled', 'readOnly'],
                paint: function (uploader, disabled, readOnly) {
                    var input = lib.g(helper.getId(uploader, 'input'));
                    input.disabled = disabled;
                    input.readOnly = readOnly;
                }
            },
            {
                name: ['width', 'height'],
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
            },
            {
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
                    // 不需要停留在完成提示
                    uploader.removeState('complete');
                }
            }
        );

        var mimeTypes = {
            image: {
                '.jpg': true, '.jpeg': true, '.gif': true,
                '.bmp': true, '.tif': true, '.tiff': true, '.png': true
            },

            flash: {
                '.flv': true, '.swf': true
            }
        };

        /**
         * 检查文件格式是否正确，不正确时直接提示
         *
         * @param {string} filename 上传的文件的文件名
         * @return {boolean}
         * @protected
         */
        Uploader.prototype.checkFileFormat = function (filename) {
            if (this.accept) {
                // 这里就是个内置的`Rule`，走的完全是标准的验证流程，
                // 主要问题是上传控件不能通过`getValue()`获得验证用的内容，
                // 因此把逻辑写在控件内部了
                var extension = filename.split('.');
                extension = '.' + extension[extension.length - 1].toLowerCase();

                var isValid = false;
                for (var i = 0; i < this.accept.length; i++) {
                    var acceptPattern = this.accept[i].toLowerCase();
                    if (acceptPattern === extension) {
                        isValid = true;
                        break;
                    }

                    // image/*之类的，表示一个大类
                    if (acceptPattern.slice(-1)[0] === '*') {
                        var mimeType = acceptPattern.split('/')[0];
                        var targetExtensions = mimeTypes[mimeType];
                        if (targetExtensions
                            && targetExtensions.hasOwnProperty(extension)
                        ) {
                            isValid = true;
                            break;
                        }
                    }
                }

                if (!isValid) {
                    var message = this.acceptErrorMessage
                        || '仅接受以下文件格式：' + this.accept.join(',');
                    this.notifyFail(message);
                }

                return isValid;
            }
            else {
                return true;
            }
        };

        /**
         * 提交文件上传
         */
        Uploader.prototype.submit = function () {
            // IE有个BUG，如果在一个`<form>`中有另一个`<form>`，
            // 那么就不能修改内层`<form>`的`innerHTML`值，
            // 因此我们把内层`<form>`单独写在某个地方，
            // 当需要提交时，把所有的`<input>`丢到这个`<form>`下，
            // 提交完毕后再拿回来
            this.showUploading();
            var inputs = this.helper.getPart('input-container');
            var form = this.helper.getPart('form');
            form.appendChild(inputs);
            form.submit();
            this.main.insertBefore(inputs, this.main.firstChild);
        };

        /**
         * 上传文件
         *
         * @protected
         */
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

        /**
         * 提示用户正在上传
         *
         * @protected
         */
        Uploader.prototype.showUploading = function () {
            this.removeState('complete');
            this.addState('busy');

            var indicator = lib.g(helper.getId(this, 'indicator'));
            indicator.innerHTML = lib.encodeHTML(this.busyText);
        };

        /**
         * 显示上传结果
         *
         * @param {Object} options 上传结果
         * @protected
         */
        Uploader.prototype.showUploadResult = function (options) {
            // 如果成功，`options`格式为：
            // {
            //    "success" : "true",
            //    "message" : {},
            //    "result" : {
            //        "keywordPackagePath" : "231"
            //    } 
            // }
            //
            // 如果上传失败，`options`必须是以下格式
            // {
            //    "success" : "false",
            //    "message" : {
            //         "upload" : "error message"
            //    }
            // }

            var result = options.result;
            if (options.success === false || options.success === 'false') {
                this.notifyFail(options.message);
            }
            else if (result) {
                if (!options.hasOwnProperty('type')) {
                    options.result.type = this.fileType;
                }
                else if (typeof options.type === 'number') {
                    options.result.type = FILE_TYPES[options.result.type];
                }

                this.fileInfo = result;
                this.rawValue = result.url || result.previewUrl || '';
                this.notifyComplete(options.result);
            }
        };

        /**
         * 通知上传失败
         *
         * @param {string} message 失败消息
         * @protected
         */
        Uploader.prototype.notifyFail = function (message) {
            this.fire('fail', message);
            message = message.upload || '上传失败';
            var validity = new Validity();
            var state = new ValidityState(false, message);
            validity.addState('upload', state);
            this.showValidity(validity);
            this.removeState('busy');
            this.reset();
        };

        /**
         * 通知上传完成
         *
         * @param {Object} info 成功结果
         * @protected
         */
        Uploader.prototype.notifyComplete = function (info) {
            setStateToComplete.call(this, info);

            // 提示已经完成
            var indicator = lib.g(helper.getId(this, 'indicator'));
            indicator.innerHTML = lib.encodeHTML(this.completeText);
            // 一定时间后回到可上传状态
            this.timer = setTimeout(
                lib.bind(this.removeState, this, 'complete'),
                1000
            );
        };

        /**
         * 显示预览
         *
         * @param {Object} info 预览信息
         * @protected
         */
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
                    imageType: info ? info.type : (this.fileType || 'auto'),
                    url: this.getPreviewUrl(),
                    width: info ? info.width : null,
                    height: info ? info.height : null
                };
                container.setProperties(properties);
            }
        };

        // /**
        //  * 获取作为`InputControl`时的数据，只需返回上传成功后得到的URL即可
        //  *
        //  * @return {string} 上传成功文件的URL
        //  */
        // Uploader.prototype.getRawValue = function () {
        //     return this.fileInfo.url || this.fileInfo.previewUrl || '';
        // };

        Uploader.prototype.getRawValueProperty = Uploader.prototype.getRawValue;

        /**
         * 获取用户选择的文件名
         *
         * @return {string}
         */
        Uploader.prototype.getFileName = function (url) {
            var input = lib.g(helper.getId(this, 'input'));
            var value;
            if (url) {
                value = url;
            }
            else {
                value = input.value;
            }
            return value.split('\\').pop() || '';
        };

        /**
         * 获取上传的文件的宽度，只有成功上传后才能获取
         *
         * @return {number}
         * @protected
         */
        Uploader.prototype.getFileWidth = function () {
            return this.fileInfo ? this.fileInfo.width : -1;
        };

        /**
         * 获取上传的文件的高度，只有成功上传后才能获取
         *
         * @return {number}
         * @protected
         */
        Uploader.prototype.getFileHeight = function () {
            return this.fileInfo ? this.fileInfo.height : -1;
        };

        /**
         * 获取上传的文件的预览URL，只有成功上传后才能获取
         *
         * @return {string}
         * @protected
         */
        Uploader.prototype.getPreviewUrl = function () {
            return this.fileInfo ? (this.fileInfo.previewUrl || this.fileInfo.url) : '';
        };

        /**
         * 获取反CSRF的Token
         *
         * @return {string}
         * @protected
         */
        Uploader.prototype.getSessionToken = function () {
            return '';
        };

        /**
         * 清空input文件内容
         */
        Uploader.prototype.reset = function () {
            var input = lib.g(helper.getId(this, 'input'));
            input.value = '';

            return;
        };

        /**
         * 销毁控件
         *
         * @override
         */
        Uploader.prototype.dispose = function () {
            var form = this.helper.getPart('form');
            lib.removeNode(form);
            delete window.esuiShowUploadResult[this.callbackName];

            InputControl.prototype.dispose.apply(this, arguments);
        };

        lib.inherits(Uploader, InputControl);
        require('esui').register(Uploader);
        return Uploader;
    }
);
