define('bat-ria/ui/navigator', [
    'require',
    'underscore',
    'er/locator',
    'er/permission',
    'esui/lib',
    'er/URL'
], function (require) {
    var u = require('underscore');
    var locator = require('er/locator');
    var permission = require('er/permission');
    var lib = require('esui/lib');
    var URL = require('er/URL');
    function Navigator() {
    }
    Navigator.prototype.config = null;
    Navigator.prototype.navItems = {};
    Navigator.prototype.subNavs = {};
    Navigator.prototype.init = function (domId, config) {
        if (!config) {
            unexceptedError('Navigator config is null!');
            return;
        }
        this.main = document.getElementById(domId);
        if (!this.main) {
            unexceptedError('Can not find navigator main element!');
            return;
        }
        var nav = null;
        this.config = config;
        if (this.main.tagName.toLowerCase() === 'ul') {
            nav = this.main;
        } else {
            nav = document.createElement('ul');
            this.main.appendChild(nav);
        }
        createNavElements(this.config, this.navItems, nav);
        locator.on('redirect', u.bind(this.handleRedirect, this));
        var index = location.href.indexOf('#');
        var url = index !== -1 ? location.href.slice(index + 1) : '';
        this.handleRedirect({ url: url });
    };
    function toggleNav(type) {
        this.main.style.cssText = 'display:' + type + ';';
        u.some(this.subNavs, function (subNav) {
            if (u.isObject(subNav)) {
                if (lib.hasClass(subNav.nav, 'nav-sub-item-current')) {
                    subNav.nav.cssText = 'display:' + type + ';';
                    return true;
                }
            }
        });
    }
    Navigator.prototype.show = function () {
        toggleNav.call(this, 'block');
    };
    Navigator.prototype.hide = function () {
        toggleNav.call(this, 'none');
    };
    Navigator.prototype.handleRedirect = function (e) {
        var me = this;
        var url = URL.parse(e.url).getPath();
        u.some(this.config, function (item, index) {
            var navItems = me.navItems;
            var subNavs = me.subNavs;
            var tabs = item.tabs || '';
            if (isActive(url, item)) {
                activateNavElement(navItems, navItems[index], index, 'nav-item-current');
                if (tabs.length && (!item.auth || permission.isAllow(item.auth))) {
                    subNavs[index] = subNavs[index] || {};
                    createOrShowSubNav(item.tabs, navItems, subNavs, me.main, index);
                    u.some(tabs, function (subItem, subIndex) {
                        if (isActive(url, subItem)) {
                            var subNavItems = subNavs[index].navItems;
                            activateNavElement(subNavItems, subNavItems[subIndex], subIndex, 'nav-sub-item-current');
                            return true;
                        }
                    });
                } else {
                    toggleSubNav(subNavs);
                }
                return true;
            }
        });
    };
    function activateNavElement(navItems, element, index, className) {
        if (!u.isNumber(navItems.activeIndex)) {
            navItems.activeIndex = index;
        } else if (u.isNumber(index)) {
            lib.removeClass(navItems[navItems.activeIndex], className);
            navItems.activeIndex = index;
        }
        lib.addClass(element, className);
    }
    function toggleSubNav(navItems, element, index) {
        var className = 'nav-sub-current';
        if (!element && u.isNumber(navItems.activeIndex)) {
            lib.removeClass(navItems[navItems.activeIndex].nav, className);
            navItems.activeIndex = null;
        } else if (u.isNumber(index)) {
            if (!u.isNumber(navItems.activeIndex)) {
                navItems.activeIndex = index;
            } else {
                lib.removeClass(navItems[navItems.activeIndex].nav, className);
                navItems.activeIndex = index;
            }
            lib.addClass(element, className);
        }
    }
    function createNavElements(config, navItems, nav, isSub) {
        var isSub = isSub || '';
        u.each(config, function (item, index) {
            if (!item.auth || permission.isAllow(item.auth)) {
                var internalUrl = fixErUrl(item.url || '');
                var url = item.externalUrl || internalUrl;
                var target = item.externalUrl ? ' target="_blank"' : '';
                var element = document.createElement('li');
                var separate = '';
                if (item.tabs) {
                    var hasDefaultTabAuth = u.every(item.tabs, function (subItem) {
                            if (isActive(item.url.replace(/^#/, ''), subItem)) {
                                if (!subItem.auth || permission.isAllow(subItem.auth)) {
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                        });
                    if (!hasDefaultTabAuth) {
                        var externalUrlBackUp = '';
                        var isInternalUrlFound = u.some(item.tabs, function (subItem) {
                                if (!subItem.auth || permission.isAllow(subItem.auth)) {
                                    if (subItem.url) {
                                        url = fixErUrl(subItem.url);
                                        return true;
                                    } else if (subItem.externalUrl && !externalUrlBackUp) {
                                        externalUrlBackUp = subItem.externalUrl;
                                    }
                                }
                            });
                        if (!isInternalUrlFound) {
                            url = externalUrlBackUp || url;
                        }
                    }
                }
                element.className = 'nav-' + isSub + 'item';
                element.innerHTML = '<a href="' + url + '"' + target + '>' + '<span>' + u.escape(item.text) + '</span>' + '</a>';
                nav.appendChild(element);
                if (isSub && index < u.size(config) - 1) {
                    separate = document.createElement('li');
                    separate.className = 'nav-sub-item nav-sub-separate';
                    separate.innerHTML = '|';
                    nav.appendChild(separate);
                }
                navItems[index] = element;
            }
        });
    }
    function createOrShowSubNav(config, navItems, subNavs, main, index) {
        var ul = subNavs[index].nav;
        var isNew = false;
        if (!u.isObject(ul)) {
            isNew = true;
            ul = document.createElement('ul');
            ul.className = 'nav-sub';
            lib.insertAfter(ul, main);
            subNavs[index].nav = ul;
            subNavs[index].navItems = {};
            createNavElements(config, subNavs[index].navItems, ul, 'sub-');
        }
        toggleSubNav(subNavs, subNavs[index].nav, index);
        if (isNew) {
            var navOffset = lib.getOffset(main);
            var navItemOffset = lib.getOffset(navItems[index]);
            var subNavOffset = lib.getOffset(ul);
            var middleOfNavItem = navItemOffset.left + navItemOffset.width / 2;
            var marginLeft = middleOfNavItem - subNavOffset.width / 2;
            if (marginLeft < -navOffset.left + 10) {
                marginLeft = -navOffset.left + 10;
            }
            ul.style.cssText = 'margin-left: ' + marginLeft + 'px';
        }
    }
    function testUrlIn(url, patterns) {
        return u.some(patterns, function (pattern) {
            if (u.isFunction(pattern.test)) {
                return pattern.test(url);
            } else {
                return pattern === url;
            }
        });
    }
    function fixErUrl(url) {
        if (!url) {
            return '';
        }
        return url.indexOf('#') === 0 ? url : '#' + url;
    }
    function isActive(url, item) {
        return !testUrlIn(url, item.exclude || []) && testUrlIn(url, item.include || []);
    }
    function unexceptedError(message) {
        throw {
            name: 'System Error',
            message: message ? message : 'Unknow Error'
        };
    }
    var commonNavigator = new Navigator();
    return {
        init: u.bind(commonNavigator.init, commonNavigator),
        show: u.bind(commonNavigator.show, commonNavigator),
        hide: u.bind(commonNavigator.hide, commonNavigator)
    };
});