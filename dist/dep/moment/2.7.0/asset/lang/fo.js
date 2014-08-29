(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/fo', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('fo', {
        months: 'januar_februar_mars_apr\xEDl_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
        monthsShort: 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
        weekdays: 'sunnudagur_m\xE1nadagur_t\xFDsdagur_mikudagur_h\xF3sdagur_fr\xEDggjadagur_leygardagur'.split('_'),
        weekdaysShort: 'sun_m\xE1n_t\xFDs_mik_h\xF3s_fr\xED_ley'.split('_'),
        weekdaysMin: 'su_m\xE1_t\xFD_mi_h\xF3_fr_le'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D. MMMM, YYYY LT'
        },
        calendar: {
            sameDay: '[\xCD dag kl.] LT',
            nextDay: '[\xCD morgin kl.] LT',
            nextWeek: 'dddd [kl.] LT',
            lastDay: '[\xCD gj\xE1r kl.] LT',
            lastWeek: '[s\xED\xF0stu] dddd [kl] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'um %s',
            past: '%s s\xED\xF0ani',
            s: 'f\xE1 sekund',
            m: 'ein minutt',
            mm: '%d minuttir',
            h: 'ein t\xEDmi',
            hh: '%d t\xEDmar',
            d: 'ein dagur',
            dd: '%d dagar',
            M: 'ein m\xE1na\xF0i',
            MM: '%d m\xE1na\xF0ir',
            y: 'eitt \xE1r',
            yy: '%d \xE1r'
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));