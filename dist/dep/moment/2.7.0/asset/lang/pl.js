(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/pl', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var monthsNominative = 'stycze\u0144_luty_marzec_kwiecie\u0144_maj_czerwiec_lipiec_sierpie\u0144_wrzesie\u0144_pa\u017Adziernik_listopad_grudzie\u0144'.split('_'), monthsSubjective = 'stycznia_lutego_marca_kwietnia_maja_czerwca_lipca_sierpnia_wrze\u015Bnia_pa\u017Adziernika_listopada_grudnia'.split('_');
    function plural(n) {
        return n % 10 < 5 && n % 10 > 1 && ~~(n / 10) % 10 !== 1;
    }
    function translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'minuta' : 'minut\u0119';
        case 'mm':
            return result + (plural(number) ? 'minuty' : 'minut');
        case 'h':
            return withoutSuffix ? 'godzina' : 'godzin\u0119';
        case 'hh':
            return result + (plural(number) ? 'godziny' : 'godzin');
        case 'MM':
            return result + (plural(number) ? 'miesi\u0105ce' : 'miesi\u0119cy');
        case 'yy':
            return result + (plural(number) ? 'lata' : 'lat');
        }
    }
    return moment.lang('pl', {
        months: function (momentToFormat, format) {
            if (/D MMMM/.test(format)) {
                return monthsSubjective[momentToFormat.month()];
            } else {
                return monthsNominative[momentToFormat.month()];
            }
        },
        monthsShort: 'sty_lut_mar_kwi_maj_cze_lip_sie_wrz_pa\u017A_lis_gru'.split('_'),
        weekdays: 'niedziela_poniedzia\u0142ek_wtorek_\u015Broda_czwartek_pi\u0105tek_sobota'.split('_'),
        weekdaysShort: 'nie_pon_wt_\u015Br_czw_pt_sb'.split('_'),
        weekdaysMin: 'N_Pn_Wt_\u015Ar_Cz_Pt_So'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Dzi\u015B o] LT',
            nextDay: '[Jutro o] LT',
            nextWeek: '[W] dddd [o] LT',
            lastDay: '[Wczoraj o] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[W zesz\u0142\u0105 niedziel\u0119 o] LT';
                case 3:
                    return '[W zesz\u0142\u0105 \u015Brod\u0119 o] LT';
                case 6:
                    return '[W zesz\u0142\u0105 sobot\u0119 o] LT';
                default:
                    return '[W zesz\u0142y] dddd [o] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: 'za %s',
            past: '%s temu',
            s: 'kilka sekund',
            m: translate,
            mm: translate,
            h: translate,
            hh: translate,
            d: '1 dzie\u0144',
            dd: '%d dni',
            M: 'miesi\u0105c',
            MM: translate,
            y: 'rok',
            yy: translate
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));