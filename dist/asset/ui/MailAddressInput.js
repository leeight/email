define('ui/MailAddressInput', [
    'require',
    'esui/TextBox',
    'underscore',
    'esui/lib',
    'esui/InputControl',
    'esui/painters',
    'encoding/mail',
    'esui'
], function (require) {
    require('esui/TextBox');
    var u = require('underscore');
    var lib = require('esui/lib');
    var InputControl = require('esui/InputControl');
    var paint = require('esui/painters');
    var mail = require('encoding/mail');
    function MailAddressInput(options) {
        InputControl.apply(this, arguments);
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
        this.helper.addDOMEvent(input, 'keyup', removeLastItemIfPossible);
        this.getChild('input').on('enter', function (e) {
            processKeyboardEvent(this, mai);
        });
    };
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
    });
    require('esui').register(MailAddressInput);
    return MailAddressInput;
});