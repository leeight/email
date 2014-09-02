(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/zh-tw', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('zh-tw', {
        months: '\u4E00\u6708_\u4E8C\u6708_\u4E09\u6708_\u56DB\u6708_\u4E94\u6708_\u516D\u6708_\u4E03\u6708_\u516B\u6708_\u4E5D\u6708_\u5341\u6708_\u5341\u4E00\u6708_\u5341\u4E8C\u6708'.split('_'),
        monthsShort: '1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708'.split('_'),
        weekdays: '\u661F\u671F\u65E5_\u661F\u671F\u4E00_\u661F\u671F\u4E8C_\u661F\u671F\u4E09_\u661F\u671F\u56DB_\u661F\u671F\u4E94_\u661F\u671F\u516D'.split('_'),
        weekdaysShort: '\u9031\u65E5_\u9031\u4E00_\u9031\u4E8C_\u9031\u4E09_\u9031\u56DB_\u9031\u4E94_\u9031\u516D'.split('_'),
        weekdaysMin: '\u65E5_\u4E00_\u4E8C_\u4E09_\u56DB_\u4E94_\u516D'.split('_'),
        longDateFormat: {
            LT: 'Ah\u9EDEmm',
            L: 'YYYY\u5E74MMMD\u65E5',
            LL: 'YYYY\u5E74MMMD\u65E5',
            LLL: 'YYYY\u5E74MMMD\u65E5LT',
            LLLL: 'YYYY\u5E74MMMD\u65E5ddddLT',
            l: 'YYYY\u5E74MMMD\u65E5',
            ll: 'YYYY\u5E74MMMD\u65E5',
            lll: 'YYYY\u5E74MMMD\u65E5LT',
            llll: 'YYYY\u5E74MMMD\u65E5ddddLT'
        },
        meridiem: function (hour, minute, isLower) {
            var hm = hour * 100 + minute;
            if (hm < 900) {
                return '\u65E9\u4E0A';
            } else if (hm < 1130) {
                return '\u4E0A\u5348';
            } else if (hm < 1230) {
                return '\u4E2D\u5348';
            } else if (hm < 1800) {
                return '\u4E0B\u5348';
            } else {
                return '\u665A\u4E0A';
            }
        },
        calendar: {
            sameDay: '[\u4ECA\u5929]LT',
            nextDay: '[\u660E\u5929]LT',
            nextWeek: '[\u4E0B]ddddLT',
            lastDay: '[\u6628\u5929]LT',
            lastWeek: '[\u4E0A]ddddLT',
            sameElse: 'L'
        },
        ordinal: function (number, period) {
            switch (period) {
            case 'd':
            case 'D':
            case 'DDD':
                return number + '\u65E5';
            case 'M':
                return number + '\u6708';
            case 'w':
            case 'W':
                return number + '\u9031';
            default:
                return number;
            }
        },
        relativeTime: {
            future: '%s\u5167',
            past: '%s\u524D',
            s: '\u5E7E\u79D2',
            m: '\u4E00\u5206\u9418',
            mm: '%d\u5206\u9418',
            h: '\u4E00\u5C0F\u6642',
            hh: '%d\u5C0F\u6642',
            d: '\u4E00\u5929',
            dd: '%d\u5929',
            M: '\u4E00\u500B\u6708',
            MM: '%d\u500B\u6708',
            y: '\u4E00\u5E74',
            yy: '%d\u5E74'
        }
    });
}));