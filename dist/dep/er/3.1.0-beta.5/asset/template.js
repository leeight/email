define('er/template', [
    'require',
    'etpl/main'
], function (require) {
    var template = require('etpl/main');
    template.merge = function (output, tplName, model) {
        var html = '';
        try {
            var html = template.render(tplName, model);
        } catch (ex) {
        }
        if (output) {
            output.innerHTML = html;
        }
        return html;
    };
    return template;
});