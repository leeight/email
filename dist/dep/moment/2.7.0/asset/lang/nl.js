(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/nl', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var monthsShortWithDots = 'jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.'.split('_'), monthsShortWithoutDots = 'jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec'.split('_');
    return moment.lang('nl', {
        months: 'januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december'.split('_'),
        monthsShort: function (m, format) {
            if (/-MMM-/.test(format)) {
                return monthsShortWithoutDots[m.month()];
            } else {
                return monthsShortWithDots[m.month()];
            }
        },
        weekdays: 'zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag'.split('_'),
        weekdaysShort: 'zo._ma._di._wo._do._vr._za.'.split('_'),
        weekdaysMin: 'Zo_Ma_Di_Wo_Do_Vr_Za'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD-MM-YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[vandaag om] LT',
            nextDay: '[morgen om] LT',
            nextWeek: 'dddd [om] LT',
            lastDay: '[gisteren om] LT',
            lastWeek: '[afgelopen] dddd [om] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'over %s',
            past: '%s geleden',
            s: 'een paar seconden',
            m: '\xE9\xE9n minuut',
            mm: '%d minuten',
            h: '\xE9\xE9n uur',
            hh: '%d uur',
            d: '\xE9\xE9n dag',
            dd: '%d dagen',
            M: '\xE9\xE9n maand',
            MM: '%d maanden',
            y: '\xE9\xE9n jaar',
            yy: '%d jaar'
        },
        ordinal: function (number) {
            return number + (number === 1 || number === 8 || number >= 20 ? 'ste' : 'de');
        },
        week: {
            dow: 1,
            doy: 4
        }
    });
}));