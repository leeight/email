(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/ko', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('ko', {
        months: '1\uC6D4_2\uC6D4_3\uC6D4_4\uC6D4_5\uC6D4_6\uC6D4_7\uC6D4_8\uC6D4_9\uC6D4_10\uC6D4_11\uC6D4_12\uC6D4'.split('_'),
        monthsShort: '1\uC6D4_2\uC6D4_3\uC6D4_4\uC6D4_5\uC6D4_6\uC6D4_7\uC6D4_8\uC6D4_9\uC6D4_10\uC6D4_11\uC6D4_12\uC6D4'.split('_'),
        weekdays: '\uC77C\uC694\uC77C_\uC6D4\uC694\uC77C_\uD654\uC694\uC77C_\uC218\uC694\uC77C_\uBAA9\uC694\uC77C_\uAE08\uC694\uC77C_\uD1A0\uC694\uC77C'.split('_'),
        weekdaysShort: '\uC77C_\uC6D4_\uD654_\uC218_\uBAA9_\uAE08_\uD1A0'.split('_'),
        weekdaysMin: '\uC77C_\uC6D4_\uD654_\uC218_\uBAA9_\uAE08_\uD1A0'.split('_'),
        longDateFormat: {
            LT: 'A h\uC2DC mm\uBD84',
            L: 'YYYY.MM.DD',
            LL: 'YYYY\uB144 MMMM D\uC77C',
            LLL: 'YYYY\uB144 MMMM D\uC77C LT',
            LLLL: 'YYYY\uB144 MMMM D\uC77C dddd LT'
        },
        meridiem: function (hour, minute, isUpper) {
            return hour < 12 ? '\uC624\uC804' : '\uC624\uD6C4';
        },
        calendar: {
            sameDay: '\uC624\uB298 LT',
            nextDay: '\uB0B4\uC77C LT',
            nextWeek: 'dddd LT',
            lastDay: '\uC5B4\uC81C LT',
            lastWeek: '\uC9C0\uB09C\uC8FC dddd LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s \uD6C4',
            past: '%s \uC804',
            s: '\uBA87\uCD08',
            ss: '%d\uCD08',
            m: '\uC77C\uBD84',
            mm: '%d\uBD84',
            h: '\uD55C\uC2DC\uAC04',
            hh: '%d\uC2DC\uAC04',
            d: '\uD558\uB8E8',
            dd: '%d\uC77C',
            M: '\uD55C\uB2EC',
            MM: '%d\uB2EC',
            y: '\uC77C\uB144',
            yy: '%d\uB144'
        },
        ordinal: '%d\uC77C',
        meridiemParse: /(오전|오후)/,
        isPM: function (token) {
            return token === '\uC624\uD6C4';
        }
    });
}));