define('esui/Dialog', [
    'require',
    './Button',
    './Panel',
    './lib',
    './controlHelper',
    './Control',
    './main'
], function (require) {
    require('./Button');
    require('./Panel');
    var lib = require('./lib');
    var helper = require('./controlHelper');
    var Control = require('./Control');
    var ui = require('./main');
    var maskIdPrefix = 'ctrl-mask';
    function Dialog(options) {
        Control.apply(this, arguments);
    }
    function parseMain(options) {
        var main = options.main;
        if (!main) {
            return;
        }
        var els = lib.getChildren(main);
        var len = els.length;
        var roleName;
        var roles = {};
        while (len--) {
            roleName = els[len].getAttribute('data-role');
            if (roleName) {
                roles[roleName] = els[len];
            }
        }
        options.roles = roles;
    }
    function createHead(control, mainDOM) {
        var title = 'title';
        var close = 'close-icon';
        var closeTpl = '<div class="${clsClass}" id="${clsId}">&nbsp;</div>';
        var closeIcon = '';
        if (control.closeButton) {
            closeIcon = lib.format(closeTpl, {
                'clsId': helper.getId(control, close),
                'clsClass': helper.getPartClasses(control, close).join(' ')
            });
        }
        var headTpl = '' + '<div id="${titleId}" class="${titleClass}">' + '</div>' + '${closeIcon}';
        var headClasses = [].concat(helper.getPartClasses(control, 'head'));
        var headData = {
                'titleId': helper.getId(control, title),
                'titleClass': helper.getPartClasses(control, title).join(' '),
                'closeIcon': closeIcon
            };
        var headHtml = lib.format(headTpl, headData);
        if (mainDOM) {
            control.title = mainDOM.innerHTML;
        } else {
            mainDOM = document.createElement('div');
            if (control.main.firstChild) {
                lib.insertBefore(mainDOM, control.main.firstChild);
            } else {
                control.main.appendChild(mainDOM);
            }
        }
        mainDOM.innerHTML = headHtml;
        lib.addClasses(mainDOM, headClasses);
        var properties = {
                main: mainDOM,
                renderOptions: control.renderOptions
            };
        var panel = ui.create('Panel', properties);
        panel.render();
        control.addChild(panel, 'head');
        return panel;
    }
    function closeClickHandler() {
        var event = this.fire('beforeclose');
        if (event.isDefaultPrevented()) {
            return false;
        }
        this.hide();
        this.fire('close');
        if (this.closeOnHide) {
            this.dispose();
        }
    }
    var getResizeHandler;
    function resizeHandler() {
        var page = lib.page;
        var main = this.main;
        var left = this.left;
        var top = this.top;
        var right = this.right;
        var bottom = this.bottom;
        if (left === undefined || left === null) {
            left = (page.getViewWidth() - main.offsetWidth) / 2;
        }
        if (left < 0) {
            left = 0;
        }
        if (top === undefined || top === null) {
            top = (page.getViewHeight() - main.offsetHeight) / 2;
        }
        top = Math.max(top, 0);
        main.style.left = left + 'px';
        main.style.top = page.getScrollTop() + top + 'px';
        if (right !== undefined && right !== null) {
            main.style.right = right + 'px';
        }
        if (bottom !== undefined && bottom !== null) {
            main.style.bottom = bottom + 'px';
        }
        if (this.height === 'auto') {
            var height = page.getViewHeight() - top;
            main.style.height = height + 'px';
            var body = this.getBody().main;
            var header = this.getHead().main;
            var headerHeight = parseInt(lib.getStyle(header, 'height'), 10);
            body.style.height = height - headerHeight + 'px';
        }
    }
    function initDragHandler(dialog, unbind) {
        var me = dialog;
        var head = dialog.getChild('head').main;
        if (unbind === true) {
            helper.removeDOMEvent(me, head, 'mousedown', dialogHeadDownHandler);
        } else {
            helper.addDOMEvent(me, head, 'mousedown', dialogHeadDownHandler);
        }
    }
    function makeUnselectable(dialog, node, unselected) {
        if (unselected) {
            helper.addDOMEvent(dialog, node, 'selectstart', function (e) {
                e.preventDefault();
            });
        } else {
            helper.removeDOMEvent(dialog, node, 'selectstart');
        }
    }
    function dialogHeadDownHandler(e) {
        var button = e.button;
        var isLeft = false;
        if (!e.which && button === 1 || e.which === 1) {
            isLeft = true;
        }
        if (!isLeft) {
            return;
        }
        var doc = document;
        this.addState('dragging');
        makeUnselectable(this, this.main, true);
        helper.addDOMEvent(this, doc, 'mousemove', dialogHeadMoveHandler);
        helper.addDOMEvent(this, doc, 'mouseup', dialogHeadUpHandler);
        lib.event.getMousePosition(e);
        this.dragStartPos = {
            x: e.pageX,
            y: e.pageY
        };
    }
    function dialogHeadMoveHandler(e) {
        var me = this;
        lib.event.getMousePosition(e);
        var movedDistance = {
                x: e.pageX - me.dragStartPos.x,
                y: e.pageY - me.dragStartPos.y
            };
        me.dragStartPos = {
            x: e.pageX,
            y: e.pageY
        };
        var main = me.main;
        var mainPos = lib.getOffset(main);
        var curMainLeft = mainPos.left + movedDistance.x;
        var curMainTop = mainPos.top + movedDistance.y;
        var pageWidth = lib.page.getWidth();
        var pageHeight = lib.page.getHeight();
        var offset = lib.getOffset(main);
        if (curMainTop < 0) {
            curMainTop = 0;
        } else if (curMainTop > pageHeight - offset.height) {
            curMainTop = pageHeight - offset.height;
        }
        if (curMainLeft < 0) {
            curMainLeft = 0;
        } else if (curMainLeft > pageWidth - offset.width) {
            curMainLeft = pageWidth - offset.width;
        }
        main.style.left = curMainLeft + 'px';
        main.style.top = curMainTop + 'px';
    }
    function dialogHeadUpHandler(e) {
        helper.removeDOMEvent(this, document, 'mousemove', dialogHeadMoveHandler);
        helper.removeDOMEvent(this, document, 'mouseup', dialogHeadUpHandler);
        this.removeState('dragging');
        makeUnselectable(this, this.main, false);
    }
    function showMask(dialog, zIndex) {
        var mask = getMask(dialog);
        var clazz = [];
        var maskClass = helper.getPartClasses(dialog, 'mask').join(' ');
        clazz.push(maskClass);
        mask.className = clazz.join(' ');
        mask.style.display = 'block';
        mask.style.zIndex = zIndex;
    }
    function hideMask(dialog) {
        var mask = getMask(dialog);
        if ('undefined' != typeof mask) {
            lib.removeNode(mask);
        }
    }
    function initMask(maskId) {
        var el = document.createElement('div');
        el.id = maskId;
        document.body.appendChild(el);
    }
    function getMask(control) {
        var dialogId = helper.getId(control);
        var id = maskIdPrefix + '-' + dialogId;
        var mask = lib.g(id);
        if (!mask) {
            initMask(id);
        }
        return lib.g(id);
    }
    Dialog.OK_TEXT = '\u786E\u5B9A';
    Dialog.CANCEL_TEXT = '\u53D6\u6D88';
    Dialog.prototype = {
        type: 'Dialog',
        initOptions: function (options) {
            parseMain(options);
            var properties = {
                    closeButton: true,
                    closeOnHide: true,
                    draggable: false,
                    mask: true,
                    title: '\u6211\u662F\u6807\u9898',
                    content: '<p>\u6211\u662F\u5185\u5BB9</p>',
                    defaultFoot: '' + '<div ' + 'class="' + this.helper.getPartClassName('ok-btn') + '" data-ui="type:Button;id:btnFootOk;' + 'childName:btnOk;skin:spring;">\u786E\u5B9A</div>' + '<div ' + 'class="' + this.helper.getPartClassName('cancel-btn') + '" ' + 'data-ui="type:Button;' + 'id:btnFootCancel;childName:btnCancel;">\u53D6\u6D88</div>',
                    needFoot: true,
                    roles: {}
                };
            if (options.closeOnHide === 'false') {
                options.closeOnHide = false;
            }
            if (options.closeButton === 'false') {
                options.closeButton = false;
            }
            if (options.mask === 'false') {
                options.mask = false;
            }
            if (options.needFoot === 'false') {
                options.needFoot = false;
            }
            lib.extend(properties, options);
            if (properties.needFoot) {
                if (!properties.foot) {
                    properties.foot = properties.defaultFoot;
                }
            }
            this.setProperties(properties);
        },
        initStructure: function () {
            var main = this.main;
            if (main.parentNode && main.parentNode.nodeName.toLowerCase() !== 'body') {
                document.body.appendChild(main);
            }
            this.addState('hidden');
            createHead(this, this.roles.title);
            this.createBF('body', this.roles.content);
            if (this.needFoot) {
                this.createBF('foot', this.roles.foot);
            }
        },
        initEvents: function () {
            if (this.closeButton) {
                var close = lib.g(helper.getId(this, 'close-icon'));
                if (close) {
                    helper.addDOMEvent(this, close, 'click', lib.curry(closeClickHandler, this));
                }
            }
        },
        createBF: function (type, mainDOM) {
            if (mainDOM) {
                this.content = mainDOM.innerHTML;
            } else {
                mainDOM = document.createElement('div');
                if (type == 'body') {
                    var head = this.getChild('head');
                    if (head) {
                        lib.insertAfter(mainDOM, head.main);
                    } else if (this.main.firstChild) {
                        lib.insertBefore(mainDOM, head, this.main.firstChild);
                    } else {
                        this.main.appendChild(mainDOM);
                    }
                } else {
                    this.main.appendChild(mainDOM);
                }
            }
            lib.addClasses(mainDOM, helper.getPartClasses(this, type + '-panel'));
            var properties = {
                    main: mainDOM,
                    renderOptions: this.renderOptions
                };
            var panel = ui.create('Panel', properties);
            panel.render();
            this.addChild(panel, type);
            return panel;
        },
        repaint: helper.createRepaint(Control.prototype.repaint, {
            name: 'height',
            paint: function (dialog, value) {
                if (value === 'auto') {
                    dialog.main.style.height = 'auto';
                } else if (value) {
                    dialog.main.style.height = value + 'px';
                }
                if (dialog.isShow) {
                    resizeHandler.apply(dialog);
                }
            }
        }, {
            name: 'width',
            paint: function (dialog, value) {
                if (value === 'auto') {
                    dialog.main.style.width = 'auto';
                } else if (value) {
                    dialog.main.style.width = value + 'px';
                }
                if (dialog.isShow) {
                    resizeHandler.apply(dialog);
                }
            }
        }, {
            name: 'title',
            paint: function (dialog, value) {
                var titleId = helper.getId(dialog, 'title');
                lib.g(titleId).innerHTML = value;
            }
        }, {
            name: 'content',
            paint: function (dialog, value) {
                if (!value) {
                    return;
                }
                var bfTpl = '' + '<div class="${class}" id="${id}">' + '${content}' + '</div>';
                var body = dialog.getBody();
                var bodyId = helper.getId(dialog, 'body');
                var bodyClass = helper.getPartClasses(dialog, 'body');
                var data = {
                        'class': bodyClass.join(' '),
                        'id': bodyId,
                        'content': value
                    };
                body.setContent(lib.format(bfTpl, data));
            }
        }, {
            name: 'foot',
            paint: function (dialog, value) {
                var bfTpl = '' + '<div class="${class}" id="${id}">' + '${content}' + '</div>';
                var footId = helper.getId(dialog, 'foot');
                var footClass = helper.getPartClasses(dialog, 'foot');
                var foot = dialog.getFoot();
                if (value == null) {
                    dialog.needFoot = false;
                    if (foot) {
                        dialog.removeChild(foot);
                    }
                } else {
                    dialog.needFoot = true;
                    var data = {
                            'class': footClass.join(' '),
                            'id': footId,
                            'content': value
                        };
                    if (!foot) {
                        foot = dialog.createBF('foot');
                    }
                    foot.setContent(lib.format(bfTpl, data));
                }
            }
        }, {
            name: 'draggable',
            paint: function (dialog, draggable) {
                var unbind = false;
                if (draggable) {
                    dialog.addState('draggable');
                } else {
                    dialog.removeState('draggable');
                    unbind = true;
                }
                initDragHandler(dialog, unbind);
            }
        }),
        getBody: function () {
            return this.getChild('body');
        },
        getHead: function () {
            return this.getChild('head');
        },
        getFoot: function () {
            return this.getChild('foot');
        },
        show: function () {
            var mask = this.mask;
            if (helper.isInStage(this, 'INITED')) {
                this.render();
            } else if (helper.isInStage(this, 'DISPOSED')) {
                return;
            }
            getResizeHandler = lib.curry(resizeHandler, this);
            helper.addDOMEvent(this, window, 'resize', resizeHandler);
            this.setWidth(this.width);
            this.removeState('hidden');
            resizeHandler.apply(this);
            var zIndex = 1203;
            var rawElements = document.body.children;
            var dialogNum = 0;
            for (var i = 0, len = rawElements.length; i < len; i++) {
                if (rawElements[i].nodeType === 1) {
                    if (lib.hasClass(rawElements[i], this.helper.getPrimaryClassName()) && !lib.hasClass(rawElements[i], this.helper.getPrimaryClassName('hidden'))) {
                        dialogNum++;
                    }
                }
            }
            zIndex += dialogNum * 10;
            this.main.style.zIndex = zIndex;
            if (mask) {
                showMask(this, zIndex - 1);
            }
            this.fire('show');
            this.isShow = true;
        },
        hide: function () {
            if (this.isShow) {
                helper.removeDOMEvent(this, window, 'resize', resizeHandler);
                var mask = this.mask;
                this.addState('hidden');
                if (mask) {
                    hideMask(this);
                }
            }
            this.fire('hide');
            this.isShow = false;
        },
        setTitle: function (html) {
            this.setProperties({ 'title': html });
        },
        setContent: function (content) {
            this.setProperties({ 'content': content });
        },
        setFoot: function (foot) {
            this.setProperties({ 'foot': foot });
        },
        setHeight: function (height) {
            this.setProperties({ 'height': height });
        },
        setWidth: function (width) {
            this.setProperties({ 'width': width });
        },
        resize: function () {
            resizeHandler.apply(this);
        },
        dispose: function () {
            if (this.helper.isInStage('DISPOSED')) {
                return;
            }
            this.hide();
            var domId = this.main.id;
            lib.removeNode(domId);
            Control.prototype.dispose.apply(this, arguments);
        }
    };
    Dialog.confirm = function (args) {
        var dialogPrefix = 'dialog-confirm';
        function btnClickHandler(dialog, type) {
            dialog.fire(type);
            dialog.dispose();
        }
        var title = lib.encodeHTML(args.title) || '';
        var content = lib.encodeHTML(args.content) || '';
        var okText = lib.encodeHTML(args.okText) || Dialog.OK_TEXT;
        var cancelText = lib.encodeHTML(args.cancelText) || Dialog.CANCEL_TEXT;
        var properties = {
                type: 'confirm',
                skin: 'confirm',
                title: ''
            };
        lib.extend(properties, args);
        var tpl = [
                '<div class="${prefix}-icon ${prefix}-icon-${type}"></div>',
                '<div class="${prefix}-text">${content}</div>'
            ].join('');
        properties.id = helper.getGUID(dialogPrefix);
        properties.closeButton = false;
        properties.mask = true;
        properties.alwaysTop = true;
        var type = properties.type;
        properties.type = null;
        var dialog = ui.create('Dialog', properties);
        dialog.appendTo(document.body);
        dialog.show();
        var okBtn = dialog.getFoot().getChild('btnOk');
        var cancelBtn = dialog.getFoot().getChild('btnCancel');
        okBtn.setContent(okText);
        cancelBtn.setContent(cancelText);
        dialog.setTitle(title);
        dialog.setContent(lib.format(tpl, {
            type: type,
            content: content,
            prefix: dialog.helper.getPrimaryClassName()
        }));
        if (properties.btnHeight) {
            okBtn.set('height', properties.btnHeight);
            cancelBtn.set('height', properties.btnHeight);
        }
        if (properties.btnWidth) {
            okBtn.set('width', properties.btnWidth);
            cancelBtn.set('width', properties.btnWidth);
        }
        okBtn.on('click', lib.curry(btnClickHandler, dialog, 'ok'));
        cancelBtn.on('click', lib.curry(btnClickHandler, dialog, 'cancel'));
        return dialog;
    };
    Dialog.alert = function (args) {
        var dialogPrefix = 'dialog-alert';
        var okPrefix = 'dialog-alert-ok';
        function btnClickHandler(dialog, okBtn) {
            dialog.fire('ok');
            okBtn.dispose();
            dialog.dispose();
        }
        var title = lib.encodeHTML(args.title) || '';
        var content = lib.encodeHTML(args.content) || '';
        var okText = lib.encodeHTML(args.okText) || Dialog.OK_TEXT;
        var properties = {
                type: 'warning',
                skin: 'alert',
                title: ''
            };
        lib.extend(properties, args);
        var tpl = [
                '<div class="${prefix}-icon ${prefix}-icon-${type}"></div>',
                '<div class="${prefix}-text">${content}</div>'
            ].join('');
        var dialogId = helper.getGUID(dialogPrefix);
        properties.id = dialogId;
        properties.closeButton = false;
        properties.mask = true;
        properties.alwaysTop = true;
        var type = properties.type;
        properties.type = null;
        var dialog = ui.create('Dialog', properties);
        dialog.appendTo(document.body);
        dialog.setTitle(title);
        dialog.setContent(lib.format(tpl, {
            type: type,
            content: content,
            prefix: dialog.helper.getPrimaryClassName()
        }));
        dialog.setFoot('' + '<div ' + 'class="' + dialog.helper.getPartClassName('ok-btn') + '"' + ' data-ui="type:Button;childName:okBtn;id:' + dialogId + '-' + okPrefix + '; skin:spring;width:50;">' + okText + '</div>');
        dialog.show();
        var okBtn = dialog.getFoot().getChild('okBtn');
        okBtn.on('click', lib.curry(btnClickHandler, dialog, okBtn));
        if (properties.btnHeight) {
            okBtn.set('height', properties.btnHeight);
        }
        if (properties.btnwidth) {
            okBtn.set('width', properties.btnwidth);
        }
        return dialog;
    };
    lib.inherits(Dialog, Control);
    ui.register(Dialog);
    return Dialog;
});