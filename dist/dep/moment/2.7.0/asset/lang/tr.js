(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/tr', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var suffixes = {
            1: '\'inci',
            5: '\'inci',
            8: '\'inci',
            70: '\'inci',
            80: '\'inci',
            2: '\'nci',
            7: '\'nci',
            20: '\'nci',
            50: '\'nci',
            3: '\'\xFCnc\xFC',
            4: '\'\xFCnc\xFC',
            100: '\'\xFCnc\xFC',
            6: '\'nc\u0131',
            9: '\'uncu',
            10: '\'uncu',
            30: '\'uncu',
            60: '\'\u0131nc\u0131',
            90: '\'\u0131nc\u0131'
        };
    return moment.lang('tr', {
        months: 'Ocak_\u015Eubat_Mart_Nisan_May\u0131s_Haziran_Temmuz_A\u011Fustos_Eyl\xFCl_Ekim_Kas\u0131m_Aral\u0131k'.split('_'),
        monthsShort: 'Oca_\u015Eub_Mar_Nis_May_Haz_Tem_A\u011Fu_Eyl_Eki_Kas_Ara'.split('_'),
        weekdays: 'Pazar_Pazartesi_Sal\u0131_\xC7ar\u015Famba_Per\u015Fembe_Cuma_Cumartesi'.split('_'),
        weekdaysShort: 'Paz_Pts_Sal_\xC7ar_Per_Cum_Cts'.split('_'),
        weekdaysMin: 'Pz_Pt_Sa_\xC7a_Pe_Cu_Ct'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[bug\xFCn saat] LT',
            nextDay: '[yar\u0131n saat] LT',
            nextWeek: '[haftaya] dddd [saat] LT',
            lastDay: '[d\xFCn] LT',
            lastWeek: '[ge\xE7en hafta] dddd [saat] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s sonra',
            past: '%s \xF6nce',
            s: 'birka\xE7 saniye',
            m: 'bir dakika',
            mm: '%d dakika',
            h: 'bir saat',
            hh: '%d saat',
            d: 'bir g\xFCn',
            dd: '%d g\xFCn',
            M: 'bir ay',
            MM: '%d ay',
            y: 'bir y\u0131l',
            yy: '%d y\u0131l'
        },
        ordinal: function (number) {
            if (number === 0) {
                return number + '\'\u0131nc\u0131';
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