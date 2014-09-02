define('esui/TipLayer', [
    'require',
    './Button',
    './Label',
    './Panel',
    './lib',
    './controlHelper',
    './Control',
    './main',
    './painters'
], function (require) {
    require('./Button');
    require('./Label');
    require('./Panel');
    var lib = require('./lib');
    var helper = require('./controlHelper');
    var Control = require('./Control');
    var ui = require('./main');
    var paint = require('./painters');
    function TipLayer(options) {
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
        if (mainDOM) {
            control.title = mainDOM.innerHTML;
        } else {
            mainDOM = document.createElement('h3');
            if (control.main.firstChild) {
                lib.insertBefore(mainDOM, control.main.firstChild);
            } else {
                control.main.appendChild(mainDOM);
            }
        }
        var headClasses = [].concat(helper.getPartClasses(control, 'title'));
        lib.addClasses(mainDOM, headClasses);
        var properties = {
                main: mainDOM,
                childName: 'title'
            };
        var label = ui.create('Label', properties);
        label.render();
        control.addChild(label);
        return label;
    }
    function createBF(control, type, mainDOM) {
        if (mainDOM) {
            control.content = mainDOM.innerHTML;
        } else {
            mainDOM = document.createElement('div');
            if (type == 'body') {
                var head = control.getChild('title');
                if (head) {
                    lib.insertAfter(mainDOM, head.main);
                } else if (control.main.firstChild) {
                    lib.insertBefore(mainDOM, head, control.main.firstChild);
                } else {
                    control.main.appendChild(mainDOM);
                }
            } else {
                control.main.appendChild(mainDOM);
            }
        }
        lib.addClasses(mainDOM, helper.getPartClasses(control, type + '-panel'));
        var properties = {
                main: mainDOM,
                renderOptions: control.renderOptions
            };
        var panel = ui.create('Panel', properties);
        panel.render();
        control.addChild(panel, type);
        return panel;
    }
    function resizeHandler(tipLayer, targetElement, options) {
        if (!tipLayer.isShow) {
            return;
        }
        tipLayer.autoPosition(targetElement, options);
    }
    function delayShow(tipLayer, delayTime, targetElement, options) {
        if (delayTime) {
            clearTimeout(tipLayer.showTimeout);
            clearTimeout(tipLayer.hideTimeout);
            tipLayer.showTimeout = setTimeout(lib.bind(tipLayer.show, tipLayer, targetElement, options), delayTime);
        } else {
            tipLayer.show(targetElement, options);
        }
    }
    function delayHide(tipLayer, delayTime) {
        clearTimeout(tipLayer.showTimeout);
        clearTimeout(tipLayer.hideTimeout);
        tipLayer.hideTimeout = setTimeout(lib.bind(tipLayer.hide, tipLayer), delayTime);
    }
    function getElementByControl(tipLayer, control) {
        if (typeof control == 'string') {
            control = tipLayer.viewContext.get(control);
        }
        return control.main;
    }
    TipLayer.prototype = {
        type: 'TipLayer',
        initOptions: function (options) {
            parseMain(options);
            var properties = { roles: {} };
            lib.extend(properties, options);
            this.setProperties(properties);
        },
        initStructure: function () {
            var main = this.main;
            if (main.parentNode && main.parentNode.nodeName.toLowerCase() !== 'body') {
                document.body.appendChild(main);
            }
            this.main.style.left = '-10000px';
            if (this.title || this.roles.title) {
                createHead(this, this.roles.title);
            }
            createBF(this, 'body', this.roles.content);
            if (this.foot || this.roles.foot) {
                createBF(this, 'foot', this.roles.foot);
            }
            if (this.arrow) {
                var arrow = document.createElement('div');
                arrow.id = helper.getId(this, 'arrow');
                arrow.className = helper.getPartClasses(this, 'arrow').join(' ');
                this.main.appendChild(arrow);
            }
        },
        repaint: helper.createRepaint(Control.prototype.repaint, paint.style('width'), {
            name: 'title',
            paint: function (tipLayer, value) {
                var head = tipLayer.getHead();
                if (value == null) {
                    if (head) {
                        tipLayer.removeChild(head);
                    }
                } else {
                    if (!head) {
                        head = createHead(tipLayer);
                    }
                    head.setText(value);
                }
            }
        }, {
            name: 'content',
            paint: function (tipLayer, value) {
                var bfTpl = '' + '<div class="${class}" id="${id}">' + '${content}' + '</div>';
                var body = tipLayer.getBody();
                var bodyId = helper.getId(tipLayer, 'body');
                var bodyClass = helper.getPartClasses(tipLayer, 'body');
                var data = {
                        'class': bodyClass.join(' '),
                        'id': bodyId,
                        'content': value
                    };
                body.setContent(lib.format(bfTpl, data));
            }
        }, {
            name: 'foot',
            paint: function (tipLayer, value) {
                var bfTpl = '' + '<div class="${class}" id="${id}">' + '${content}' + '</div>';
                var footId = helper.getId(tipLayer, 'foot');
                var footClass = helper.getPartClasses(tipLayer, 'foot');
                var foot = tipLayer.getFoot();
                if (value == null) {
                    if (foot) {
                        tipLayer.removeChild(foot);
                    }
                } else {
                    var data = {
                            'class': footClass.join(' '),
                            'id': footId,
                            'content': value
                        };
                    if (!foot) {
                        foot = createBF(tipLayer, 'foot');
                    }
                    foot.setContent(lib.format(bfTpl, data));
                }
            }
        }, {
            name: [
                'targetDOM',
                'targetControl',
                'showMode',
                'positionOpt',
                'delayTime'
            ],
            paint: function (tipLayer, targetDOM, targetControl, showMode, positionOpt, delayTime) {
                var options = {
                        targetDOM: targetDOM,
                        targetControl: targetControl,
                        showMode: showMode,
                        delayTime: delayTime
                    };
                if (positionOpt) {
                    positionOpt = positionOpt.split('|');
                    options.positionOpt = {
                        top: positionOpt[0] || 'top',
                        right: positionOpt[1] || 'left'
                    };
                }
                tipLayer.attachTo(options);
            }
        }),
        autoPosition: function (target, options) {
            var tipLayer = this;
            var element = this.main;
            options = options || {
                left: 'right',
                top: 'top'
            };
            var rect = target.getBoundingClientRect();
            var offset = lib.getOffset(target);
            var targetPosition = {
                    top: rect.top,
                    right: rect.right,
                    bottom: rect.bottom,
                    left: rect.left,
                    width: rect.right - rect.left,
                    height: rect.bottom - rect.top
                };
            var previousDisplayValue = element.style.display;
            element.style.display = 'block';
            var elementHeight = element.offsetHeight;
            var elementWidth = element.offsetWidth;
            element.style.display = 'none';
            var config = lib.clone(options);
            var viewWidth = lib.page.getViewWidth();
            var viewHeight = lib.page.getViewHeight();
            var gapLR = targetPosition.left - elementWidth;
            var gapRL = viewWidth - targetPosition.right - elementWidth;
            var gapTT = viewHeight - targetPosition.top - elementHeight;
            var gapBB = targetPosition.bottom - elementHeight;
            if (gapLR >= 0) {
                if (gapRL >= 0) {
                    if (!config.right && !config.left) {
                        if (gapRL < gapLR) {
                            config.left = 'right';
                            config.right = null;
                        } else {
                            config.right = 'left';
                            config.left = null;
                        }
                    }
                } else {
                    config.left = 'right';
                    config.right = null;
                }
            } else {
                config.right = 'left';
                config.left = null;
            }
            if (gapTT >= 0) {
                if (gapBB >= 0) {
                    if (!config.bottom && !config.top) {
                        if (gapBB < gapTT) {
                            config.top = 'top';
                            config.bottom = null;
                        } else {
                            config.bottom = 'bottom';
                            config.top = null;
                        }
                    }
                } else {
                    config.top = 'top';
                    config.bottom = null;
                }
            } else {
                config.bottom = 'bottom';
                config.top = null;
            }
            var properties = {};
            var arrowClass;
            if (config.right) {
                properties.left = offset.right;
                if (config.top) {
                    arrowClass = 'lt';
                } else {
                    arrowClass = 'lb';
                }
            } else if (config.left) {
                properties.left = offset.left - elementWidth;
                if (config.top) {
                    arrowClass = 'rt';
                } else {
                    arrowClass = 'rb';
                }
            }
            if (config.top) {
                properties.top = offset.top;
            } else if (config.bottom) {
                properties.top = offset.bottom - elementHeight;
            }
            element.style.display = previousDisplayValue;
            element.className = '' + helper.getPartClasses(tipLayer).join(' ') + ' ' + helper.getPartClasses(tipLayer, arrowClass).join(' ');
            var arrow = lib.g(helper.getId(tipLayer, 'arrow'));
            if (arrow) {
                arrow.className = '' + helper.getPartClasses(tipLayer, 'arrow').join(' ') + ' ' + helper.getPartClasses(tipLayer, 'arrow' + '-' + arrowClass).join(' ');
            }
            tipLayer.renderLayer(element, properties);
        },
        renderLayer: function (element, options) {
            var properties = lib.clone(options || {});
            if (properties.hasOwnProperty('top') && properties.hasOwnProperty('bottom')) {
                properties.height = properties.bottom - properties.top;
                delete properties.bottom;
            }
            if (properties.hasOwnProperty('left') && properties.hasOwnProperty('right')) {
                properties.width = properties.right - properties.left;
                delete properties.right;
            }
            if (properties.hasOwnProperty('top') || properties.hasOwnProperty('bottom')) {
                element.style.top = '';
                element.style.bottom = '';
            }
            if (properties.hasOwnProperty('left') || properties.hasOwnProperty('right')) {
                element.style.left = '';
                element.style.right = '';
            }
            for (var name in properties) {
                if (properties.hasOwnProperty(name)) {
                    element.style[name] = properties[name] + 'px';
                }
            }
        },
        attachTo: function (options) {
            var showMode = options.showMode || 'over';
            var showEvent;
            var hideEvent;
            if (showMode === 'over') {
                showEvent = 'mouseover';
                hideEvent = 'mouseout';
            } else if (showMode === 'click') {
                showEvent = 'click';
                hideEvent = 'click';
            }
            var targetElement;
            if (options.targetDOM) {
                targetElement = lib.g(options.targetDOM);
            } else if (options.targetControl) {
                targetElement = getElementByControl(this, options.targetControl);
            }
            if (!targetElement) {
                return;
            }
            if (showMode === 'auto') {
                this.show(targetElement, options);
            } else {
                helper.addDOMEvent(this, targetElement, showEvent, lib.curry(delayShow, this, options.delayTime, targetElement, options.positionOpt));
                helper.addDOMEvent(this, this.main, 'mouseover', lib.bind(this.show, this, targetElement, options.positionOpt));
                helper.addDOMEvent(this, this.main, 'mouseout', lib.curry(delayHide, this, 150));
            }
            if (hideEvent === 'mouseout') {
                helper.addDOMEvent(this, targetElement, hideEvent, lib.curry(delayHide, this, 150));
            }
        },
        getHead: function () {
            return this.getChild('title');
        },
        getBody: function () {
            return this.getChild('body');
        },
        getFoot: function () {
            return this.getChild('foot');
        },
        show: function (targetElement, options) {
            if (helper.isInStage(this, 'INITED')) {
                this.render();
            } else if (helper.isInStage(this, 'DISPOSED')) {
                return;
            }
            clearTimeout(this.hideTimeout);
            helper.addDOMEvent(this, window, 'resize', lib.curry(resizeHandler, this, targetElement, options));
            this.main.style.zIndex = helper.layer.getZIndex(targetElement);
            this.removeState('hidden');
            this.autoPosition(targetElement, options);
            this.fire('show');
            this.isShow = true;
        },
        hide: function () {
            if (this.isShow) {
                this.addState('hidden');
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
        dispose: function () {
            if (helper.isInStage(this, 'DISPOSED')) {
                return;
            }
            this.hide();
            var domId = this.main.id;
            lib.removeNode(domId);
            Control.prototype.dispose.apply(this, arguments);
        }
    };
    TipLayer.onceNotice = function (args) {
        var tipLayerPrefix = 'tipLayer-once-notice';
        var okPrefix = 'tipLayer-notice-ok';
        function btnClickHandler(tipLayer) {
            var handler = tipLayer.onok;
            var isFunc = typeof handler == 'function';
            if (isFunc) {
                handler(tipLayer);
            }
            tipLayer.fire('ok');
            tipLayer.dispose();
        }
        var content = lib.encodeHTML(args.content) || '';
        var properties = {
                type: 'onceNotice',
                skin: 'onceNotice',
                arrow: true
            };
        lib.extend(properties, args);
        var main = document.createElement('div');
        document.body.appendChild(main);
        var tipLayerId = helper.getGUID(tipLayerPrefix);
        properties.id = tipLayerId;
        properties.main = main;
        properties.type = null;
        var tipLayer = ui.create('TipLayer', properties);
        tipLayer.setContent(content);
        var okText = args.okText || '\u77E5\u9053\u4E86';
        tipLayer.setFoot('' + '<div data-ui="type:Button;childName:okBtn;id:' + tipLayerId + '-' + okPrefix + ';width:50;"' + 'class="' + helper.getPartClasses(tipLayer, 'once-notice') + '">' + okText + '</div>');
        tipLayer.render();
        var okBtn = tipLayer.getFoot().getChild('okBtn');
        okBtn.on('click', lib.curry(btnClickHandler, tipLayer, 'ok'));
        tipLayer.attachTo({
            targetDOM: args.targetDOM,
            targetControl: args.targetControl,
            showMode: 'auto',
            positionOpt: {
                top: 'top',
                right: 'left'
            }
        });
        return tipLayer;
    };
    lib.inherits(TipLayer, Control);
    ui.register(TipLayer);
    return TipLayer;
});