(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/nn', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('nn', {
        months: 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
        monthsShort: 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
        weekdays: 'sundag_m\xE5ndag_tysdag_onsdag_torsdag_fredag_laurdag'.split('_'),
        weekdaysShort: 'sun_m\xE5n_tys_ons_tor_fre_lau'.split('_'),
        weekdaysMin: 'su_m\xE5_ty_on_to_fr_l\xF8'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[I dag klokka] LT',
            nextDay: '[I morgon klokka] LT',
            nextWeek: 'dddd [klokka] LT',
            lastDay: '[I g\xE5r klokka] LT',
            lastWeek: '[F\xF8reg\xE5ande] dddd [klokka] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'om %s',
            past: 'for %s sidan',
            s: 'nokre sekund',
            m: 'eit minutt',
            mm: '%d minutt',
            h: 'ein time',
            hh: '%d timar',
            d: 'ein dag',
            dd: '%d dagar',
            M: 'ein m\xE5nad',
            MM: '%d m\xE5nader',
            y: 'eit \xE5r',
            yy: '%d \xE5r'
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));