define('esui/lib/page', ['require'], function (require) {
    var documentElement = document.documentElement;
    var body = document.body;
    var viewRoot = document.compatMode == 'BackCompat' ? body : documentElement;
    var page = {};
    page.getWidth = function () {
        return Math.max(documentElement ? documentElement.scrollWidth : 0, body ? body.scrollWidth : 0, viewRoot ? viewRoot.clientWidth : 0, 0);
    };
    page.getHeight = function () {
        return Math.max(documentElement ? documentElement.scrollHeight : 0, body ? body.scrollHeight : 0, viewRoot ? viewRoot.clientHeight : 0, 0);
    };
    page.getViewWidth = function () {
        return viewRoot ? viewRoot.clientWidth : 0;
    };
    page.getViewHeight = function () {
        return viewRoot ? viewRoot.clientHeight : 0;
    };
    page.getScrollTop = function () {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    };
    page.getScrollLeft = function () {
        return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    };
    page.getClientTop = function () {
        return document.documentElement.clientTop || document.body.clientTop || 0;
    };
    page.getClientLeft = function () {
        return document.documentElement.clientLeft || document.body.clientLeft || 0;
    };
    return { page: page };
});