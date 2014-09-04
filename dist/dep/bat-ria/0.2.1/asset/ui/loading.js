define('bat-ria/ui/loading', [
    'require',
    'underscore',
    'esui',
    'esui/Dialog'
], function (require) {
    var u = require('underscore');
    var globalLoading;
    var loadingCount = 0;
    var loadingTimer;
    function showLoading(content, options) {
        if (!globalLoading) {
            var ui = require('esui');
            require('esui/Dialog');
            var main = document.createElement('div');
            document.body.appendChild(main);
            var dialgOptions = {
                    main: main,
                    title: '\u7CFB\u7EDF\u63D0\u793A',
                    disposeOnHide: false,
                    mask: true,
                    top: 180,
                    width: 'auto',
                    needFoot: false,
                    skin: 'loading'
                };
            globalLoading = ui.create('Dialog', dialgOptions);
            globalLoading.show();
        }
        var properties = { content: content || '\u6B63\u5728\u8BFB\u53D6\u6570\u636E\uFF0C\u8BF7\u7A0D\u5019...' };
        properties = u.extend(properties, options);
        globalLoading.setProperties(properties);
        globalLoading.show();
        globalLoading.main.style.zIndex = parseInt(globalLoading.main.style.zIndex, 10) + 1;
        loadingCount++;
        loadingTimer && clearTimeout(loadingTimer);
        return globalLoading;
    }
    function hideLoading() {
        if (globalLoading) {
            loadingCount--;
            if (loadingCount <= 0) {
                loadingCount = 0;
                loadingTimer && clearTimeout(loadingTimer);
                loadingTimer = setTimeout(function () {
                    globalLoading.hide();
                }, 500);
            }
        }
    }
    return {
        show: showLoading,
        hide: hideLoading
    };
});