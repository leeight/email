define('esui/lib/date', [
    'require',
    'moment'
], function (require) {
    var moment = require('moment');
    var date = {};
    date.dateFormats = [
        'YYYYMMDDHHmmss',
        'YYYY-MM-DD HH:mm:ss',
        'YYYY/MM/DD HH:mm:ss',
        'YYYY-MM-DDTHH:mm:ss.SSSZ'
    ];
    date.format = function (source, pattern) {
        return moment(source).format(pattern);
    };
    date.parse = function (source, format) {
        var dateTime = moment(source, format || date.dateFormats);
        return dateTime.toDate();
    };
    return { date: date };
});