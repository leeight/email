(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/vi', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('vi', {
        months: 'th\xE1ng 1_th\xE1ng 2_th\xE1ng 3_th\xE1ng 4_th\xE1ng 5_th\xE1ng 6_th\xE1ng 7_th\xE1ng 8_th\xE1ng 9_th\xE1ng 10_th\xE1ng 11_th\xE1ng 12'.split('_'),
        monthsShort: 'Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12'.split('_'),
        weekdays: 'ch\u1EE7 nh\u1EADt_th\u1EE9 hai_th\u1EE9 ba_th\u1EE9 t\u01B0_th\u1EE9 n\u0103m_th\u1EE9 s\xE1u_th\u1EE9 b\u1EA3y'.split('_'),
        weekdaysShort: 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
        weekdaysMin: 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM [n\u0103m] YYYY',
            LLL: 'D MMMM [n\u0103m] YYYY LT',
            LLLL: 'dddd, D MMMM [n\u0103m] YYYY LT',
            l: 'DD/M/YYYY',
            ll: 'D MMM YYYY',
            lll: 'D MMM YYYY LT',
            llll: 'ddd, D MMM YYYY LT'
        },
        calendar: {
            sameDay: '[H\xF4m nay l\xFAc] LT',
            nextDay: '[Ng\xE0y mai l\xFAc] LT',
            nextWeek: 'dddd [tu\u1EA7n t\u1EDBi l\xFAc] LT',
            lastDay: '[H\xF4m qua l\xFAc] LT',
            lastWeek: 'dddd [tu\u1EA7n r\u1ED3i l\xFAc] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s t\u1EDBi',
            past: '%s tr\u01B0\u1EDBc',
            s: 'v\xE0i gi\xE2y',
            m: 'm\u1ED9t ph\xFAt',
            mm: '%d ph\xFAt',
            h: 'm\u1ED9t gi\u1EDD',
            hh: '%d gi\u1EDD',
            d: 'm\u1ED9t ng\xE0y',
            dd: '%d ng\xE0y',
            M: 'm\u1ED9t th\xE1ng',
            MM: '%d th\xE1ng',
            y: 'm\u1ED9t n\u0103m',
            yy: '%d n\u0103m'
        },
        ordinal: function (number) {
            return number;
        },
        week: {
            dow: 1,
            doy: 4
        }
    });
}));