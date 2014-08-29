define('er/locator', [
    'require',
    './config',
    './events',
    'mini-event/EventTarget'
], function (require) {
    var locator = {};
    var currentLocation = '';
    function getLocation() {
        var index = location.href.indexOf('#');
        var url = index === -1 ? '' : location.href.slice(index);
        return url;
    }
    function forwardHash() {
        var url = getLocation();
        locator.redirect(url);
    }
    var rollTimer = 0;
    var startupTimer = 1;
    function start(firstTime) {
        if (window.addEventListener) {
            window.addEventListener('hashchange', forwardHash, false);
        } else if ('onhashchange' in window && document.documentMode > 7) {
            window.attachEvent('onhashchange', forwardHash);
        } else {
            rollTimer = setInterval(forwardHash, 100);
        }
        if (firstTime) {
            startupTimer = setTimeout(forwardHash, 0);
        }
    }
    function stop() {
        if (rollTimer) {
            clearInterval(rollTimer);
            rollTimer = null;
        }
        if (startupTimer) {
            clearTimeout(startupTimer);
            startupTimer = null;
        }
        if (window.removeEventListener) {
            window.removeEventListener('hashchange', forwardHash, false);
        } else if ('onhashchange' in window && document.documentMode > 7) {
            window.detachEvent('onhashchange', forwardHash);
        }
    }
    function updateURL(url, options) {
        var changed = currentLocation !== url;
        if (changed && getLocation() !== url) {
            if (options.silent) {
                stop();
                location.hash = url;
                start(false);
            } else {
                location.hash = url;
            }
        }
        currentLocation = url;
        return changed;
    }
    locator.start = function () {
        start(true);
    };
    locator.stop = stop;
    locator.resolveURL = function (url) {
        url = url + '';
        if (url.indexOf('#') === 0) {
            url = url.slice(1);
        }
        if (!url || url === '/') {
            url = require('./config').indexURL;
        }
        return url;
    };
    locator.redirect = function (url, options) {
        options = options || {};
        url = locator.resolveURL(url);
        var referrer = currentLocation;
        var isLocationChanged = updateURL(url, options);
        var shouldPerformRedirect = isLocationChanged || options.force;
        if (shouldPerformRedirect) {
            if (!options.silent) {
                locator.fire('redirect', {
                    url: url,
                    referrer: referrer
                });
            }
            require('./events').fire('redirect', {
                url: url,
                referrer: referrer
            });
        }
        return shouldPerformRedirect;
    };
    locator.reload = function () {
        if (currentLocation) {
            locator.redirect(currentLocation, { force: true });
        }
    };
    require('mini-event/EventTarget').enable(locator);
    return locator;
});