define('ui/MailAddressInput', [
    'require',
    'esui/TextBox',
    'underscore',
    'esui/lib',
    'esui/InputControl',
    'esui/Layer',
    'esui/painters',
    'encoding/mail',
    'esui'
], function (require) {
    require('esui/TextBox');
    var u = require('underscore');
    var lib = require('esui/lib');
    var InputControl = require('esui/InputControl');
    var Layer = require('esui/Layer');
    var paint = require('esui/painters');
    var mail = require('encoding/mail');
    function selectLayerItem(e) {
        this.layer.hide();
        var target = e.target;
        while (target !== e.currentTarget && !lib.hasAttribute(target, 'data-index')) {
            target = target.parentNode;
        }
        if (target === e.currentTarget) {
            return;
        }
        var index = +target.getAttribute('data-index');
        var item = this.suggestions[index];
        this.addItem(item);
    }
    function MailAddressInputLayer() {
        Layer.apply(this, arguments);
        this.activeIndex = 0;
    }
    lib.inherits(MailAddressInputLayer, Layer);
    MailAddressInputLayer.prototype.nodeName = 'ul';
    MailAddressInputLayer.prototype.dock = {};
    MailAddressInputLayer.prototype.render = function (element) {
        var html = '';
        var suggestions = this.control.suggestions || [];
        for (var i = 0; i < suggestions.length; i++) {
            var classes = this.control.helper.getPartClasses('node');
            html += '<li data-index="' + i + '"' + ' class="' + classes.join(' ') + '">';
            html += this.control.getLayerItemHTML(suggestions[i]);
        }
        element.innerHTML = html;
        this.setActiveIndex(0);
    };
    MailAddressInputLayer.prototype.setActiveIndex = function (activeIndex) {
        var className = this.control.helper.getPartClasses('node-active');
        var element = this.getElement(false);
        if (element) {
            var child = element.children[this.activeIndex];
            if (child) {
                lib.removeClass(child, className);
            }
            child = element.children[activeIndex];
            if (child) {
                lib.addClass(child, className);
                this.activeIndex = activeIndex;
            }
        }
    };
    MailAddressInputLayer.prototype.activeNext = function () {
        var totalCount = (this.control.suggestions || []).length;
        if (totalCount <= 0) {
            return;
        }
        var activeIndex = (this.activeIndex + 1) % totalCount;
        this.setActiveIndex(activeIndex);
    };
    MailAddressInputLayer.prototype.activePrev = function () {
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
    function MailAddressInput(options) {
        InputControl.apply(this, arguments);
        this.layer = new MailAddressInputLayer(this);
    }
    lib.inherits(MailAddressInput, InputControl);
    MailAddressInput.defaultProperties = { width: 200 };
    MailAddressInput.prototype.type = 'MailAddressInput';
    function getMainHTML(mai) {
        var tpl = '<div class="${previewClass}" id="${previewId}">' + '<input ' + 'data-ui-id="${inputId}" ' + 'data-ui-child-name="input" ' + 'data-ui-width="100" ' + 'data-ui-type="TextBox" ' + 'type="text" />' + '</div>';
        var html = lib.format(tpl, {
                inputId: mai.helper.getId('input'),
                previewId: mai.helper.getId('preview'),
                previewClass: mai.helper.getPartClasses('preview')
            });
        return html;
    }
    MailAddressInput.prototype.getLayerItemHTML = function (item) {
        var data = {
                name: u.escape(item.name || item.email.replace(/@.*/, '')),
                email: u.escape(item.email),
                avatar: this.helper.getPartClasses('avatar'),
                msginf: this.helper.getPartClasses('msginf')
            };
        return lib.format('<div class="${avatar}"></div>' + '<div class="${msginf}">${name}<br /><span>${email}</span></div>', data);
    };
    MailAddressInput.prototype.initStructure = function () {
        this.main.innerHTML = getMainHTML(this);
        this.initChildren(this.main);
    };
    MailAddressInput.prototype.getFocusTarget = function () {
        return this.getChild('input').getFocusTarget();
    };
    MailAddressInput.prototype.initEvents = function () {
        var mai = this;
        var preview = lib.g(this.helper.getId('preview'));
        var input = lib.g(this.getChild('input').inputId);
        this.helper.addDOMEvent(preview, 'click', removeItemIfPossible);
        this.helper.addDOMEvent(input, 'keyup', dispatchKeyboradEvent);
        this.getChild('input').on('enter', function (e) {
            tryingAddNewItem(this, mai);
        });
        this.getChild('input').on('input', function (e) {
            mai.fire('input');
        });
    };
    function tryingAddNewItem(input, mai) {
        var suggestions = mai.suggestions;
        var activeIndex = mai.layer.activeIndex;
        if (suggestions && suggestions[activeIndex]) {
            var item = suggestions[activeIndex];
            mai.addItem({
                name: item.name,
                address: item.email
            });
            mai.layer.hide();
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
        };
    }
    function dispatchKeyboradEvent(e) {
        var keyCode = e.which || e.keyCode;
        if (keyCode === 186 || keyCode === 59) {
            tryingAddNewItem(this.getChild('input'), this);
            return;
        } else if (keyCode === 38) {
            this.layer.activePrev();
            return;
        } else if (keyCode === 40) {
            this.layer.activeNext();
            return;
        }
        var target = e.target;
        if (target.value) {
            target.dataset['empty'] = '0';
            return;
        }
        if (target.dataset['empty'] !== '1') {
            target.dataset['empty'] = '1';
            return;
        }
        if (keyCode === 8) {
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
    MailAddressInput.prototype.addItem = function (item) {
        var tpl = '<div class="${itemClass}" ' + 'title="${address}" data-name="${name}" ' + 'data-address="${address}">' + '<span>${name}</span><i>&nbsp;</i></div>';
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
    MailAddressInput.prototype.getRawValue = function () {
        var value = [];
        var preview = lib.g(this.helper.getId('preview'));
        var children = lib.getChildren(preview);
        u.each(children, function (child) {
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
    MailAddressInput.prototype.repaint = paint.createRepaint(InputControl.prototype.repaint, {
        name: ['rawValue'],
        paint: function (mai, rawValue) {
            u.each(rawValue, function (item) {
                mai.addItem(item);
            });
        }
    }, {
        name: 'suggestions',
        paint: function (mai) {
            if (!mai.suggestions || !mai.suggestions.length) {
                mai.layer.hide();
            } else {
                mai.layer.repaint();
                mai.layer.show();
            }
        }
    });
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