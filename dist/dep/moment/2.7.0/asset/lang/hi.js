(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/hi', ['moment'], factory);
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
    return moment.lang('hi', {
        months: '\u091C\u0928\u0935\u0930\u0940_\u092B\u093C\u0930\u0935\u0930\u0940_\u092E\u093E\u0930\u094D\u091A_\u0905\u092A\u094D\u0930\u0948\u0932_\u092E\u0908_\u091C\u0942\u0928_\u091C\u0941\u0932\u093E\u0908_\u0905\u0917\u0938\u094D\u0924_\u0938\u093F\u0924\u092E\u094D\u092C\u0930_\u0905\u0915\u094D\u091F\u0942\u092C\u0930_\u0928\u0935\u092E\u094D\u092C\u0930_\u0926\u093F\u0938\u092E\u094D\u092C\u0930'.split('_'),
        monthsShort: '\u091C\u0928._\u092B\u093C\u0930._\u092E\u093E\u0930\u094D\u091A_\u0905\u092A\u094D\u0930\u0948._\u092E\u0908_\u091C\u0942\u0928_\u091C\u0941\u0932._\u0905\u0917._\u0938\u093F\u0924._\u0905\u0915\u094D\u091F\u0942._\u0928\u0935._\u0926\u093F\u0938.'.split('_'),
        weekdays: '\u0930\u0935\u093F\u0935\u093E\u0930_\u0938\u094B\u092E\u0935\u093E\u0930_\u092E\u0902\u0917\u0932\u0935\u093E\u0930_\u092C\u0941\u0927\u0935\u093E\u0930_\u0917\u0941\u0930\u0942\u0935\u093E\u0930_\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930_\u0936\u0928\u093F\u0935\u093E\u0930'.split('_'),
        weekdaysShort: '\u0930\u0935\u093F_\u0938\u094B\u092E_\u092E\u0902\u0917\u0932_\u092C\u0941\u0927_\u0917\u0941\u0930\u0942_\u0936\u0941\u0915\u094D\u0930_\u0936\u0928\u093F'.split('_'),
        weekdaysMin: '\u0930_\u0938\u094B_\u092E\u0902_\u092C\u0941_\u0917\u0941_\u0936\u0941_\u0936'.split('_'),
        longDateFormat: {
            LT: 'A h:mm \u092C\u091C\u0947',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY, LT',
            LLLL: 'dddd, D MMMM YYYY, LT'
        },
        calendar: {
            sameDay: '[\u0906\u091C] LT',
            nextDay: '[\u0915\u0932] LT',
            nextWeek: 'dddd, LT',
            lastDay: '[\u0915\u0932] LT',
            lastWeek: '[\u092A\u093F\u091B\u0932\u0947] dddd, LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s \u092E\u0947\u0902',
            past: '%s \u092A\u0939\u0932\u0947',
            s: '\u0915\u0941\u091B \u0939\u0940 \u0915\u094D\u0937\u0923',
            m: '\u090F\u0915 \u092E\u093F\u0928\u091F',
            mm: '%d \u092E\u093F\u0928\u091F',
            h: '\u090F\u0915 \u0918\u0902\u091F\u093E',
            hh: '%d \u0918\u0902\u091F\u0947',
            d: '\u090F\u0915 \u0926\u093F\u0928',
            dd: '%d \u0926\u093F\u0928',
            M: '\u090F\u0915 \u092E\u0939\u0940\u0928\u0947',
            MM: '%d \u092E\u0939\u0940\u0928\u0947',
            y: '\u090F\u0915 \u0935\u0930\u094D\u0937',
            yy: '%d \u0935\u0930\u094D\u0937'
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
            if (hour < 4) {
                return '\u0930\u093E\u0924';
            } else if (hour < 10) {
                return '\u0938\u0941\u092C\u0939';
            } else if (hour < 17) {
                return '\u0926\u094B\u092A\u0939\u0930';
            } else if (hour < 20) {
                return '\u0936\u093E\u092E';
            } else {
                return '\u0930\u093E\u0924';
            }
        },
        week: {
            dow: 0,
            doy: 6
        }
    });
}));