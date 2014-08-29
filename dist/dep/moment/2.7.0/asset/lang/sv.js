(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/sv', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('sv', {
        months: 'januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december'.split('_'),
        monthsShort: 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
        weekdays: 's\xF6ndag_m\xE5ndag_tisdag_onsdag_torsdag_fredag_l\xF6rdag'.split('_'),
        weekdaysShort: 's\xF6n_m\xE5n_tis_ons_tor_fre_l\xF6r'.split('_'),
        weekdaysMin: 's\xF6_m\xE5_ti_on_to_fr_l\xF6'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'YYYY-MM-DD',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Idag] LT',
            nextDay: '[Imorgon] LT',
            lastDay: '[Ig\xE5r] LT',
            nextWeek: 'dddd LT',
            lastWeek: '[F\xF6rra] dddd[en] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'om %s',
            past: 'f\xF6r %s sedan',
            s: 'n\xE5gra sekunder',
            m: 'en minut',
            mm: '%d minuter',
            h: 'en timme',
            hh: '%d timmar',
            d: 'en dag',
            dd: '%d dagar',
            M: 'en m\xE5nad',
            MM: '%d m\xE5nader',
            y: 'ett \xE5r',
            yy: '%d \xE5r'
        },
        ordinal: function (number) {
            var b = number % 10, output = ~~(number % 100 / 10) === 1 ? 'e' : b === 1 ? 'a' : b === 2 ? 'a' : b === 3 ? 'e' : 'e';
            return number + output;
        },
        week: {
            dow: 1,
            doy: 4
        }
    });
}));