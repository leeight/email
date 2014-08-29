(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/hy-am', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    function monthsCaseReplace(m, format) {
        var months = {
                'nominative': '\u0570\u0578\u0582\u0576\u057E\u0561\u0580_\u0583\u0565\u057F\u0580\u057E\u0561\u0580_\u0574\u0561\u0580\u057F_\u0561\u057A\u0580\u056B\u056C_\u0574\u0561\u0575\u056B\u057D_\u0570\u0578\u0582\u0576\u056B\u057D_\u0570\u0578\u0582\u056C\u056B\u057D_\u0585\u0563\u0578\u057D\u057F\u0578\u057D_\u057D\u0565\u057A\u057F\u0565\u0574\u0562\u0565\u0580_\u0570\u0578\u056F\u057F\u0565\u0574\u0562\u0565\u0580_\u0576\u0578\u0575\u0565\u0574\u0562\u0565\u0580_\u0564\u0565\u056F\u057F\u0565\u0574\u0562\u0565\u0580'.split('_'),
                'accusative': '\u0570\u0578\u0582\u0576\u057E\u0561\u0580\u056B_\u0583\u0565\u057F\u0580\u057E\u0561\u0580\u056B_\u0574\u0561\u0580\u057F\u056B_\u0561\u057A\u0580\u056B\u056C\u056B_\u0574\u0561\u0575\u056B\u057D\u056B_\u0570\u0578\u0582\u0576\u056B\u057D\u056B_\u0570\u0578\u0582\u056C\u056B\u057D\u056B_\u0585\u0563\u0578\u057D\u057F\u0578\u057D\u056B_\u057D\u0565\u057A\u057F\u0565\u0574\u0562\u0565\u0580\u056B_\u0570\u0578\u056F\u057F\u0565\u0574\u0562\u0565\u0580\u056B_\u0576\u0578\u0575\u0565\u0574\u0562\u0565\u0580\u056B_\u0564\u0565\u056F\u057F\u0565\u0574\u0562\u0565\u0580\u056B'.split('_')
            }, nounCase = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? 'accusative' : 'nominative';
        return months[nounCase][m.month()];
    }
    function monthsShortCaseReplace(m, format) {
        var monthsShort = '\u0570\u0576\u057E_\u0583\u057F\u0580_\u0574\u0580\u057F_\u0561\u057A\u0580_\u0574\u0575\u057D_\u0570\u0576\u057D_\u0570\u056C\u057D_\u0585\u0563\u057D_\u057D\u057A\u057F_\u0570\u056F\u057F_\u0576\u0574\u0562_\u0564\u056F\u057F'.split('_');
        return monthsShort[m.month()];
    }
    function weekdaysCaseReplace(m, format) {
        var weekdays = '\u056F\u056B\u0580\u0561\u056F\u056B_\u0565\u0580\u056F\u0578\u0582\u0577\u0561\u0562\u0569\u056B_\u0565\u0580\u0565\u0584\u0577\u0561\u0562\u0569\u056B_\u0579\u0578\u0580\u0565\u0584\u0577\u0561\u0562\u0569\u056B_\u0570\u056B\u0576\u0563\u0577\u0561\u0562\u0569\u056B_\u0578\u0582\u0580\u0562\u0561\u0569_\u0577\u0561\u0562\u0561\u0569'.split('_');
        return weekdays[m.day()];
    }
    return moment.lang('hy-am', {
        months: monthsCaseReplace,
        monthsShort: monthsShortCaseReplace,
        weekdays: weekdaysCaseReplace,
        weekdaysShort: '\u056F\u0580\u056F_\u0565\u0580\u056F_\u0565\u0580\u0584_\u0579\u0580\u0584_\u0570\u0576\u0563_\u0578\u0582\u0580\u0562_\u0577\u0562\u0569'.split('_'),
        weekdaysMin: '\u056F\u0580\u056F_\u0565\u0580\u056F_\u0565\u0580\u0584_\u0579\u0580\u0584_\u0570\u0576\u0563_\u0578\u0582\u0580\u0562_\u0577\u0562\u0569'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY \u0569.',
            LLL: 'D MMMM YYYY \u0569., LT',
            LLLL: 'dddd, D MMMM YYYY \u0569., LT'
        },
        calendar: {
            sameDay: '[\u0561\u0575\u057D\u0585\u0580] LT',
            nextDay: '[\u057E\u0561\u0572\u0568] LT',
            lastDay: '[\u0565\u0580\u0565\u056F] LT',
            nextWeek: function () {
                return 'dddd [\u0585\u0580\u0568 \u056A\u0561\u0574\u0568] LT';
            },
            lastWeek: function () {
                return '[\u0561\u0576\u0581\u0561\u056E] dddd [\u0585\u0580\u0568 \u056A\u0561\u0574\u0568] LT';
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s \u0570\u0565\u057F\u0578',
            past: '%s \u0561\u057C\u0561\u057B',
            s: '\u0574\u056B \u0584\u0561\u0576\u056B \u057E\u0561\u0575\u0580\u056F\u0575\u0561\u0576',
            m: '\u0580\u0578\u057A\u0565',
            mm: '%d \u0580\u0578\u057A\u0565',
            h: '\u056A\u0561\u0574',
            hh: '%d \u056A\u0561\u0574',
            d: '\u0585\u0580',
            dd: '%d \u0585\u0580',
            M: '\u0561\u0574\u056B\u057D',
            MM: '%d \u0561\u0574\u056B\u057D',
            y: '\u057F\u0561\u0580\u056B',
            yy: '%d \u057F\u0561\u0580\u056B'
        },
        meridiem: function (hour) {
            if (hour < 4) {
                return '\u0563\u056B\u0577\u0565\u0580\u057E\u0561';
            } else if (hour < 12) {
                return '\u0561\u057C\u0561\u057E\u0578\u057F\u057E\u0561';
            } else if (hour < 17) {
                return '\u0581\u0565\u0580\u0565\u056F\u057E\u0561';
            } else {
                return '\u0565\u0580\u0565\u056F\u0578\u0575\u0561\u0576';
            }
        },
        ordinal: function (number, period) {
            switch (period) {
            case 'DDD':
            case 'w':
            case 'W':
            case 'DDDo':
                if (number === 1) {
                    return number + '-\u056B\u0576';
                }
                return number + '-\u0580\u0564';
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