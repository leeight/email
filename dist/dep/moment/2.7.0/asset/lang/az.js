(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/az', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var suffixes = {
            1: '-inci',
            5: '-inci',
            8: '-inci',
            70: '-inci',
            80: '-inci',
            2: '-nci',
            7: '-nci',
            20: '-nci',
            50: '-nci',
            3: '-\xFCnc\xFC',
            4: '-\xFCnc\xFC',
            100: '-\xFCnc\xFC',
            6: '-nc\u0131',
            9: '-uncu',
            10: '-uncu',
            30: '-uncu',
            60: '-\u0131nc\u0131',
            90: '-\u0131nc\u0131'
        };
    return moment.lang('az', {
        months: 'yanvar_fevral_mart_aprel_may_iyun_iyul_avqust_sentyabr_oktyabr_noyabr_dekabr'.split('_'),
        monthsShort: 'yan_fev_mar_apr_may_iyn_iyl_avq_sen_okt_noy_dek'.split('_'),
        weekdays: 'Bazar_Bazar ert\u0259si_\xC7\u0259r\u015F\u0259nb\u0259 ax\u015Fam\u0131_\xC7\u0259r\u015F\u0259nb\u0259_C\xFCm\u0259 ax\u015Fam\u0131_C\xFCm\u0259_\u015E\u0259nb\u0259'.split('_'),
        weekdaysShort: 'Baz_BzE_\xC7Ax_\xC7\u0259r_CAx_C\xFCm_\u015E\u0259n'.split('_'),
        weekdaysMin: 'Bz_BE_\xC7A_\xC7\u0259_CA_C\xFC_\u015E\u0259'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[bug\xFCn saat] LT',
            nextDay: '[sabah saat] LT',
            nextWeek: '[g\u0259l\u0259n h\u0259ft\u0259] dddd [saat] LT',
            lastDay: '[d\xFCn\u0259n] LT',
            lastWeek: '[ke\xE7\u0259n h\u0259ft\u0259] dddd [saat] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s sonra',
            past: '%s \u0259vv\u0259l',
            s: 'birne\xE7\u0259 saniyy\u0259',
            m: 'bir d\u0259qiq\u0259',
            mm: '%d d\u0259qiq\u0259',
            h: 'bir saat',
            hh: '%d saat',
            d: 'bir g\xFCn',
            dd: '%d g\xFCn',
            M: 'bir ay',
            MM: '%d ay',
            y: 'bir il',
            yy: '%d il'
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 4) {
                return 'gec\u0259';
            } else if (hour < 12) {
                return 's\u0259h\u0259r';
            } else if (hour < 17) {
                return 'g\xFCnd\xFCz';
            } else {
                return 'ax\u015Fam';
            }
        },
        ordinal: function (number) {
            if (number === 0) {
                return number + '-\u0131nc\u0131';
            }
            var a = number % 10, b = number % 100 - a, c = number >= 100 ? 100 : null;
            return number + (suffixes[a] || suffixes[b] || suffixes[c]);
        },
        week: {
            dow: 1,
            doy: 7
        }
    });
}));