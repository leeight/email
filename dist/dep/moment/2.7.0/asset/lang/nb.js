(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/nb', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('nb', {
        months: 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
        monthsShort: 'jan._feb._mars_april_mai_juni_juli_aug._sep._okt._nov._des.'.split('_'),
        weekdays: 's\xF8ndag_mandag_tirsdag_onsdag_torsdag_fredag_l\xF8rdag'.split('_'),
        weekdaysShort: 's\xF8._ma._ti._on._to._fr._l\xF8.'.split('_'),
        weekdaysMin: 's\xF8_ma_ti_on_to_fr_l\xF8'.split('_'),
        longDateFormat: {
            LT: 'H.mm',
            L: 'DD.MM.YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY [kl.] LT',
            LLLL: 'dddd D. MMMM YYYY [kl.] LT'
        },
        calendar: {
            sameDay: '[i dag kl.] LT',
            nextDay: '[i morgen kl.] LT',
            nextWeek: 'dddd [kl.] LT',
            lastDay: '[i g\xE5r kl.] LT',
            lastWeek: '[forrige] dddd [kl.] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'om %s',
            past: 'for %s siden',
            s: 'noen sekunder',
            m: 'ett minutt',
            mm: '%d minutter',
            h: 'en time',
            hh: '%d timer',
            d: 'en dag',
            dd: '%d dager',
            M: 'en m\xE5ned',
            MM: '%d m\xE5neder',
            y: 'ett \xE5r',
            yy: '%d \xE5r'
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));