define('esui/Tab', [
    'require',
    'underscore',
    './lib',
    './Control',
    './painters',
    './main'
], function (require) {
    var u = require('underscore');
    var lib = require('./lib');
    var Control = require('./Control');
    function Tab() {
        Control.apply(this, arguments);
    }
    Tab.prototype.type = 'Tab';
    Tab.prototype.initOptions = function (options) {
        var properties = {
                tabs: [],
                activeIndex: 0,
                allowClose: false,
                orientation: 'horizontal'
            };
        u.extend(properties, options);
        var children = lib.getChildren(this.main);
        if (children.length) {
            var tabs = [];
            for (var i = 0; i < children.length; i++) {
                var element = children[i];
                if (element.getAttribute('data-role') === 'navigator') {
                    properties.tabs = [];
                    this.navigatorElement = element;
                    var children = lib.getChildren(element);
                    for (var i = 0; i < children.length; i++) {
                        var tab = children[i];
                        var config = {
                                title: lib.getText(tab),
                                panel: tab.getAttribute('data-for')
                            };
                        properties.tabs.push(config);
                    }
                    break;
                } else {
                    var config = {
                            title: element.getAttribute('title'),
                            panel: element.id
                        };
                    tabs.push(config);
                }
            }
            if (!properties.tabs.length) {
                properties.tabs = tabs;
            }
        }
        if (typeof properties.activeIndex === 'string') {
            properties.activeIndex = +properties.activeIndex;
        }
        this.setProperties(properties);
    };
    function clickTab(e) {
        var target = e.target;
        var tabElement = target;
        while (tabElement && tabElement.nodeName.toLowerCase() !== 'li') {
            tabElement = tabElement.parentNode;
        }
        if (tabElement && tabElement.nodeName.toLowerCase() === 'li') {
            var parent = tabElement.parentNode;
            var children = lib.getChildren(parent);
            for (var i = 0; i < children.length; i++) {
                if (children[i] === tabElement) {
                    if (this.helper.isPart(target, 'close')) {
                        this.removeAt(i);
                    } else {
                        this.set('activeIndex', i);
                    }
                    return;
                }
            }
        }
    }
    Tab.prototype.initStructure = function () {
        var navigator = this.navigatorElement;
        this.navigatorElement = null;
        if (!navigator) {
            navigator = document.createElement('ul');
            this.main.insertBefore(navigator, this.main.firstChild || null);
        }
        navigator.id = this.helper.getId('navigator');
        this.helper.addPartClasses('navigator', navigator);
    };
    Tab.prototype.initEvents = function () {
        this.helper.addDOMEvent('navigator', 'click', clickTab);
    };
    Tab.prototype.contentTemplate = '<span>${title}</span>';
    Tab.prototype.getContentHTML = function (config, allowClose) {
        var html = lib.format(this.contentTemplate, { title: u.escape(config.title) });
        if (allowClose) {
            html += '<span class="' + this.helper.getPartClassName('close') + '">\u5173\u95ED</span>';
        }
        return html;
    };
    function createTabElement(tab, config, isActive, allowClose) {
        var element = document.createElement('li');
        tab.helper.addPartClasses('item', element);
        if (isActive) {
            tab.helper.addPartClasses('item-active', element);
        }
        element.innerHTML = tab.getContentHTML(config, allowClose);
        return element;
    }
    function fillNavigator(tab) {
        var navigator = tab.helper.getPart('navigator');
        var parentNode = navigator.parentNode;
        var placeholder = navigator.nextSibling;
        navigator.innerHTML = '';
        navigator.parentNode.removeChild(navigator);
        for (var i = 0; i < tab.tabs.length; i++) {
            var config = tab.tabs[i];
            var isActive = tab.activeIndex === i;
            var tabElement = createTabElement(tab, config, isActive, tab.allowClose);
            navigator.appendChild(tabElement);
        }
        parentNode.insertBefore(navigator, placeholder);
    }
    Tab.prototype.setProperties = function (properties) {
        if (properties.tabs) {
            if (properties.activeIndex == null) {
                var currentActiveTab = this.tabs[this.activeIndex];
                var activeIndex = -1;
                for (var i = 0; i < properties.tabs.length; i++) {
                    if (properties.tabs[i] === currentActiveTab) {
                        activeIndex = i;
                        break;
                    }
                }
                if (activeIndex === -1) {
                    this.activeIndex = -1;
                    properties.activeIndex = 0;
                } else {
                    this.activeIndex = activeIndex;
                }
            }
            if (properties.allowClose != null) {
                this.allowClose = properties.allowClose;
                delete properties.allowClose;
            }
        }
        Control.prototype.setProperties.apply(this, arguments);
    };
    function activateTab(tab, index) {
        for (var i = 0; i < tab.tabs.length; i++) {
            var config = tab.tabs[i];
            if (config.panel) {
                var panel = lib.g(config.panel);
                if (panel) {
                    panel.style.display = i === index ? '' : 'none';
                }
            }
            var navigator = tab.helper.getPart('navigator');
            var children = lib.getChildren(navigator);
            var tabElement = children[i];
            var methodName = i === index ? 'addPartClasses' : 'removePartClasses';
            tab.helper[methodName]('item-active', tabElement);
        }
        var event = {
                activeIndex: index,
                tab: tab.tabs[index]
            };
        tab.fire('activate', event);
    }
    Tab.prototype.repaint = require('./painters').createRepaint(Control.prototype.repaint, {
        name: [
            'tabs',
            'allowClose'
        ],
        paint: fillNavigator
    }, {
        name: 'activeIndex',
        paint: activateTab
    }, {
        name: 'orientation',
        paint: function (tab, orientation) {
            tab.removeState('vertical');
            tab.removeState('horizontal');
            tab.addState(orientation);
        }
    });
    Tab.prototype.activate = function (config) {
        for (var i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i] === config) {
                this.set('activeIndex', i);
            }
        }
    };
    Tab.prototype.add = function (config) {
        this.insert(config, this.tabs.length);
    };
    Tab.prototype.insert = function (config, index) {
        index = Math.min(index, this.tabs.length);
        index = Math.max(index, 0);
        this.tabs.splice(index, 0, config);
        var tabElement = createTabElement(this, config, false, this.allowClose);
        var navigator = this.helper.getPart('navigator');
        var children = lib.getChildren(navigator);
        navigator.insertBefore(tabElement, children[index] || null);
        if (this.tabs.length === 1) {
            this.activeIndex = 0;
            activateTab(this, 0);
        } else {
            if (index <= this.activeIndex) {
                this.activeIndex++;
            }
            if (config.panel) {
                var panel = lib.g(config.panel);
                if (panel) {
                    panel.style.display = 'none';
                }
            }
        }
        this.fire('add', {
            tab: config,
            index: index
        });
    };
    Tab.prototype.remove = function (config) {
        var index = 0;
        while ((index = u.indexOf(this.tabs, config, index)) >= 0) {
            this.removeAt(index);
        }
    };
    Tab.prototype.removeAt = function (index) {
        var removed = this.tabs.splice(index, 1)[0];
        var navigator = this.helper.getPart('navigator');
        if (removed) {
            var children = lib.getChildren(navigator);
            var tabElement = children[index];
            tabElement.parentNode.removeChild(tabElement);
            if (index < this.activeIndex) {
                this.activeIndex--;
            } else if (index === this.activeIndex) {
                this.activeIndex = Math.min(this.activeIndex, this.tabs.length - 1);
                activateTab(this, this.activeIndex);
            }
            if (removed.panel) {
                var panel = lib.g(removed.panel);
                if (panel) {
                    panel.style.display = 'none';
                }
            }
            this.fire('remove', {
                tab: removed,
                index: index
            });
        }
    };
    Tab.prototype.getActiveTab = function () {
        return this.get('tabs')[this.get('activeIndex')];
    };
    lib.inherits(Tab, Control);
    require('./main').register(Tab);
    return Tab;
});