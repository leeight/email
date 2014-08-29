/**
 * @file src/ui/MailAddressInput.js ~ 2014/08/29 16:26:47
 * @author leeight(liyubei@baidu.com)
 * 方便输入邮箱地址的控件，获取内容的时候自动encode
 **/
define(function(require) {
    require('esui/TextBox');

    var u = require('underscore');
    var lib = require('esui/lib');
    var InputControl = require('esui/InputControl');
    var paint = require('esui/painters');
    var mail = require('encoding/mail');

    /**
     * 邮箱地址输入控件
     *
     * @extends {InputControl}
     * @param {Object} options 初始化参数
     * @constructor
     */
    function MailAddressInput(options) {
        InputControl.apply(this, arguments);
    }
    lib.inherits(MailAddressInput, InputControl);


    /**
     * @cfg defaultProperties
     *
     * 默认属性值
     *
     * @cfg {boolean} [defaultProperties.width=200] 默认宽度
     * @static
     */
    MailAddressInput.defaultProperties = {
        width: 200
    };

    /**
     * 控件类型，始终为`"TextBox"`
     *
     * @type {string}
     * @readonly
     * @override
     */
    MailAddressInput.prototype.type = 'MailAddressInput';

    function getMainHTML(mai) {
        var tpl =
            '<div class="${previewClass}" id="${previewId}">' +
                '<input ' +
                    'data-ui-id="${inputId}" ' +
                    'data-ui-child-name="input" ' +
                    'data-ui-width="100" ' +
                    'data-ui-type="TextBox" ' +
                    'type="text" />' +
            '</div>';

        var html = lib.format(tpl, {
            inputId: mai.helper.getId('input'),
            previewId: mai.helper.getId('preview'),
            previewClass: mai.helper.getPartClasses('preview')
        });

        return html;
    }

    /**
     * 初始化控件的结构
     */
    MailAddressInput.prototype.initStructure = function() {
        this.main.innerHTML = getMainHTML(this);
        this.initChildren(this.main);
    };

    MailAddressInput.prototype.initEvents = function () {
        var mai = this;

        var preview = lib.g(this.helper.getId('preview'));
        var input = lib.g(this.getChild('input').inputId);
        this.helper.addDOMEvent(preview, 'click', removeItemIfPossible);
        this.helper.addDOMEvent(input, 'keyup', removeLastItemIfPossible);
        this.getChild('input').on('enter', function(e) {
            processKeyboardEvent(this, mai);
        });
    };

    /**
     * 处理回车和;的事件
     */
    function processKeyboardEvent(input, mai) {
        var value = input.getValue();
        if (!value) {
            return;
        }

        var item = parseItem(value);
        if (item) {
            mai.addItem(item);
            input.setValue('');
        }
    }

    /**
     * @param {string} value 需要解析的内容
     * @return {?{name:string,address:string}}
     */
    function parseItem(value) {
        var pattern = /((['"])?(.+)\2\s+)?<?([\w\.]+@[\w\.]+)>?(;+)?/;
        var match = pattern.exec(value);
        if (!match) {
            return null;
        }

        var name = match[3];
        var address = match[4];
        if (!name) {
            name = address.replace(/@.*/g, '');
        }

        return {
            name: name,
            address: address
        }
    }

    function removeLastItemIfPossible(e) {
        var keyCode = e.which || e.keyCode;
        if (keyCode === 186) {
            processKeyboardEvent(this.getChild('input'), this);
            return;
        }

        var target = e.target;
        if (target.value) {
            target.dataset['empty'] = '0';
            return;
        }

        // 内容删光了，那么开始删除前面的一个啦？
        if (target.dataset['empty'] !== '1') {
            target.dataset['empty'] = '1';
            return;
        }

        if (keyCode === 8) {
            // backspace
            var previewContainer = lib.g(this.helper.getId('preview'));
            var reference = previewContainer.lastChild.previousSibling;
            if (reference && reference.nodeName !== 'INPUT') {
                lib.removeNode(reference);
            }
        }
    }

    function removeItemIfPossible(e) {
        var target = e.target || e.srcElement;
        if (target.nodeType !== 1 || target.nodeName !== 'I') {
            return;
        }

        lib.removeNode(target.parentNode);
    }

    /**
     * 添加一项啦
     * @param {{name:string,address:string}} item 需要添加的选项
     */
    MailAddressInput.prototype.addItem = function(item) {
        var tpl = '<div class="${itemClass}" data-name="${name}" data-address="${address}">' +
            '<span>${name}</span><i>&nbsp;</i></div>';

        var html = lib.format(tpl, {
            name: item.name,
            address: item.address,
            itemClass: this.helper.getPartClasses('preview-item')
        });

        var reference = document.createElement('DIV');
        reference.innerHTML = html;

        var previewContainer = lib.g(this.helper.getId('preview'));
        lib.insertBefore(reference.firstChild, previewContainer.lastChild);
    };


    /**
     * 获取输入控件的原始值，原始值的格式由控件自身决定
     *
     * @return {string}
     */
    MailAddressInput.prototype.getRawValue = function() {
        var value = [];
        var preview = lib.g(this.helper.getId('preview'));
        var children = lib.getChildren(preview);

        u.each(children, function(child) {
            if (child.nodeName !== 'DIV') {
                return;
            }

            var address = child.dataset['address'];
            var name = child.dataset['name'];
            value.push(mail.encodeAddress({
                name: name,
                address: address
            }));
        });

        return value.join('; ');
    };

    MailAddressInput.prototype.repaint =
        paint.createRepaint(
            InputControl.prototype.repaint,
            {
                name: [ 'rawValue' ],
                paint: function(mai, rawValue) {
                    u.each(rawValue, function(item){
                        mai.addItem(item);
                    });
                }
            }
        );
    require('esui').register(MailAddressInput);
    return MailAddressInput;
});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
