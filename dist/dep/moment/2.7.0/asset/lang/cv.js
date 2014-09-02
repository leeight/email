(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/cv', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('cv', {
        months: '\u043A\u0103\u0440\u043B\u0430\u0447_\u043D\u0430\u0440\u0103\u0441_\u043F\u0443\u0448_\u0430\u043A\u0430_\u043C\u0430\u0439_\xE7\u0115\u0440\u0442\u043C\u0435_\u0443\u0442\u0103_\xE7\u0443\u0440\u043B\u0430_\u0430\u0432\u0103\u043D_\u044E\u043F\u0430_\u0447\u04F3\u043A_\u0440\u0430\u0448\u0442\u0430\u0432'.split('_'),
        monthsShort: '\u043A\u0103\u0440_\u043D\u0430\u0440_\u043F\u0443\u0448_\u0430\u043A\u0430_\u043C\u0430\u0439_\xE7\u0115\u0440_\u0443\u0442\u0103_\xE7\u0443\u0440_\u0430\u0432_\u044E\u043F\u0430_\u0447\u04F3\u043A_\u0440\u0430\u0448'.split('_'),
        weekdays: '\u0432\u044B\u0440\u0441\u0430\u0440\u043D\u0438\u043A\u0443\u043D_\u0442\u0443\u043D\u0442\u0438\u043A\u0443\u043D_\u044B\u0442\u043B\u0430\u0440\u0438\u043A\u0443\u043D_\u044E\u043D\u043A\u0443\u043D_\u043A\u0115\xE7\u043D\u0435\u0440\u043D\u0438\u043A\u0443\u043D_\u044D\u0440\u043D\u0435\u043A\u0443\u043D_\u0448\u0103\u043C\u0430\u0442\u043A\u0443\u043D'.split('_'),
        weekdaysShort: '\u0432\u044B\u0440_\u0442\u0443\u043D_\u044B\u0442\u043B_\u044E\u043D_\u043A\u0115\xE7_\u044D\u0440\u043D_\u0448\u0103\u043C'.split('_'),
        weekdaysMin: '\u0432\u0440_\u0442\u043D_\u044B\u0442_\u044E\u043D_\u043A\xE7_\u044D\u0440_\u0448\u043C'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD-MM-YYYY',
            LL: 'YYYY [\xE7\u0443\u043B\u0445\u0438] MMMM [\u0443\u0439\u0103\u0445\u0115\u043D] D[-\u043C\u0115\u0448\u0115]',
            LLL: 'YYYY [\xE7\u0443\u043B\u0445\u0438] MMMM [\u0443\u0439\u0103\u0445\u0115\u043D] D[-\u043C\u0115\u0448\u0115], LT',
            LLLL: 'dddd, YYYY [\xE7\u0443\u043B\u0445\u0438] MMMM [\u0443\u0439\u0103\u0445\u0115\u043D] D[-\u043C\u0115\u0448\u0115], LT'
        },
        calendar: {
            sameDay: '[\u041F\u0430\u044F\u043D] LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
            nextDay: '[\u042B\u0440\u0430\u043D] LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
            lastDay: '[\u0114\u043D\u0435\u0440] LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
            nextWeek: '[\xC7\u0438\u0442\u0435\u0441] dddd LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
            lastWeek: '[\u0418\u0440\u0442\u043D\u0115] dddd LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
            sameElse: 'L'
        },
        relativeTime: {
            future: function (output) {
                var affix = /сехет$/i.exec(output) ? '\u0440\u0435\u043D' : /çул$/i.exec(output) ? '\u0442\u0430\u043D' : '\u0440\u0430\u043D';
                return output + affix;
            },
            past: '%s \u043A\u0430\u044F\u043B\u043B\u0430',
            s: '\u043F\u0115\u0440-\u0438\u043A \xE7\u0435\u043A\u043A\u0443\u043D\u0442',
            m: '\u043F\u0115\u0440 \u043C\u0438\u043D\u0443\u0442',
            mm: '%d \u043C\u0438\u043D\u0443\u0442',
            h: '\u043F\u0115\u0440 \u0441\u0435\u0445\u0435\u0442',
            hh: '%d \u0441\u0435\u0445\u0435\u0442',
            d: '\u043F\u0115\u0440 \u043A\u0443\u043D',
            dd: '%d \u043A\u0443\u043D',
            M: '\u043F\u0115\u0440 \u0443\u0439\u0103\u0445',
            MM: '%d \u0443\u0439\u0103\u0445',
            y: '\u043F\u0115\u0440 \xE7\u0443\u043B',
            yy: '%d \xE7\u0443\u043B'
        },
        ordinal: '%d-\u043C\u0115\u0448',
        week: {
            dow: 1,
            doy: 7
        }
    });
}));