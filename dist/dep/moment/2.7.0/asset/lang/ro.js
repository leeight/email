(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/ro', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    function relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
                'mm': 'minute',
                'hh': 'ore',
                'dd': 'zile',
                'MM': 'luni',
                'yy': 'ani'
            }, separator = ' ';
        if (number % 100 >= 20 || number >= 100 && number % 100 === 0) {
            separator = ' de ';
        }
        return number + separator + format[key];
    }
    return moment.lang('ro', {
        months: 'ianuarie_februarie_martie_aprilie_mai_iunie_iulie_august_septembrie_octombrie_noiembrie_decembrie'.split('_'),
        monthsShort: 'ian._febr._mart._apr._mai_iun._iul._aug._sept._oct._nov._dec.'.split('_'),
        weekdays: 'duminic\u0103_luni_mar\u021Bi_miercuri_joi_vineri_s\xE2mb\u0103t\u0103'.split('_'),
        weekdaysShort: 'Dum_Lun_Mar_Mie_Joi_Vin_S\xE2m'.split('_'),
        weekdaysMin: 'Du_Lu_Ma_Mi_Jo_Vi_S\xE2'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY H:mm',
            LLLL: 'dddd, D MMMM YYYY H:mm'
        },
        calendar: {
            sameDay: '[azi la] LT',
            nextDay: '[m\xE2ine la] LT',
            nextWeek: 'dddd [la] LT',
            lastDay: '[ieri la] LT',
            lastWeek: '[fosta] dddd [la] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'peste %s',
            past: '%s \xEEn urm\u0103',
            s: 'c\xE2teva secunde',
            m: 'un minut',
            mm: relativeTimeWithPlural,
            h: 'o or\u0103',
            hh: relativeTimeWithPlural,
            d: 'o zi',
            dd: relativeTimeWithPlural,
            M: 'o lun\u0103',
            MM: relativeTimeWithPlural,
            y: 'un an',
            yy: relativeTimeWithPlural
        },
        week: {
            dow: 1,
            doy: 7
        }
    });
}));