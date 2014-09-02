(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/el', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('el', {
        monthsNominativeEl: '\u0399\u03B1\u03BD\u03BF\u03C5\u03AC\u03C1\u03B9\u03BF\u03C2_\u03A6\u03B5\u03B2\u03C1\u03BF\u03C5\u03AC\u03C1\u03B9\u03BF\u03C2_\u039C\u03AC\u03C1\u03C4\u03B9\u03BF\u03C2_\u0391\u03C0\u03C1\u03AF\u03BB\u03B9\u03BF\u03C2_\u039C\u03AC\u03B9\u03BF\u03C2_\u0399\u03BF\u03CD\u03BD\u03B9\u03BF\u03C2_\u0399\u03BF\u03CD\u03BB\u03B9\u03BF\u03C2_\u0391\u03CD\u03B3\u03BF\u03C5\u03C3\u03C4\u03BF\u03C2_\u03A3\u03B5\u03C0\u03C4\u03AD\u03BC\u03B2\u03C1\u03B9\u03BF\u03C2_\u039F\u03BA\u03C4\u03CE\u03B2\u03C1\u03B9\u03BF\u03C2_\u039D\u03BF\u03AD\u03BC\u03B2\u03C1\u03B9\u03BF\u03C2_\u0394\u03B5\u03BA\u03AD\u03BC\u03B2\u03C1\u03B9\u03BF\u03C2'.split('_'),
        monthsGenitiveEl: '\u0399\u03B1\u03BD\u03BF\u03C5\u03B1\u03C1\u03AF\u03BF\u03C5_\u03A6\u03B5\u03B2\u03C1\u03BF\u03C5\u03B1\u03C1\u03AF\u03BF\u03C5_\u039C\u03B1\u03C1\u03C4\u03AF\u03BF\u03C5_\u0391\u03C0\u03C1\u03B9\u03BB\u03AF\u03BF\u03C5_\u039C\u03B1\u0390\u03BF\u03C5_\u0399\u03BF\u03C5\u03BD\u03AF\u03BF\u03C5_\u0399\u03BF\u03C5\u03BB\u03AF\u03BF\u03C5_\u0391\u03C5\u03B3\u03BF\u03CD\u03C3\u03C4\u03BF\u03C5_\u03A3\u03B5\u03C0\u03C4\u03B5\u03BC\u03B2\u03C1\u03AF\u03BF\u03C5_\u039F\u03BA\u03C4\u03C9\u03B2\u03C1\u03AF\u03BF\u03C5_\u039D\u03BF\u03B5\u03BC\u03B2\u03C1\u03AF\u03BF\u03C5_\u0394\u03B5\u03BA\u03B5\u03BC\u03B2\u03C1\u03AF\u03BF\u03C5'.split('_'),
        months: function (momentToFormat, format) {
            if (/D/.test(format.substring(0, format.indexOf('MMMM')))) {
                return this._monthsGenitiveEl[momentToFormat.month()];
            } else {
                return this._monthsNominativeEl[momentToFormat.month()];
            }
        },
        monthsShort: '\u0399\u03B1\u03BD_\u03A6\u03B5\u03B2_\u039C\u03B1\u03C1_\u0391\u03C0\u03C1_\u039C\u03B1\u03CA_\u0399\u03BF\u03C5\u03BD_\u0399\u03BF\u03C5\u03BB_\u0391\u03C5\u03B3_\u03A3\u03B5\u03C0_\u039F\u03BA\u03C4_\u039D\u03BF\u03B5_\u0394\u03B5\u03BA'.split('_'),
        weekdays: '\u039A\u03C5\u03C1\u03B9\u03B1\u03BA\u03AE_\u0394\u03B5\u03C5\u03C4\u03AD\u03C1\u03B1_\u03A4\u03C1\u03AF\u03C4\u03B7_\u03A4\u03B5\u03C4\u03AC\u03C1\u03C4\u03B7_\u03A0\u03AD\u03BC\u03C0\u03C4\u03B7_\u03A0\u03B1\u03C1\u03B1\u03C3\u03BA\u03B5\u03C5\u03AE_\u03A3\u03AC\u03B2\u03B2\u03B1\u03C4\u03BF'.split('_'),
        weekdaysShort: '\u039A\u03C5\u03C1_\u0394\u03B5\u03C5_\u03A4\u03C1\u03B9_\u03A4\u03B5\u03C4_\u03A0\u03B5\u03BC_\u03A0\u03B1\u03C1_\u03A3\u03B1\u03B2'.split('_'),
        weekdaysMin: '\u039A\u03C5_\u0394\u03B5_\u03A4\u03C1_\u03A4\u03B5_\u03A0\u03B5_\u03A0\u03B1_\u03A3\u03B1'.split('_'),
        meridiem: function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? '\u03BC\u03BC' : '\u039C\u039C';
            } else {
                return isLower ? '\u03C0\u03BC' : '\u03A0\u039C';
            }
        },
        longDateFormat: {
            LT: 'h:mm A',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendarEl: {
            sameDay: '[\u03A3\u03AE\u03BC\u03B5\u03C1\u03B1 {}] LT',
            nextDay: '[\u0391\u03CD\u03C1\u03B9\u03BF {}] LT',
            nextWeek: 'dddd [{}] LT',
            lastDay: '[\u03A7\u03B8\u03B5\u03C2 {}] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 6:
                    return '[\u03C4\u03BF \u03C0\u03C1\u03BF\u03B7\u03B3\u03BF\u03CD\u03BC\u03B5\u03BD\u03BF] dddd [{}] LT';
                default:
                    return '[\u03C4\u03B7\u03BD \u03C0\u03C1\u03BF\u03B7\u03B3\u03BF\u03CD\u03BC\u03B5\u03BD\u03B7] dddd [{}] LT';
                }
            },
            sameElse: 'L'
        },
        calendar: function (key, mom) {
            var output = this._calendarEl[key], hours = mom && mom.hours();
            if (typeof output === 'function') {
                output = output.apply(mom);
            }
            return output.replace('{}', hours % 12 === 1 ? '\u03C3\u03C4\u03B7' : '\u03C3\u03C4\u03B9\u03C2');
        },
        relativeTime: {
            future: '\u03C3\u03B5 %s',
            past: '%s \u03C0\u03C1\u03B9\u03BD',
            s: '\u03B4\u03B5\u03C5\u03C4\u03B5\u03C1\u03CC\u03BB\u03B5\u03C0\u03C4\u03B1',
            m: '\u03AD\u03BD\u03B1 \u03BB\u03B5\u03C0\u03C4\u03CC',
            mm: '%d \u03BB\u03B5\u03C0\u03C4\u03AC',
            h: '\u03BC\u03AF\u03B1 \u03CE\u03C1\u03B1',
            hh: '%d \u03CE\u03C1\u03B5\u03C2',
            d: '\u03BC\u03AF\u03B1 \u03BC\u03AD\u03C1\u03B1',
            dd: '%d \u03BC\u03AD\u03C1\u03B5\u03C2',
            M: '\u03AD\u03BD\u03B1\u03C2 \u03BC\u03AE\u03BD\u03B1\u03C2',
            MM: '%d \u03BC\u03AE\u03BD\u03B5\u03C2',
            y: '\u03AD\u03BD\u03B1\u03C2 \u03C7\u03C1\u03CC\u03BD\u03BF\u03C2',
            yy: '%d \u03C7\u03C1\u03CC\u03BD\u03B9\u03B1'
        },
        ordinal: function (number) {
            return number + '\u03B7';
        },
        week: {
            dow: 1,
            doy: 4
        }
    });
}));