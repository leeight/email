(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/ru', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    function plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2];
    }
    function relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
                'mm': withoutSuffix ? '\u043C\u0438\u043D\u0443\u0442\u0430_\u043C\u0438\u043D\u0443\u0442\u044B_\u043C\u0438\u043D\u0443\u0442' : '\u043C\u0438\u043D\u0443\u0442\u0443_\u043C\u0438\u043D\u0443\u0442\u044B_\u043C\u0438\u043D\u0443\u0442',
                'hh': '\u0447\u0430\u0441_\u0447\u0430\u0441\u0430_\u0447\u0430\u0441\u043E\u0432',
                'dd': '\u0434\u0435\u043D\u044C_\u0434\u043D\u044F_\u0434\u043D\u0435\u0439',
                'MM': '\u043C\u0435\u0441\u044F\u0446_\u043C\u0435\u0441\u044F\u0446\u0430_\u043C\u0435\u0441\u044F\u0446\u0435\u0432',
                'yy': '\u0433\u043E\u0434_\u0433\u043E\u0434\u0430_\u043B\u0435\u0442'
            };
        if (key === 'm') {
            return withoutSuffix ? '\u043C\u0438\u043D\u0443\u0442\u0430' : '\u043C\u0438\u043D\u0443\u0442\u0443';
        } else {
            return number + ' ' + plural(format[key], +number);
        }
    }
    function monthsCaseReplace(m, format) {
        var months = {
                'nominative': '\u044F\u043D\u0432\u0430\u0440\u044C_\u0444\u0435\u0432\u0440\u0430\u043B\u044C_\u043C\u0430\u0440\u0442_\u0430\u043F\u0440\u0435\u043B\u044C_\u043C\u0430\u0439_\u0438\u044E\u043D\u044C_\u0438\u044E\u043B\u044C_\u0430\u0432\u0433\u0443\u0441\u0442_\u0441\u0435\u043D\u0442\u044F\u0431\u0440\u044C_\u043E\u043A\u0442\u044F\u0431\u0440\u044C_\u043D\u043E\u044F\u0431\u0440\u044C_\u0434\u0435\u043A\u0430\u0431\u0440\u044C'.split('_'),
                'accusative': '\u044F\u043D\u0432\u0430\u0440\u044F_\u0444\u0435\u0432\u0440\u0430\u043B\u044F_\u043C\u0430\u0440\u0442\u0430_\u0430\u043F\u0440\u0435\u043B\u044F_\u043C\u0430\u044F_\u0438\u044E\u043D\u044F_\u0438\u044E\u043B\u044F_\u0430\u0432\u0433\u0443\u0441\u0442\u0430_\u0441\u0435\u043D\u0442\u044F\u0431\u0440\u044F_\u043E\u043A\u0442\u044F\u0431\u0440\u044F_\u043D\u043E\u044F\u0431\u0440\u044F_\u0434\u0435\u043A\u0430\u0431\u0440\u044F'.split('_')
            }, nounCase = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? 'accusative' : 'nominative';
        return months[nounCase][m.month()];
    }
    function monthsShortCaseReplace(m, format) {
        var monthsShort = {
                'nominative': '\u044F\u043D\u0432_\u0444\u0435\u0432_\u043C\u0430\u0440_\u0430\u043F\u0440_\u043C\u0430\u0439_\u0438\u044E\u043D\u044C_\u0438\u044E\u043B\u044C_\u0430\u0432\u0433_\u0441\u0435\u043D_\u043E\u043A\u0442_\u043D\u043E\u044F_\u0434\u0435\u043A'.split('_'),
                'accusative': '\u044F\u043D\u0432_\u0444\u0435\u0432_\u043C\u0430\u0440_\u0430\u043F\u0440_\u043C\u0430\u044F_\u0438\u044E\u043D\u044F_\u0438\u044E\u043B\u044F_\u0430\u0432\u0433_\u0441\u0435\u043D_\u043E\u043A\u0442_\u043D\u043E\u044F_\u0434\u0435\u043A'.split('_')
            }, nounCase = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? 'accusative' : 'nominative';
        return monthsShort[nounCase][m.month()];
    }
    function weekdaysCaseReplace(m, format) {
        var weekdays = {
                'nominative': '\u0432\u043E\u0441\u043A\u0440\u0435\u0441\u0435\u043D\u044C\u0435_\u043F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A_\u0432\u0442\u043E\u0440\u043D\u0438\u043A_\u0441\u0440\u0435\u0434\u0430_\u0447\u0435\u0442\u0432\u0435\u0440\u0433_\u043F\u044F\u0442\u043D\u0438\u0446\u0430_\u0441\u0443\u0431\u0431\u043E\u0442\u0430'.split('_'),
                'accusative': '\u0432\u043E\u0441\u043A\u0440\u0435\u0441\u0435\u043D\u044C\u0435_\u043F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A_\u0432\u0442\u043E\u0440\u043D\u0438\u043A_\u0441\u0440\u0435\u0434\u0443_\u0447\u0435\u0442\u0432\u0435\u0440\u0433_\u043F\u044F\u0442\u043D\u0438\u0446\u0443_\u0441\u0443\u0431\u0431\u043E\u0442\u0443'.split('_')
            }, nounCase = /\[ ?[Вв] ?(?:прошлую|следующую)? ?\] ?dddd/.test(format) ? 'accusative' : 'nominative';
        return weekdays[nounCase][m.day()];
    }
    return moment.lang('ru', {
        months: monthsCaseReplace,
        monthsShort: monthsShortCaseReplace,
        weekdays: weekdaysCaseReplace,
        weekdaysShort: '\u0432\u0441_\u043F\u043D_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043F\u0442_\u0441\u0431'.split('_'),
        weekdaysMin: '\u0432\u0441_\u043F\u043D_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043F\u0442_\u0441\u0431'.split('_'),
        monthsParse: [
            /^янв/i,
            /^фев/i,
            /^мар/i,
            /^апр/i,
            /^ма[й|я]/i,
            /^июн/i,
            /^июл/i,
            /^авг/i,
            /^сен/i,
            /^окт/i,
            /^ноя/i,
            /^дек/i
        ],
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY \u0433.',
            LLL: 'D MMMM YYYY \u0433., LT',
            LLLL: 'dddd, D MMMM YYYY \u0433., LT'
        },
        calendar: {
            sameDay: '[\u0421\u0435\u0433\u043E\u0434\u043D\u044F \u0432] LT',
            nextDay: '[\u0417\u0430\u0432\u0442\u0440\u0430 \u0432] LT',
            lastDay: '[\u0412\u0447\u0435\u0440\u0430 \u0432] LT',
            nextWeek: function () {
                return this.day() === 2 ? '[\u0412\u043E] dddd [\u0432] LT' : '[\u0412] dddd [\u0432] LT';
            },
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[\u0412 \u043F\u0440\u043E\u0448\u043B\u043E\u0435] dddd [\u0432] LT';
                case 1:
                case 2:
                case 4:
                    return '[\u0412 \u043F\u0440\u043E\u0448\u043B\u044B\u0439] dddd [\u0432] LT';
                case 3:
                case 5:
                case 6:
                    return '[\u0412 \u043F\u0440\u043E\u0448\u043B\u0443\u044E] dddd [\u0432] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: '\u0447\u0435\u0440\u0435\u0437 %s',
            past: '%s \u043D\u0430\u0437\u0430\u0434',
            s: '\u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0441\u0435\u043A\u0443\u043D\u0434',
            m: relativeTimeWithPlural,
            mm: relativeTimeWithPlural,
            h: '\u0447\u0430\u0441',
            hh: relativeTimeWithPlural,
            d: '\u0434\u0435\u043D\u044C',
            dd: relativeTimeWithPlural,
            M: '\u043C\u0435\u0441\u044F\u0446',
            MM: relativeTimeWithPlural,
            y: '\u0433\u043E\u0434',
            yy: relativeTimeWithPlural
        },
        meridiemParse: /ночи|утра|дня|вечера/i,
        isPM: function (input) {
            return /^(дня|вечера)$/.test(input);
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 4) {
                return '\u043D\u043E\u0447\u0438';
            } else if (hour < 12) {
                return '\u0443\u0442\u0440\u0430';
            } else if (hour < 17) {
                return '\u0434\u043D\u044F';
            } else {
                return '\u0432\u0435\u0447\u0435\u0440\u0430';
            }
        },
        ordinal: function (number, period) {
            switch (period) {
            case 'M':
            case 'd':
            case 'DDD':
                return number + '-\u0439';
            case 'D':
                return number + '-\u0433\u043E';
            case 'w':
            case 'W':
                return number + '-\u044F';
            default:
                return number;
            }
        },
        week: {
            dow: 1,
            doy: 7
        }
    });
}));