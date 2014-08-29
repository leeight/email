(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/zh-cn', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('zh-cn', {
        months: '\u4E00\u6708_\u4E8C\u6708_\u4E09\u6708_\u56DB\u6708_\u4E94\u6708_\u516D\u6708_\u4E03\u6708_\u516B\u6708_\u4E5D\u6708_\u5341\u6708_\u5341\u4E00\u6708_\u5341\u4E8C\u6708'.split('_'),
        monthsShort: '1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708'.split('_'),
        weekdays: '\u661F\u671F\u65E5_\u661F\u671F\u4E00_\u661F\u671F\u4E8C_\u661F\u671F\u4E09_\u661F\u671F\u56DB_\u661F\u671F\u4E94_\u661F\u671F\u516D'.split('_'),
        weekdaysShort: '\u5468\u65E5_\u5468\u4E00_\u5468\u4E8C_\u5468\u4E09_\u5468\u56DB_\u5468\u4E94_\u5468\u516D'.split('_'),
        weekdaysMin: '\u65E5_\u4E00_\u4E8C_\u4E09_\u56DB_\u4E94_\u516D'.split('_'),
        longDateFormat: {
            LT: 'Ah\u70B9mm',
            L: 'YYYY-MM-DD',
            LL: 'YYYY\u5E74MMMD\u65E5',
            LLL: 'YYYY\u5E74MMMD\u65E5LT',
            LLLL: 'YYYY\u5E74MMMD\u65E5ddddLT',
            l: 'YYYY-MM-DD',
            ll: 'YYYY\u5E74MMMD\u65E5',
            lll: 'YYYY\u5E74MMMD\u65E5LT',
            llll: 'YYYY\u5E74MMMD\u65E5ddddLT'
        },
        meridiem: function (hour, minute, isLower) {
            var hm = hour * 100 + minute;
            if (hm < 600) {
                return '\u51CC\u6668';
            } else if (hm < 900) {
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
            sameDay: function () {
                return this.minutes() === 0 ? '[\u4ECA\u5929]Ah[\u70B9\u6574]' : '[\u4ECA\u5929]LT';
            },
            nextDay: function () {
                return this.minutes() === 0 ? '[\u660E\u5929]Ah[\u70B9\u6574]' : '[\u660E\u5929]LT';
            },
            lastDay: function () {
                return this.minutes() === 0 ? '[\u6628\u5929]Ah[\u70B9\u6574]' : '[\u6628\u5929]LT';
            },
            nextWeek: function () {
                var startOfWeek, prefix;
                startOfWeek = moment().startOf('week');
                prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[\u4E0B]' : '[\u672C]';
                return this.minutes() === 0 ? prefix + 'dddAh\u70B9\u6574' : prefix + 'dddAh\u70B9mm';
            },
            lastWeek: function () {
                var startOfWeek, prefix;
                startOfWeek = moment().startOf('week');
                prefix = this.unix() < startOfWeek.unix() ? '[\u4E0A]' : '[\u672C]';
                return this.minutes() === 0 ? prefix + 'dddAh\u70B9\u6574' : prefix + 'dddAh\u70B9mm';
            },
            sameElse: 'LL'
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
                return number + '\u5468';
            default:
                return number;
            }
        },
        relativeTime: {
            future: '%s\u5185',
            past: '%s\u524D',
            s: '\u51E0\u79D2',
            m: '1\u5206\u949F',
            mm: '%d\u5206\u949F',
            h: '1\u5C0F\u65F6',
            hh: '%d\u5C0F\u65F6',
            d: '1\u5929',
            dd: '%d\u5929',
            M: '1\u4E2A\u6708',
            MM: '%d\u4E2A\u6708',
            y: '1\u5E74',
            yy: '%d\u5E74'
        },
        week: {
            dow: 1,
            doy: 4
        }
    });
}));