/**
 * @file 处理edp-webserver的cors相关功能
 * @author Justineo(justice360@gmail.com)
 */
var cors = {};

cors.getLocation = function () {
    return /^.*$/;
};

cors.getHandlers = function () {
    return [
        function (context) {
            context.stop();

            if (!context.header['Access-Control-Allow-Origin']) {
                context.header['Access-Control-Allow-Origin'] = '*';
            }

            if (!context.header['Access-Control-Allow-Headers']) {
                context.header['Access-Control-Allow-Headers'] = 'X-Request-By';
            }

            context.start();
        },
        file(),
        proxyNoneExists()
    ];
};

module.exports = exports = cors;




















/* vim: set ts=4 sw=4 sts=4 tw=100: */
