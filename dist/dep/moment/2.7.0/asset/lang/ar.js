(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/ar', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var symbolMap = {
            '1': '\u0661',
            '2': '\u0662',
            '3': '\u0663',
            '4': '\u0664',
            '5': '\u0665',
            '6': '\u0666',
            '7': '\u0667',
            '8': '\u0668',
            '9': '\u0669',
            '0': '\u0660'
        }, numberMap = {
            '\u0661': '1',
            '\u0662': '2',
            '\u0663': '3',
            '\u0664': '4',
            '\u0665': '5',
            '\u0666': '6',
            '\u0667': '7',
            '\u0668': '8',
            '\u0669': '9',
            '\u0660': '0'
        };
    return moment.lang('ar', {
        months: '\u064A\u0646\u0627\u064A\u0631/ \u0643\u0627\u0646\u0648\u0646 \u0627\u0644\u062B\u0627\u0646\u064A_\u0641\u0628\u0631\u0627\u064A\u0631/ \u0634\u0628\u0627\u0637_\u0645\u0627\u0631\u0633/ \u0622\u0630\u0627\u0631_\u0623\u0628\u0631\u064A\u0644/ \u0646\u064A\u0633\u0627\u0646_\u0645\u0627\u064A\u0648/ \u0623\u064A\u0627\u0631_\u064A\u0648\u0646\u064A\u0648/ \u062D\u0632\u064A\u0631\u0627\u0646_\u064A\u0648\u0644\u064A\u0648/ \u062A\u0645\u0648\u0632_\u0623\u063A\u0633\u0637\u0633/ \u0622\u0628_\u0633\u0628\u062A\u0645\u0628\u0631/ \u0623\u064A\u0644\u0648\u0644_\u0623\u0643\u062A\u0648\u0628\u0631/ \u062A\u0634\u0631\u064A\u0646 \u0627\u0644\u0623\u0648\u0644_\u0646\u0648\u0641\u0645\u0628\u0631/ \u062A\u0634\u0631\u064A\u0646 \u0627\u0644\u062B\u0627\u0646\u064A_\u062F\u064A\u0633\u0645\u0628\u0631/ \u0643\u0627\u0646\u0648\u0646 \u0627\u0644\u0623\u0648\u0644'.split('_'),
        monthsShort: '\u064A\u0646\u0627\u064A\u0631/ \u0643\u0627\u0646\u0648\u0646 \u0627\u0644\u062B\u0627\u0646\u064A_\u0641\u0628\u0631\u0627\u064A\u0631/ \u0634\u0628\u0627\u0637_\u0645\u0627\u0631\u0633/ \u0622\u0630\u0627\u0631_\u0623\u0628\u0631\u064A\u0644/ \u0646\u064A\u0633\u0627\u0646_\u0645\u0627\u064A\u0648/ \u0623\u064A\u0627\u0631_\u064A\u0648\u0646\u064A\u0648/ \u062D\u0632\u064A\u0631\u0627\u0646_\u064A\u0648\u0644\u064A\u0648/ \u062A\u0645\u0648\u0632_\u0623\u063A\u0633\u0637\u0633/ \u0622\u0628_\u0633\u0628\u062A\u0645\u0628\u0631/ \u0623\u064A\u0644\u0648\u0644_\u0623\u0643\u062A\u0648\u0628\u0631/ \u062A\u0634\u0631\u064A\u0646 \u0627\u0644\u0623\u0648\u0644_\u0646\u0648\u0641\u0645\u0628\u0631/ \u062A\u0634\u0631\u064A\u0646 \u0627\u0644\u062B\u0627\u0646\u064A_\u062F\u064A\u0633\u0645\u0628\u0631/ \u0643\u0627\u0646\u0648\u0646 \u0627\u0644\u0623\u0648\u0644'.split('_'),
        weekdays: '\u0627\u0644\u0623\u062D\u062F_\u0627\u0644\u0625\u062B\u0646\u064A\u0646_\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621_\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621_\u0627\u0644\u062E\u0645\u064A\u0633_\u0627\u0644\u062C\u0645\u0639\u0629_\u0627\u0644\u0633\u0628\u062A'.split('_'),
        weekdaysShort: '\u0623\u062D\u062F_\u0625\u062B\u0646\u064A\u0646_\u062B\u0644\u0627\u062B\u0627\u0621_\u0623\u0631\u0628\u0639\u0627\u0621_\u062E\u0645\u064A\u0633_\u062C\u0645\u0639\u0629_\u0633\u0628\u062A'.split('_'),
        weekdaysMin: '\u062D_\u0646_\u062B_\u0631_\u062E_\u062C_\u0633'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 12) {
                return '\u0635';
            } else {
                return '\u0645';
            }
        },
        calendar: {
            sameDay: '[\u0627\u0644\u064A\u0648\u0645 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            nextDay: '[\u063A\u062F\u0627 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            nextWeek: 'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            lastDay: '[\u0623\u0645\u0633 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            lastWeek: 'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '\u0641\u064A %s',
            past: '\u0645\u0646\u0630 %s',
            s: '\u062B\u0648\u0627\u0646',
            m: '\u062F\u0642\u064A\u0642\u0629',
            mm: '%d \u062F\u0642\u0627\u0626\u0642',
            h: '\u0633\u0627\u0639\u0629',
            hh: '%d \u0633\u0627\u0639\u0627\u062A',
            d: '\u064A\u0648\u0645',
            dd: '%d \u0623\u064A\u0627\u0645',
            M: '\u0634\u0647\u0631',
            MM: '%d \u0623\u0634\u0647\u0631',
            y: '\u0633\u0646\u0629',
            yy: '%d \u0633\u0646\u0648\u0627\u062A'
        },
        preparse: function (string) {
            return string.replace(/[۰-۹]/g, function (match) {
                return numberMap[match];
            }).replace(/،/g, ',');
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            }).replace(/,/g, '\u060C');
        },
        week: {
            dow: 6,
            doy: 12
        }
    });
}));