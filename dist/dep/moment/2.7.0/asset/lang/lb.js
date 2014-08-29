(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/lb', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    function processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
                'm': [
                    'eng Minutt',
                    'enger Minutt'
                ],
                'h': [
                    'eng Stonn',
                    'enger Stonn'
                ],
                'd': [
                    'een Dag',
                    'engem Dag'
                ],
                'dd': [
                    number + ' Deeg',
                    number + ' Deeg'
                ],
                'M': [
                    'ee Mount',
                    'engem Mount'
                ],
                'MM': [
                    number + ' M\xE9int',
                    number + ' M\xE9int'
                ],
                'y': [
                    'ee Joer',
                    'engem Joer'
                ],
                'yy': [
                    number + ' Joer',
                    number + ' Joer'
                ]
            };
        return withoutSuffix ? format[key][0] : format[key][1];
    }
    function processFutureTime(string) {
        var number = string.substr(0, string.indexOf(' '));
        if (eifelerRegelAppliesToNumber(number)) {
            return 'a ' + string;
        }
        return 'an ' + string;
    }
    function processPastTime(string) {
        var number = string.substr(0, string.indexOf(' '));
        if (eifelerRegelAppliesToNumber(number)) {
            return 'viru ' + string;
        }
        return 'virun ' + string;
    }
    function processLastWeek(string1) {
        var weekday = this.format('d');
        if (eifelerRegelAppliesToWeekday(weekday)) {
            return '[Leschte] dddd [um] LT';
        }
        return '[Leschten] dddd [um] LT';
    }
    function eifelerRegelAppliesToWeekday(weekday) {
        weekday = parseInt(weekday, 10);
        switch (weekday) {
        case 0:
        case 1:
        case 3:
        case 5:
        case 6:
            return true;
        default:
            return false;
        }
    }
    function eifelerRegelAppliesToNumber(number) {
        number = parseInt(number, 10);
        if (isNaN(number)) {
            return false;
        }
        if (number < 0) {
            return true;
        } else if (number < 10) {
            if (4 <= number && number <= 7) {
                return true;
            }
            return false;
        } else if (number < 100) {
            var lastDigit = number % 10, firstDigit = number / 10;
            if (lastDigit === 0) {
                return eifelerRegelAppliesToNumber(firstDigit);
            }
            return eifelerRegelAppliesToNumber(lastDigit);
        } else if (number < 10000) {
            while (number >= 10) {
                number = number / 10;
            }
            return eifelerRegelAppliesToNumber(number);
        } else {
            number = number / 1000;
            return eifelerRegelAppliesToNumber(number);
        }
    }
    return moment.lang('lb', {
        months: 'Januar_Februar_M\xE4erz_Abr\xEBll_Mee_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
        monthsShort: 'Jan._Febr._Mrz._Abr._Mee_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
        weekdays: 'Sonndeg_M\xE9indeg_D\xEBnschdeg_M\xEBttwoch_Donneschdeg_Freideg_Samschdeg'.split('_'),
        weekdaysShort: 'So._M\xE9._D\xEB._M\xEB._Do._Fr._Sa.'.split('_'),
        weekdaysMin: 'So_M\xE9_D\xEB_M\xEB_Do_Fr_Sa'.split('_'),
        longDateFormat: {
            LT: 'H:mm [Auer]',
            L: 'DD.MM.YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd, D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Haut um] LT',
            sameElse: 'L',
            nextDay: '[Muer um] LT',
            nextWeek: 'dddd [um] LT',
            lastDay: '[G\xEBschter um] LT',
            lastWeek: processLastWeek
        },
        relativeTime: {
            future: processFutureTime,
            past: processPastTime,
            s: 'e puer Sekonnen',
            m: processRelativeTime,
            mm: '%d Minutten',
            h: processRelativeTime,
            hh: '%d Stonnen',
            d: processRelativeTime,
            dd: processRelativeTime,
            M: processRelativeTime,
            MM: processRelativeTime,
            y: processRelativeTime,
            yy: processRelativeTime
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));