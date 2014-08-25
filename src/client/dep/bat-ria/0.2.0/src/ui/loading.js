define(function (require) {
    var u = require('underscore');

    var globalLoading;
    var loadingCount = 0;
    var loadingTimer;

    function showLoading(content, options) {
        if (!globalLoading) {
            // 此处直接new控件出来，
            // 因为这个控件不能属于任何一个业务模块的ViewContext，
            // 不然会随着跳转被销毁，造成下次用不了
            var ui = require('esui');
            require('esui/Dialog');

            var main = document.createElement('div');
            document.body.appendChild(main);

            var dialgOptions = {
                main: main,
                title: '系统提示',
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

        var properties = {
            content: content || '正在读取数据，请稍候...'
        };
        properties = u.extend(properties, options);
        globalLoading.setProperties(properties);
        globalLoading.show();
        loadingCount++;
        return globalLoading;
    }
    function hideLoading() {
        if (globalLoading) {
            loadingCount--;
            if (loadingCount <= 0) {
                loadingCount = 0;
                loadingTimer && clearTimeout(loadingTimer);
                loadingTimer = setTimeout(function () {
                    // 略微等待一段时间再真正隐藏，以免频繁串行请求带来过多闪烁
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
