(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/sk', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var months = 'janu\xE1r_febru\xE1r_marec_apr\xEDl_m\xE1j_j\xFAn_j\xFAl_august_september_okt\xF3ber_november_december'.split('_'), monthsShort = 'jan_feb_mar_apr_m\xE1j_j\xFAn_j\xFAl_aug_sep_okt_nov_dec'.split('_');
    function plural(n) {
        return n > 1 && n < 5;
    }
    function translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':
            return withoutSuffix || isFuture ? 'p\xE1r sek\xFAnd' : 'p\xE1r sekundami';
        case 'm':
            return withoutSuffix ? 'min\xFAta' : isFuture ? 'min\xFAtu' : 'min\xFAtou';
        case 'mm':
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'min\xFAty' : 'min\xFAt');
            } else {
                return result + 'min\xFAtami';
            }
            break;
        case 'h':
            return withoutSuffix ? 'hodina' : isFuture ? 'hodinu' : 'hodinou';
        case 'hh':
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'hodiny' : 'hod\xEDn');
            } else {
                return result + 'hodinami';
            }
            break;
        case 'd':
            return withoutSuffix || isFuture ? 'de\u0148' : 'd\u0148om';
        case 'dd':
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'dni' : 'dn\xED');
            } else {
                return result + 'd\u0148ami';
            }
            break;
        case 'M':
            return withoutSuffix || isFuture ? 'mesiac' : 'mesiacom';
        case 'MM':
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'mesiace' : 'mesiacov');
            } else {
                return result + 'mesiacmi';
            }
            break;
        case 'y':
            return withoutSuffix || isFuture ? 'rok' : 'rokom';
        case 'yy':
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'roky' : 'rokov');
            } else {
                return result + 'rokmi';
            }
            break;
        }
    }
    return moment.lang('sk', {
        months: months,
        monthsShort: monthsShort,
        monthsParse: function (months, monthsShort) {
            var i, _monthsParse = [];
            for (i = 0; i < 12; i++) {
                _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
            }
            return _monthsParse;
        }(months, monthsShort),
        weekdays: 'nede\u013Ea_pondelok_utorok_streda_\u0161tvrtok_piatok_sobota'.split('_'),
        weekdaysShort: 'ne_po_ut_st_\u0161t_pi_so'.split('_'),
        weekdaysMin: 'ne_po_ut_st_\u0161t_pi_so'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            L: 'DD.MM.YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[dnes o] LT',
            nextDay: '[zajtra o] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[v nede\u013Eu o] LT';
                case 1:
                case 2:
                    return '[v] dddd [o] LT';
                case 3:
                    return '[v stredu o] LT';
                case 4:
                    return '[vo \u0161tvrtok o] LT';
                case 5:
                    return '[v piatok o] LT';
                case 6:
                    return '[v sobotu o] LT';
                }
            },
            lastDay: '[v\u010Dera o] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[minul\xFA nede\u013Eu o] LT';
                case 1:
                case 2:
                    return '[minul\xFD] dddd [o] LT';
                case 3:
                    return '[minul\xFA stredu o] LT';
                case 4:
                case 5:
                    return '[minul\xFD] dddd [o] LT';
                case 6:
                    return '[minul\xFA sobotu o] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: 'za %s',
            past: 'pred %s',
            s: translate,
            m: translate,
            mm: translate,
            h: translate,
            hh: translate,
            d: translate,
            dd: translate,
            M: translate,
            MM: translate,
            y: translate,
            yy: translate
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));