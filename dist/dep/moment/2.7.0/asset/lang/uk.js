(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/uk', ['moment'], factory);
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
                'mm': '\u0445\u0432\u0438\u043B\u0438\u043D\u0430_\u0445\u0432\u0438\u043B\u0438\u043D\u0438_\u0445\u0432\u0438\u043B\u0438\u043D',
                'hh': '\u0433\u043E\u0434\u0438\u043D\u0430_\u0433\u043E\u0434\u0438\u043D\u0438_\u0433\u043E\u0434\u0438\u043D',
                'dd': '\u0434\u0435\u043D\u044C_\u0434\u043D\u0456_\u0434\u043D\u0456\u0432',
                'MM': '\u043C\u0456\u0441\u044F\u0446\u044C_\u043C\u0456\u0441\u044F\u0446\u0456_\u043C\u0456\u0441\u044F\u0446\u0456\u0432',
                'yy': '\u0440\u0456\u043A_\u0440\u043E\u043A\u0438_\u0440\u043E\u043A\u0456\u0432'
            };
        if (key === 'm') {
            return withoutSuffix ? '\u0445\u0432\u0438\u043B\u0438\u043D\u0430' : '\u0445\u0432\u0438\u043B\u0438\u043D\u0443';
        } else if (key === 'h') {
            return withoutSuffix ? '\u0433\u043E\u0434\u0438\u043D\u0430' : '\u0433\u043E\u0434\u0438\u043D\u0443';
        } else {
            return number + ' ' + plural(format[key], +number);
        }
    }
    function monthsCaseReplace(m, format) {
        var months = {
                'nominative': '\u0441\u0456\u0447\u0435\u043D\u044C_\u043B\u044E\u0442\u0438\u0439_\u0431\u0435\u0440\u0435\u0437\u0435\u043D\u044C_\u043A\u0432\u0456\u0442\u0435\u043D\u044C_\u0442\u0440\u0430\u0432\u0435\u043D\u044C_\u0447\u0435\u0440\u0432\u0435\u043D\u044C_\u043B\u0438\u043F\u0435\u043D\u044C_\u0441\u0435\u0440\u043F\u0435\u043D\u044C_\u0432\u0435\u0440\u0435\u0441\u0435\u043D\u044C_\u0436\u043E\u0432\u0442\u0435\u043D\u044C_\u043B\u0438\u0441\u0442\u043E\u043F\u0430\u0434_\u0433\u0440\u0443\u0434\u0435\u043D\u044C'.split('_'),
                'accusative': '\u0441\u0456\u0447\u043D\u044F_\u043B\u044E\u0442\u043E\u0433\u043E_\u0431\u0435\u0440\u0435\u0437\u043D\u044F_\u043A\u0432\u0456\u0442\u043D\u044F_\u0442\u0440\u0430\u0432\u043D\u044F_\u0447\u0435\u0440\u0432\u043D\u044F_\u043B\u0438\u043F\u043D\u044F_\u0441\u0435\u0440\u043F\u043D\u044F_\u0432\u0435\u0440\u0435\u0441\u043D\u044F_\u0436\u043E\u0432\u0442\u043D\u044F_\u043B\u0438\u0441\u0442\u043E\u043F\u0430\u0434\u0430_\u0433\u0440\u0443\u0434\u043D\u044F'.split('_')
            }, nounCase = /D[oD]? *MMMM?/.test(format) ? 'accusative' : 'nominative';
        return months[nounCase][m.month()];
    }
    function weekdaysCaseReplace(m, format) {
        var weekdays = {
                'nominative': '\u043D\u0435\u0434\u0456\u043B\u044F_\u043F\u043E\u043D\u0435\u0434\u0456\u043B\u043E\u043A_\u0432\u0456\u0432\u0442\u043E\u0440\u043E\u043A_\u0441\u0435\u0440\u0435\u0434\u0430_\u0447\u0435\u0442\u0432\u0435\u0440_\u043F\u2019\u044F\u0442\u043D\u0438\u0446\u044F_\u0441\u0443\u0431\u043E\u0442\u0430'.split('_'),
                'accusative': '\u043D\u0435\u0434\u0456\u043B\u044E_\u043F\u043E\u043D\u0435\u0434\u0456\u043B\u043E\u043A_\u0432\u0456\u0432\u0442\u043E\u0440\u043E\u043A_\u0441\u0435\u0440\u0435\u0434\u0443_\u0447\u0435\u0442\u0432\u0435\u0440_\u043F\u2019\u044F\u0442\u043D\u0438\u0446\u044E_\u0441\u0443\u0431\u043E\u0442\u0443'.split('_'),
                'genitive': '\u043D\u0435\u0434\u0456\u043B\u0456_\u043F\u043E\u043D\u0435\u0434\u0456\u043B\u043A\u0430_\u0432\u0456\u0432\u0442\u043E\u0440\u043A\u0430_\u0441\u0435\u0440\u0435\u0434\u0438_\u0447\u0435\u0442\u0432\u0435\u0440\u0433\u0430_\u043F\u2019\u044F\u0442\u043D\u0438\u0446\u0456_\u0441\u0443\u0431\u043E\u0442\u0438'.split('_')
            }, nounCase = /(\[[ВвУу]\]) ?dddd/.test(format) ? 'accusative' : /\[?(?:минулої|наступної)? ?\] ?dddd/.test(format) ? 'genitive' : 'nominative';
        return weekdays[nounCase][m.day()];
    }
    function processHoursFunction(str) {
        return function () {
            return str + '\u043E' + (this.hours() === 11 ? '\u0431' : '') + '] LT';
        };
    }
    return moment.lang('uk', {
        months: monthsCaseReplace,
        monthsShort: '\u0441\u0456\u0447_\u043B\u044E\u0442_\u0431\u0435\u0440_\u043A\u0432\u0456\u0442_\u0442\u0440\u0430\u0432_\u0447\u0435\u0440\u0432_\u043B\u0438\u043F_\u0441\u0435\u0440\u043F_\u0432\u0435\u0440_\u0436\u043E\u0432\u0442_\u043B\u0438\u0441\u0442_\u0433\u0440\u0443\u0434'.split('_'),
        weekdays: weekdaysCaseReplace,
        weekdaysShort: '\u043D\u0434_\u043F\u043D_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043F\u0442_\u0441\u0431'.split('_'),
        weekdaysMin: '\u043D\u0434_\u043F\u043D_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043F\u0442_\u0441\u0431'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY \u0440.',
            LLL: 'D MMMM YYYY \u0440., LT',
            LLLL: 'dddd, D MMMM YYYY \u0440., LT'
        },
        calendar: {
            sameDay: processHoursFunction('[\u0421\u044C\u043E\u0433\u043E\u0434\u043D\u0456 '),
            nextDay: processHoursFunction('[\u0417\u0430\u0432\u0442\u0440\u0430 '),
            lastDay: processHoursFunction('[\u0412\u0447\u043E\u0440\u0430 '),
            nextWeek: processHoursFunction('[\u0423] dddd ['),
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 5:
                case 6:
                    return processHoursFunction('[\u041C\u0438\u043D\u0443\u043B\u043E\u0457] dddd [').call(this);
                case 1:
                case 2:
                case 4:
                    return processHoursFunction('[\u041C\u0438\u043D\u0443\u043B\u043E\u0433\u043E] dddd [').call(this);
                }
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: '\u0437\u0430 %s',
            past: '%s \u0442\u043E\u043C\u0443',
            s: '\u0434\u0435\u043A\u0456\u043B\u044C\u043A\u0430 \u0441\u0435\u043A\u0443\u043D\u0434',
            m: relativeTimeWithPlural,
            mm: relativeTimeWithPlural,
            h: '\u0433\u043E\u0434\u0438\u043D\u0443',
            hh: relativeTimeWithPlural,
            d: '\u0434\u0435\u043D\u044C',
            dd: relativeTimeWithPlural,
            M: '\u043C\u0456\u0441\u044F\u0446\u044C',
            MM: relativeTimeWithPlural,
            y: '\u0440\u0456\u043A',
            yy: relativeTimeWithPlural
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 4) {
                return '\u043D\u043E\u0447\u0456';
            } else if (hour < 12) {
                return '\u0440\u0430\u043D\u043A\u0443';
            } else if (hour < 17) {
                return '\u0434\u043D\u044F';
            } else {
                return '\u0432\u0435\u0447\u043E\u0440\u0430';
            }
        },
        ordinal: function (number, period) {
            switch (period) {
            case 'M':
            case 'd':
            case 'DDD':
            case 'w':
            case 'W':
                return number + '-\u0439';
            case 'D':
                return number + '-\u0433\u043E';
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