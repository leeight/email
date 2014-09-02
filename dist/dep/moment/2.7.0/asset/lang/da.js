(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/da', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('da', {
        months: 'januar_februar_marts_april_maj_juni_juli_august_september_oktober_november_december'.split('_'),
        monthsShort: 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
        weekdays: 's\xF8ndag_mandag_tirsdag_onsdag_torsdag_fredag_l\xF8rdag'.split('_'),
        weekdaysShort: 's\xF8n_man_tir_ons_tor_fre_l\xF8r'.split('_'),
        weekdaysMin: 's\xF8_ma_ti_on_to_fr_l\xF8'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd [d.] D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[I dag kl.] LT',
            nextDay: '[I morgen kl.] LT',
            nextWeek: 'dddd [kl.] LT',
            lastDay: '[I g\xE5r kl.] LT',
            lastWeek: '[sidste] dddd [kl] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'om %s',
            past: '%s siden',
            s: 'f\xE5 sekunder',
            m: 'et minut',
            mm: '%d minutter',
            h: 'en time',
            hh: '%d timer',
            d: 'en dag',
            dd: '%d dage',
            M: 'en m\xE5ned',
            MM: '%d m\xE5neder',
            y: 'et \xE5r',
            yy: '%d \xE5r'
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));