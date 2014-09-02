(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/ne', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var symbolMap = {
            '1': '\u0967',
            '2': '\u0968',
            '3': '\u0969',
            '4': '\u096A',
            '5': '\u096B',
            '6': '\u096C',
            '7': '\u096D',
            '8': '\u096E',
            '9': '\u096F',
            '0': '\u0966'
        }, numberMap = {
            '\u0967': '1',
            '\u0968': '2',
            '\u0969': '3',
            '\u096A': '4',
            '\u096B': '5',
            '\u096C': '6',
            '\u096D': '7',
            '\u096E': '8',
            '\u096F': '9',
            '\u0966': '0'
        };
    return moment.lang('ne', {
        months: '\u091C\u0928\u0935\u0930\u0940_\u092B\u0947\u092C\u094D\u0930\u0941\u0935\u0930\u0940_\u092E\u093E\u0930\u094D\u091A_\u0905\u092A\u094D\u0930\u093F\u0932_\u092E\u0908_\u091C\u0941\u0928_\u091C\u0941\u0932\u093E\u0908_\u0905\u0917\u0937\u094D\u091F_\u0938\u0947\u092A\u094D\u091F\u0947\u092E\u094D\u092C\u0930_\u0905\u0915\u094D\u091F\u094B\u092C\u0930_\u0928\u094B\u092D\u0947\u092E\u094D\u092C\u0930_\u0921\u093F\u0938\u0947\u092E\u094D\u092C\u0930'.split('_'),
        monthsShort: '\u091C\u0928._\u092B\u0947\u092C\u094D\u0930\u0941._\u092E\u093E\u0930\u094D\u091A_\u0905\u092A\u094D\u0930\u093F._\u092E\u0908_\u091C\u0941\u0928_\u091C\u0941\u0932\u093E\u0908._\u0905\u0917._\u0938\u0947\u092A\u094D\u091F._\u0905\u0915\u094D\u091F\u094B._\u0928\u094B\u092D\u0947._\u0921\u093F\u0938\u0947.'.split('_'),
        weekdays: '\u0906\u0907\u0924\u092C\u093E\u0930_\u0938\u094B\u092E\u092C\u093E\u0930_\u092E\u0919\u094D\u0917\u0932\u092C\u093E\u0930_\u092C\u0941\u0927\u092C\u093E\u0930_\u092C\u093F\u0939\u093F\u092C\u093E\u0930_\u0936\u0941\u0915\u094D\u0930\u092C\u093E\u0930_\u0936\u0928\u093F\u092C\u093E\u0930'.split('_'),
        weekdaysShort: '\u0906\u0907\u0924._\u0938\u094B\u092E._\u092E\u0919\u094D\u0917\u0932._\u092C\u0941\u0927._\u092C\u093F\u0939\u093F._\u0936\u0941\u0915\u094D\u0930._\u0936\u0928\u093F.'.split('_'),
        weekdaysMin: '\u0906\u0907._\u0938\u094B._\u092E\u0919\u094D_\u092C\u0941._\u092C\u093F._\u0936\u0941._\u0936.'.split('_'),
        longDateFormat: {
            LT: 'A\u0915\u094B h:mm \u092C\u091C\u0947',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY, LT',
            LLLL: 'dddd, D MMMM YYYY, LT'
        },
        preparse: function (string) {
            return string.replace(/[१२३४५६७८९०]/g, function (match) {
                return numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            });
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 3) {
                return '\u0930\u093E\u0924\u0940';
            } else if (hour < 10) {
                return '\u092C\u093F\u0939\u093E\u0928';
            } else if (hour < 15) {
                return '\u0926\u093F\u0909\u0901\u0938\u094B';
            } else if (hour < 18) {
                return '\u092C\u0947\u0932\u0941\u0915\u093E';
            } else if (hour < 20) {
                return '\u0938\u093E\u0901\u091D';
            } else {
                return '\u0930\u093E\u0924\u0940';
            }
        },
        calendar: {
            sameDay: '[\u0906\u091C] LT',
            nextDay: '[\u092D\u094B\u0932\u0940] LT',
            nextWeek: '[\u0906\u0909\u0901\u0926\u094B] dddd[,] LT',
            lastDay: '[\u0939\u093F\u091C\u094B] LT',
            lastWeek: '[\u0917\u090F\u0915\u094B] dddd[,] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s\u092E\u093E',
            past: '%s \u0905\u0917\u093E\u0921\u0940',
            s: '\u0915\u0947\u0939\u0940 \u0938\u092E\u092F',
            m: '\u090F\u0915 \u092E\u093F\u0928\u0947\u091F',
            mm: '%d \u092E\u093F\u0928\u0947\u091F',
            h: '\u090F\u0915 \u0918\u0923\u094D\u091F\u093E',
            hh: '%d \u0918\u0923\u094D\u091F\u093E',
            d: '\u090F\u0915 \u0926\u093F\u0928',
            dd: '%d \u0926\u093F\u0928',
            M: '\u090F\u0915 \u092E\u0939\u093F\u0928\u093E',
            MM: '%d \u092E\u0939\u093F\u0928\u093E',
            y: '\u090F\u0915 \u092C\u0930\u094D\u0937',
            yy: '%d \u092C\u0930\u094D\u0937'
        },
        week: {
            dow: 1,
            doy: 7
        }
    });
}));