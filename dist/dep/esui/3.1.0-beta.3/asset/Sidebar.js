define('esui/Sidebar', [
    'require',
    './lib',
    './Control',
    './main',
    './Panel',
    './controlHelper',
    './Button'
], function (require) {
    var lib = require('./lib');
    var Control = require('./Control');
    var ui = require('./main');
    var Panel = require('./Panel');
    var helper = require('./controlHelper');
    function Sidebar() {
        Control.apply(this, arguments);
    }
    Sidebar.prototype.type = 'Sidebar';
    Sidebar.prototype.createMain = function (options) {
        if (!options.tagName) {
            return Control.prototype.createMain.call(this);
        }
        return document.createElement(options.tagName);
    };
    Sidebar.prototype.initOptions = function (options) {
        var properties = {
                headHeight: 37,
                marginTop: 10,
                marginLeft: 10,
                marginBottom: 10,
                autoDelay: 300,
                mode: 'fixed'
            };
        lib.extend(properties, options);
        var main = this.main;
        var parent = main.parentNode;
        var parentPos = lib.getOffset(parent);
        var pos = lib.getOffset(main);
        if (this.initialOffsetTop == null) {
            this.initialOffsetTop = pos.top - parentPos.top;
            properties.top = pos.top;
            properties.left = pos.left;
        } else {
            properties.top = parentPos.top + this.initialOffsetTop;
        }
        lib.extend(this, properties);
    };
    function getMat(sidebar) {
        return lib.g(helper.getId(sidebar, 'mat'));
    }
    function getMiniBar(sidebar) {
        return lib.g(helper.getId(sidebar, 'minibar'));
    }
    function initContent(sidebar) {
        var head = lib.dom.first(sidebar.main);
        if (head) {
            lib.addClasses(head, helper.getPartClasses(sidebar, 'head'));
            sidebar.headEl = head;
            var body = lib.dom.next(head);
            if (body) {
                sidebar.bodyEl = body;
                lib.addClasses(body, helper.getPartClasses(sidebar, 'body'));
                var panel = new Panel({
                        main: body,
                        renderOptions: sidebar.renderOptions
                    });
                sidebar.addChild(panel, 'content');
                panel.render();
            }
        }
    }
    function renderMat(sidebar) {
        var me = sidebar;
        var mat = document.createElement('div');
        var classes = helper.getPartClasses(me, 'mat');
        mat.id = helper.getId(me, 'mat');
        mat.className = classes.join(' ');
        document.body.appendChild(mat);
    }
    function renderMiniBar(sidebar) {
        var me = sidebar;
        var div = document.createElement('div');
        var html = [];
        var textClasses = helper.getPartClasses(me, 'minibar-text');
        me.headEl && html.push('' + '<div class="' + textClasses.join(' ') + '">' + me.headEl.innerHTML + '</div>');
        var arrowClasses = helper.getPartClasses(me, 'minibar-arrow');
        html.push('' + '<div class="' + arrowClasses.join(' ') + '">' + '</div>');
        div.innerHTML = html.join('');
        div.id = helper.getId(me, 'minibar');
        div.className = helper.getPartClasses(me, 'minibar').join(' ');
        helper.addDOMEvent(me, div, 'mouseover', lib.bind(miniOverHandler, null, me, div));
        helper.addDOMEvent(me, div, 'mouseout', lib.bind(miniOutHandler, null, me, div));
        document.body.appendChild(div);
    }
    function initCtrlBtn(sidebar) {
        var me = sidebar;
        var main = me.main;
        require('./Button');
        var btnAutoHide = ui.create('Button', {
                id: helper.getId(me, 'autohide'),
                skin: 'autohide'
            });
        var btnFixed = ui.create('Button', {
                id: helper.getId(me, 'fixed'),
                skin: 'fixed'
            });
        btnAutoHide.appendTo(main);
        btnFixed.appendTo(main);
        me.addChild(btnAutoHide, 'btnAutoHide');
        me.addChild(btnFixed, 'btnFixed');
        btnAutoHide.onclick = lib.curry(autoHideClickHandler, me);
        btnFixed.onclick = lib.curry(fixedClickHandler, me);
    }
    function resetTop(sidebar) {
        var me = sidebar;
        var scrollTop = lib.page.getScrollTop();
        var marginTop = me.marginTop || 0;
        var curTop = Math.max(me.top + marginTop - scrollTop, marginTop);
        var main = me.main;
        var mat = getMat(me);
        var mini = getMiniBar(me);
        main.style.top = curTop + 'px';
        mini.style.top = curTop + 'px';
        mat.style.top = curTop - marginTop + 'px';
    }
    function initPosition(sidebar) {
        var me = sidebar;
        var main = me.main;
        main.style.cssText += ';' + 'left: ' + (me.marginLeft ? me.marginLeft + 'px' : 0) + ';' + 'bottom:' + (me.marginBottom ? me.marginBottom + 'px' : 0) + ';';
        var body = me.bodyEl;
        body.style.top = me.headHeight ? me.headHeight + 'px' : 0;
        var minibar = getMiniBar(me);
        minibar.style.bottom = me.marginBottom ? me.marginBottom + 'px' : 0;
        resetTop(me);
    }
    function hideMat(sidebar) {
        getMat(sidebar).style.display = 'none';
    }
    function show(sidebar) {
        getMat(sidebar).style.display = 'block';
        sidebar.main.style.display = 'block';
        getMiniBar(sidebar).style.display = 'none';
        if (!sidebar.isAutoHide()) {
            hideMat(sidebar);
        }
    }
    function hide(sidebar) {
        hideMat(sidebar);
        sidebar.main.style.display = 'none';
        getMiniBar(sidebar).style.display = 'block';
    }
    function miniOverHandler(sidebar, element) {
        var me = sidebar;
        var hoverClass = helper.getPartClasses(me, 'minibar-hover');
        if (!lib.hasClass(element, hoverClass[0])) {
            lib.addClasses(element, hoverClass);
            me.minibarDisplayTick = setTimeout(function () {
                show(me);
            }, me.autoDelay);
        }
    }
    function miniOutHandler(sidebar, element) {
        var me = sidebar;
        var hoverClass = helper.getPartClasses(me, 'minibar-hover');
        lib.removeClasses(element, hoverClass);
        clearTimeout(me.minibarDisplayTick);
    }
    function fixedClickHandler(sidebar) {
        sidebar.setMode('fixed');
    }
    function autoHideClickHandler(sidebar) {
        sidebar.setMode('autohide');
    }
    function changeMode(sidebar, mode) {
        var me = sidebar;
        mode = mode.toLowerCase();
        if (mode == 'fixed') {
            me.getChild('btnAutoHide').show();
            me.getChild('btnFixed').hide();
        } else {
            me.getChild('btnAutoHide').hide();
            me.getChild('btnFixed').show();
        }
        me.mode = mode;
    }
    function mainOverHandler(sidebar) {
        clearTimeout(sidebar.minibarDisplayTick);
    }
    function mainOutHandler(sidebar, event) {
        var me = sidebar;
        if (sidebar.isAutoHide()) {
            event = event || window.event;
            var tar = event.relatedTarget || event.toElement;
            if (!lib.dom.contains(sidebar.main, tar)) {
                me.minibarDisplayTick = setTimeout(function () {
                    hide(me);
                }, me.autoDelay);
            }
        }
    }
    Sidebar.prototype.initStructure = function () {
        initContent(this);
        renderMat(this);
        renderMiniBar(this);
        initCtrlBtn(this);
        if (!lib.ie || lib.ie >= 7) {
            this.topReset = lib.curry(resetTop, this);
            lib.on(window, 'scroll', this.topReset);
        }
        initPosition(this);
        if (this.isAutoHide()) {
            hide(this);
        }
    };
    Sidebar.prototype.initEvents = function () {
        this.helper.addDOMEvent(this.main, 'mouseover', lib.bind(mainOverHandler, null, this));
        this.helper.addDOMEvent(this.main, 'mouseout', lib.bind(mainOutHandler, null, this));
    };
    Sidebar.prototype.repaint = helper.createRepaint(Control.prototype.repaint, {
        name: 'mode',
        paint: function (sidebar, mode) {
            changeMode(sidebar, mode);
            if (sidebar.isAutoHide()) {
                hide(sidebar);
            } else {
                show(sidebar);
            }
            if (helper.isInStage(sidebar, 'RENDERED')) {
                sidebar.fire('modechange', { mode: mode });
            }
        }
    });
    Sidebar.prototype.setMode = function (mode) {
        this.setProperties({ mode: mode });
    };
    Sidebar.prototype.getMode = function () {
        return this.mode;
    };
    Sidebar.prototype.getPanel = function () {
        return this.getChild('content');
    };
    Sidebar.prototype.setContent = function (content) {
        var panel = this.getPanel();
        if (panel) {
            panel.setProperties({ content: content });
        }
    }, Sidebar.prototype.isAutoHide = function () {
        return this.mode == 'autohide';
    };
    Sidebar.prototype.dispose = function () {
        if (helper.isInStage(this, 'DISPOSED')) {
            return;
        }
        helper.beforeDispose(this);
        if (this.topReset) {
            lib.un(window, 'scroll', this.topReset);
            this.topReseter = null;
        }
        var mat = getMat(this);
        var miniBar = getMiniBar(this);
        document.body.removeChild(miniBar);
        document.body.removeChild(mat);
        this.headEl = null;
        this.bodyEl = null;
        helper.dispose(this);
        helper.afterDispose(this);
    };
    lib.inherits(Sidebar, Control);
    ui.register(Sidebar);
    return Sidebar;
});