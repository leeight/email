(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/ka', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    function monthsCaseReplace(m, format) {
        var months = {
                'nominative': '\u10D8\u10D0\u10DC\u10D5\u10D0\u10E0\u10D8_\u10D7\u10D4\u10D1\u10D4\u10E0\u10D5\u10D0\u10DA\u10D8_\u10DB\u10D0\u10E0\u10E2\u10D8_\u10D0\u10DE\u10E0\u10D8\u10DA\u10D8_\u10DB\u10D0\u10D8\u10E1\u10D8_\u10D8\u10D5\u10DC\u10D8\u10E1\u10D8_\u10D8\u10D5\u10DA\u10D8\u10E1\u10D8_\u10D0\u10D2\u10D5\u10D8\u10E1\u10E2\u10DD_\u10E1\u10D4\u10E5\u10E2\u10D4\u10DB\u10D1\u10D4\u10E0\u10D8_\u10DD\u10E5\u10E2\u10DD\u10DB\u10D1\u10D4\u10E0\u10D8_\u10DC\u10DD\u10D4\u10DB\u10D1\u10D4\u10E0\u10D8_\u10D3\u10D4\u10D9\u10D4\u10DB\u10D1\u10D4\u10E0\u10D8'.split('_'),
                'accusative': '\u10D8\u10D0\u10DC\u10D5\u10D0\u10E0\u10E1_\u10D7\u10D4\u10D1\u10D4\u10E0\u10D5\u10D0\u10DA\u10E1_\u10DB\u10D0\u10E0\u10E2\u10E1_\u10D0\u10DE\u10E0\u10D8\u10DA\u10D8\u10E1_\u10DB\u10D0\u10D8\u10E1\u10E1_\u10D8\u10D5\u10DC\u10D8\u10E1\u10E1_\u10D8\u10D5\u10DA\u10D8\u10E1\u10E1_\u10D0\u10D2\u10D5\u10D8\u10E1\u10E2\u10E1_\u10E1\u10D4\u10E5\u10E2\u10D4\u10DB\u10D1\u10D4\u10E0\u10E1_\u10DD\u10E5\u10E2\u10DD\u10DB\u10D1\u10D4\u10E0\u10E1_\u10DC\u10DD\u10D4\u10DB\u10D1\u10D4\u10E0\u10E1_\u10D3\u10D4\u10D9\u10D4\u10DB\u10D1\u10D4\u10E0\u10E1'.split('_')
            }, nounCase = /D[oD] *MMMM?/.test(format) ? 'accusative' : 'nominative';
        return months[nounCase][m.month()];
    }
    function weekdaysCaseReplace(m, format) {
        var weekdays = {
                'nominative': '\u10D9\u10D5\u10D8\u10E0\u10D0_\u10DD\u10E0\u10E8\u10D0\u10D1\u10D0\u10D7\u10D8_\u10E1\u10D0\u10DB\u10E8\u10D0\u10D1\u10D0\u10D7\u10D8_\u10DD\u10D7\u10EE\u10E8\u10D0\u10D1\u10D0\u10D7\u10D8_\u10EE\u10E3\u10D7\u10E8\u10D0\u10D1\u10D0\u10D7\u10D8_\u10DE\u10D0\u10E0\u10D0\u10E1\u10D9\u10D4\u10D5\u10D8_\u10E8\u10D0\u10D1\u10D0\u10D7\u10D8'.split('_'),
                'accusative': '\u10D9\u10D5\u10D8\u10E0\u10D0\u10E1_\u10DD\u10E0\u10E8\u10D0\u10D1\u10D0\u10D7\u10E1_\u10E1\u10D0\u10DB\u10E8\u10D0\u10D1\u10D0\u10D7\u10E1_\u10DD\u10D7\u10EE\u10E8\u10D0\u10D1\u10D0\u10D7\u10E1_\u10EE\u10E3\u10D7\u10E8\u10D0\u10D1\u10D0\u10D7\u10E1_\u10DE\u10D0\u10E0\u10D0\u10E1\u10D9\u10D4\u10D5\u10E1_\u10E8\u10D0\u10D1\u10D0\u10D7\u10E1'.split('_')
            }, nounCase = /(წინა|შემდეგ)/.test(format) ? 'accusative' : 'nominative';
        return weekdays[nounCase][m.day()];
    }
    return moment.lang('ka', {
        months: monthsCaseReplace,
        monthsShort: '\u10D8\u10D0\u10DC_\u10D7\u10D4\u10D1_\u10DB\u10D0\u10E0_\u10D0\u10DE\u10E0_\u10DB\u10D0\u10D8_\u10D8\u10D5\u10DC_\u10D8\u10D5\u10DA_\u10D0\u10D2\u10D5_\u10E1\u10D4\u10E5_\u10DD\u10E5\u10E2_\u10DC\u10DD\u10D4_\u10D3\u10D4\u10D9'.split('_'),
        weekdays: weekdaysCaseReplace,
        weekdaysShort: '\u10D9\u10D5\u10D8_\u10DD\u10E0\u10E8_\u10E1\u10D0\u10DB_\u10DD\u10D7\u10EE_\u10EE\u10E3\u10D7_\u10DE\u10D0\u10E0_\u10E8\u10D0\u10D1'.split('_'),
        weekdaysMin: '\u10D9\u10D5_\u10DD\u10E0_\u10E1\u10D0_\u10DD\u10D7_\u10EE\u10E3_\u10DE\u10D0_\u10E8\u10D0'.split('_'),
        longDateFormat: {
            LT: 'h:mm A',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[\u10D3\u10E6\u10D4\u10E1] LT[-\u10D6\u10D4]',
            nextDay: '[\u10EE\u10D5\u10D0\u10DA] LT[-\u10D6\u10D4]',
            lastDay: '[\u10D2\u10E3\u10E8\u10D8\u10DC] LT[-\u10D6\u10D4]',
            nextWeek: '[\u10E8\u10D4\u10DB\u10D3\u10D4\u10D2] dddd LT[-\u10D6\u10D4]',
            lastWeek: '[\u10EC\u10D8\u10DC\u10D0] dddd LT-\u10D6\u10D4',
            sameElse: 'L'
        },
        relativeTime: {
            future: function (s) {
                return /(წამი|წუთი|საათი|წელი)/.test(s) ? s.replace(/ი$/, '\u10E8\u10D8') : s + '\u10E8\u10D8';
            },
            past: function (s) {
                if (/(წამი|წუთი|საათი|დღე|თვე)/.test(s)) {
                    return s.replace(/(ი|ე)$/, '\u10D8\u10E1 \u10EC\u10D8\u10DC');
                }
                if (/წელი/.test(s)) {
                    return s.replace(/წელი$/, '\u10EC\u10DA\u10D8\u10E1 \u10EC\u10D8\u10DC');
                }
            },
            s: '\u10E0\u10D0\u10DB\u10D3\u10D4\u10DC\u10D8\u10DB\u10D4 \u10EC\u10D0\u10DB\u10D8',
            m: '\u10EC\u10E3\u10D7\u10D8',
            mm: '%d \u10EC\u10E3\u10D7\u10D8',
            h: '\u10E1\u10D0\u10D0\u10D7\u10D8',
            hh: '%d \u10E1\u10D0\u10D0\u10D7\u10D8',
            d: '\u10D3\u10E6\u10D4',
            dd: '%d \u10D3\u10E6\u10D4',
            M: '\u10D7\u10D5\u10D4',
            MM: '%d \u10D7\u10D5\u10D4',
            y: '\u10EC\u10D4\u10DA\u10D8',
            yy: '%d \u10EC\u10D4\u10DA\u10D8'
        },
        ordinal: function (number) {
            if (number === 0) {
                return number;
            }
            if (number === 1) {
                return number + '-\u10DA\u10D8';
            }
            if (number < 20 || number <= 100 && number % 20 === 0 || number % 100 === 0) {
                return '\u10DB\u10D4-' + number;
            }
            return number + '-\u10D4';
        },
        week: {
            dow: 1,
            doy: 7
        }
    });
}));