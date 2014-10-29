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
    var Layer = require('esui/Layer');
    var paint = require('esui/painters');
    var mail = require('encoding/mail');



    /**
     * 选中某一项
     *
     * @param {Event} e DOM事件对象
     * @ignore
     */
    function selectLayerItem(e) {
        this.layer.hide();

        var target = e.target;
        while (target !== e.currentTarget
            && !lib.hasAttribute(target, 'data-index')
        ) {
            target = target.parentNode;
        }

        if (target === e.currentTarget) {
            return;
        }

        var index = +target.getAttribute('data-index');
        var item = this.suggestions[index];
        this.addItem({name: item.name, address: item.email});
    }

    /**
     * MailAddressInput用浮层
     *
     * @extends Layer
     * @ignore
     * @constructor
     */
    function MailAddressInputLayer() {
        Layer.apply(this, arguments);

        this.activeIndex = 0;
    }
    lib.inherits(MailAddressInputLayer, Layer);

    MailAddressInputLayer.prototype.nodeName = 'ul';

    MailAddressInputLayer.prototype.dock = {
        // strictWidth: true
    };

    MailAddressInputLayer.prototype.render = function (element) {
        var html = '';

        var suggestions = this.control.suggestions || [];
        for (var i = 0; i < suggestions.length; i++) {
            var classes = this.control.helper.getPartClasses('node');
            suggestions[i].email = suggestions[i].address || suggestions[i].email;

            html += '<li data-index="' + i + '"'
                + ' class="' + classes.join(' ') + '">';
            html += this.control.getLayerItemHTML(suggestions[i]);
        }

        element.innerHTML = html;
        this.setActiveIndex(0);
    };

    MailAddressInputLayer.prototype.setActiveIndex = function(activeIndex) {
        // 设置为激活的状态
        var className = this.control.helper.getPartClasses('node-active');
        var element = this.getElement(false);
        if (element) {
            // 删除当前选中的
            var child = element.children[this.activeIndex];
            if (child) {
                lib.removeClass(child, className)
            }

            // 选中需要选中的
            child = element.children[activeIndex];
            if (child) {
                lib.addClass(child, className);
                this.activeIndex = activeIndex;
            }
        }
    }

    MailAddressInputLayer.prototype.activeNext = function() {
        var totalCount = (this.control.suggestions || []).length;
        if (totalCount <= 0) {
            return;
        }

        var activeIndex = (this.activeIndex + 1) % totalCount;
        this.setActiveIndex(activeIndex);
    };

    MailAddressInputLayer.prototype.activePrev = function() {
        var totalCount = (this.control.suggestions || []).length;
        if (totalCount <= 0) {
            return;
        }

        var activeIndex = 0;
        if (this.activeIndex === 0) {
            activeIndex = Math.max(0, totalCount - 1);
        } else {
            activeIndex = this.activeIndex - 1;
        }
        this.setActiveIndex(activeIndex);
    };

    MailAddressInputLayer.prototype.initBehavior = function (element) {
        this.control.helper.addDOMEvent(element, 'click', selectLayerItem);
    };

    /**
     * 邮箱地址输入控件
     *
     * @extends {InputControl}
     * @param {Object} options 初始化参数
     * @constructor
     */
    function MailAddressInput(options) {
        InputControl.apply(this, arguments);
        this.layer = new MailAddressInputLayer(this);
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
     * 控件类型，始终为`"MailAddressInput"`
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
     * 获取浮层中每一项的HTML
     *
     * @param {meta.CommandMenuItem} item 当前项的数据项
     * @return {string} 返回HTML片段
     */
    MailAddressInput.prototype.getLayerItemHTML = function (item) {
        var data = {
            name: u.escape(item.name || item.email.replace(/@.*/, '')),
            email: u.escape(item.email),
            avatar: this.helper.getPartClasses('avatar'),
            msginf: this.helper.getPartClasses('msginf')
        };
        return lib.format(
            '<div class="${avatar}"></div>' +
            '<div class="${msginf}">${name}<br /><span>${email}</span></div>',
            data);
    };

    /**
     * 初始化控件的结构
     */
    MailAddressInput.prototype.initStructure = function() {
        this.main.innerHTML = getMainHTML(this);
        this.initChildren(this.main);
    };

    MailAddressInput.prototype.getFocusTarget = function() {
        return this.getChild('input').getFocusTarget();
    };

    MailAddressInput.prototype.initEvents = function () {
        var mai = this;

        var preview = lib.g(this.helper.getId('preview'));
        var input = lib.g(this.getChild('input').inputId);
        this.helper.addDOMEvent(preview, 'click', removeItemIfPossible);
        this.helper.addDOMEvent(input, 'keyup', dispatchKeyboradEvent);
        this.getChild('input').on('enter', function(e) {
            tryingAddNewItem(this, mai);
        });
        this.getChild('input').on('input', function(e) {
            mai.fire('input');
        });
    };

    /**
     * 处理回车和;的事件
     * 1. 如果当前layer有选中的数据，优先使用layer选中的那条数据
     * 2. 否则试着解析input的内容，如果能解析成功的话，就用input的内容
     * 如果1和2都失败的话，那么什么也不做
     */
    function tryingAddNewItem(input, mai) {
        var suggestions = mai.suggestions;
        var activeIndex = mai.layer.activeIndex;
        if (suggestions && suggestions[activeIndex]) {
            var item = suggestions[activeIndex];
            mai.addItem({name: item.name, address: item.email});
            mai.set('suggestions', []);
            return;
        }

        var value = input.getValue();
        if (!value) {
            return;
        }

        var item = parseItem(value);
        if (item) {
            mai.addItem(item);
        }
    }

    /**
     * @param {string} value 需要解析的内容
     * @return {?{name:string,address:string}}
     */
    function parseItem(value) {
        var pattern = /((['"])?(.+)\2\s+)?<?([\-\w\.]+@[\-\w\.]+)>?(;+)?/;
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

    function dispatchKeyboradEvent(e) {
        var keyCode = e.which || e.keyCode;
        if (keyCode === 186 || keyCode === 59) {
            // 处理输入;的情况 Opera和Firefox是59，其它的浏览器是186
            tryingAddNewItem(this.getChild('input'), this);
            return;
        } else if (keyCode === 38) {
            // Arrow up
            this.layer.activePrev();
            return;
        } else if (keyCode === 40) {
            // Arrow down
            this.layer.activeNext();
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
        var tpl = '<div class="${itemClass}" ' +
            'title="${address}" data-name="${name}" ' +
            'data-address="${address}">' +
            '<span>${name}</span><i>&nbsp;</i></div>';

        var html = lib.format(tpl, {
            name: item.name || item.address.replace(/@.*/g, ''),
            address: item.address,
            itemClass: this.helper.getPartClasses('preview-item')
        });

        var reference = document.createElement('DIV');
        reference.innerHTML = html;

        var previewContainer = lib.g(this.helper.getId('preview'));
        lib.insertBefore(reference.firstChild, previewContainer.lastChild);


        this.getChild('input').setValue('');
        this.getFocusTarget().focus();
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
            },
            {
                /**
                 * @property {meta.MailAddressSuggestionItem[]} suggestions
                 *
                 * 数据源，其中每一项生成浮层中的一条
                 */
                name: 'suggestions',
                paint: function (mai) {
                    if (!mai.suggestions || !mai.suggestions.length) {
                        mai.layer.hide();
                    } else {
                        mai.layer.repaint();
                        mai.layer.show();
                    }
                }
            }
        );

    /**
     * 销毁控件
     *
     * @override
     */
    MailAddressInput.prototype.dispose = function () {
        if (this.helper.isInStage('DISPOSED')) {
            return;
        }

        if (this.layer) {
            this.layer.dispose();
            this.layer = null;
        }

        InputControl.prototype.dispose.apply(this, arguments);
    };

    require('esui').register(MailAddressInput);
    return MailAddressInput;
});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
