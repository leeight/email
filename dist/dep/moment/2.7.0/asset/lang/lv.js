(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/lv', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var units = {
            'mm': 'min\u016Bti_min\u016Btes_min\u016Bte_min\u016Btes',
            'hh': 'stundu_stundas_stunda_stundas',
            'dd': 'dienu_dienas_diena_dienas',
            'MM': 'm\u0113nesi_m\u0113ne\u0161us_m\u0113nesis_m\u0113ne\u0161i',
            'yy': 'gadu_gadus_gads_gadi'
        };
    function format(word, number, withoutSuffix) {
        var forms = word.split('_');
        if (withoutSuffix) {
            return number % 10 === 1 && number !== 11 ? forms[2] : forms[3];
        } else {
            return number % 10 === 1 && number !== 11 ? forms[0] : forms[1];
        }
    }
    function relativeTimeWithPlural(number, withoutSuffix, key) {
        return number + ' ' + format(units[key], number, withoutSuffix);
    }
    return moment.lang('lv', {
        months: 'janv\u0101ris_febru\u0101ris_marts_apr\u012Blis_maijs_j\u016Bnijs_j\u016Blijs_augusts_septembris_oktobris_novembris_decembris'.split('_'),
        monthsShort: 'jan_feb_mar_apr_mai_j\u016Bn_j\u016Bl_aug_sep_okt_nov_dec'.split('_'),
        weekdays: 'sv\u0113tdiena_pirmdiena_otrdiena_tre\u0161diena_ceturtdiena_piektdiena_sestdiena'.split('_'),
        weekdaysShort: 'Sv_P_O_T_C_Pk_S'.split('_'),
        weekdaysMin: 'Sv_P_O_T_C_Pk_S'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD.MM.YYYY',
            LL: 'YYYY. [gada] D. MMMM',
            LLL: 'YYYY. [gada] D. MMMM, LT',
            LLLL: 'YYYY. [gada] D. MMMM, dddd, LT'
        },
        calendar: {
            sameDay: '[\u0160odien pulksten] LT',
            nextDay: '[R\u012Bt pulksten] LT',
            nextWeek: 'dddd [pulksten] LT',
            lastDay: '[Vakar pulksten] LT',
            lastWeek: '[Pag\u0101ju\u0161\u0101] dddd [pulksten] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s v\u0113l\u0101k',
            past: '%s agr\u0101k',
            s: 'da\u017Eas sekundes',
            m: 'min\u016Bti',
            mm: relativeTimeWithPlural,
            h: 'stundu',
            hh: relativeTimeWithPlural,
            d: 'dienu',
            dd: relativeTimeWithPlural,
            M: 'm\u0113nesi',
            MM: relativeTimeWithPlural,
            y: 'gadu',
            yy: relativeTimeWithPlural
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));