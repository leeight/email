(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/cs', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var months = 'leden_\xFAnor_b\u0159ezen_duben_kv\u011Bten_\u010Derven_\u010Dervenec_srpen_z\xE1\u0159\xED_\u0159\xEDjen_listopad_prosinec'.split('_'), monthsShort = 'led_\xFAno_b\u0159e_dub_kv\u011B_\u010Dvn_\u010Dvc_srp_z\xE1\u0159_\u0159\xEDj_lis_pro'.split('_');
    function plural(n) {
        return n > 1 && n < 5 && ~~(n / 10) !== 1;
    }
    function translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':
            return withoutSuffix || isFuture ? 'p\xE1r sekund' : 'p\xE1r sekundami';
        case 'm':
            return withoutSuffix ? 'minuta' : isFuture ? 'minutu' : 'minutou';
        case 'mm':
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'minuty' : 'minut');
            } else {
                return result + 'minutami';
            }
            break;
        case 'h':
            return withoutSuffix ? 'hodina' : isFuture ? 'hodinu' : 'hodinou';
        case 'hh':
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'hodiny' : 'hodin');
            } else {
                return result + 'hodinami';
            }
            break;
        case 'd':
            return withoutSuffix || isFuture ? 'den' : 'dnem';
        case 'dd':
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'dny' : 'dn\xED');
            } else {
                return result + 'dny';
            }
            break;
        case 'M':
            return withoutSuffix || isFuture ? 'm\u011Bs\xEDc' : 'm\u011Bs\xEDcem';
        case 'MM':
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'm\u011Bs\xEDce' : 'm\u011Bs\xEDc\u016F');
            } else {
                return result + 'm\u011Bs\xEDci';
            }
            break;
        case 'y':
            return withoutSuffix || isFuture ? 'rok' : 'rokem';
        case 'yy':
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'roky' : 'let');
            } else {
                return result + 'lety';
            }
            break;
        }
    }
    return moment.lang('cs', {
        months: months,
        monthsShort: monthsShort,
        monthsParse: function (months, monthsShort) {
            var i, _monthsParse = [];
            for (i = 0; i < 12; i++) {
                _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
            }
            return _monthsParse;
        }(months, monthsShort),
        weekdays: 'ned\u011Ble_pond\u011Bl\xED_\xFAter\xFD_st\u0159eda_\u010Dtvrtek_p\xE1tek_sobota'.split('_'),
        weekdaysShort: 'ne_po_\xFAt_st_\u010Dt_p\xE1_so'.split('_'),
        weekdaysMin: 'ne_po_\xFAt_st_\u010Dt_p\xE1_so'.split('_'),
        longDateFormat: {
            LT: 'H.mm',
            L: 'DD.\xA0MM.\xA0YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[dnes v] LT',
            nextDay: '[z\xEDtra v] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[v ned\u011Bli v] LT';
                case 1:
                case 2:
                    return '[v] dddd [v] LT';
                case 3:
                    return '[ve st\u0159edu v] LT';
                case 4:
                    return '[ve \u010Dtvrtek v] LT';
                case 5:
                    return '[v p\xE1tek v] LT';
                case 6:
                    return '[v sobotu v] LT';
                }
            },
            lastDay: '[v\u010Dera v] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[minulou ned\u011Bli v] LT';
                case 1:
                case 2:
                    return '[minul\xE9] dddd [v] LT';
                case 3:
                    return '[minulou st\u0159edu v] LT';
                case 4:
                case 5:
                    return '[minul\xFD] dddd [v] LT';
                case 6:
                    return '[minulou sobotu v] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: 'za %s',
            past: 'p\u0159ed %s',
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