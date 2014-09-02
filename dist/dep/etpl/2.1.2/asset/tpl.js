define('etpl/tpl', [
    'require',
    'exports',
    'module',
    '.'
], function (require, exports, module) {
    var etpl = require('.');
    return {
        load: function (resourceId, req, load, config) {
            var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
            xhr.open('GET', req.toUrl(resourceId), true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        var source = xhr.responseText;
                        var moduleConfig = module.config();
                        if (typeof moduleConfig.autoCompile == 'undefined' || moduleConfig.autoCompile) {
                            etpl.compile(source);
                        }
                        load(source);
                    }
                    xhr.onreadystatechange = new Function();
                    xhr = null;
                }
            };
            xhr.send(null);
        }
    };
});