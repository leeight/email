/**
 * @file 处理格式化日志输出
 * 输出格式为`edp ERROR The argument is invalid.`
 * @author Justineo(justice360@gmail.com)
 */
var chalk = require('chalk');

var logger = {};

function log(mod, status, msg, color) {
    var paint = chalk[color] || function(msg) { return msg; };
    console.log(mod + ' ' + paint(status) + ' ' + msg);
}

var levels = {
    info: { color: 'gray' },
    ok: { color: 'green' },
    verbose: { color: 'blue' },
    warn: { color: 'yellow' },
    error: { color: 'red' }
};

for (var level in levels) {
    logger[level] = (function (color) {
        return function (mod, status, msg) {
            log(mod, status, msg, color);
        };
    })(levels[level].color);
}

module.exports = exports = logger;




















/* vim: set ts=4 sw=4 sts=4 tw=100: */
