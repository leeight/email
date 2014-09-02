(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/hu', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var weekEndings = 'vas\xE1rnap h\xE9tf\u0151n kedden szerd\xE1n cs\xFCt\xF6rt\xF6k\xF6n p\xE9nteken szombaton'.split(' ');
    function translate(number, withoutSuffix, key, isFuture) {
        var num = number, suffix;
        switch (key) {
        case 's':
            return isFuture || withoutSuffix ? 'n\xE9h\xE1ny m\xE1sodperc' : 'n\xE9h\xE1ny m\xE1sodperce';
        case 'm':
            return 'egy' + (isFuture || withoutSuffix ? ' perc' : ' perce');
        case 'mm':
            return num + (isFuture || withoutSuffix ? ' perc' : ' perce');
        case 'h':
            return 'egy' + (isFuture || withoutSuffix ? ' \xF3ra' : ' \xF3r\xE1ja');
        case 'hh':
            return num + (isFuture || withoutSuffix ? ' \xF3ra' : ' \xF3r\xE1ja');
        case 'd':
            return 'egy' + (isFuture || withoutSuffix ? ' nap' : ' napja');
        case 'dd':
            return num + (isFuture || withoutSuffix ? ' nap' : ' napja');
        case 'M':
            return 'egy' + (isFuture || withoutSuffix ? ' h\xF3nap' : ' h\xF3napja');
        case 'MM':
            return num + (isFuture || withoutSuffix ? ' h\xF3nap' : ' h\xF3napja');
        case 'y':
            return 'egy' + (isFuture || withoutSuffix ? ' \xE9v' : ' \xE9ve');
        case 'yy':
            return num + (isFuture || withoutSuffix ? ' \xE9v' : ' \xE9ve');
        }
        return '';
    }
    function week(isFuture) {
        return (isFuture ? '' : '[m\xFAlt] ') + '[' + weekEndings[this.day()] + '] LT[-kor]';
    }
    return moment.lang('hu', {
        months: 'janu\xE1r_febru\xE1r_m\xE1rcius_\xE1prilis_m\xE1jus_j\xFAnius_j\xFAlius_augusztus_szeptember_okt\xF3ber_november_december'.split('_'),
        monthsShort: 'jan_feb_m\xE1rc_\xE1pr_m\xE1j_j\xFAn_j\xFAl_aug_szept_okt_nov_dec'.split('_'),
        weekdays: 'vas\xE1rnap_h\xE9tf\u0151_kedd_szerda_cs\xFCt\xF6rt\xF6k_p\xE9ntek_szombat'.split('_'),
        weekdaysShort: 'vas_h\xE9t_kedd_sze_cs\xFCt_p\xE9n_szo'.split('_'),
        weekdaysMin: 'v_h_k_sze_cs_p_szo'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            L: 'YYYY.MM.DD.',
            LL: 'YYYY. MMMM D.',
            LLL: 'YYYY. MMMM D., LT',
            LLLL: 'YYYY. MMMM D., dddd LT'
        },
        meridiem: function (hours, minutes, isLower) {
            if (hours < 12) {
                return isLower === true ? 'de' : 'DE';
            } else {
                return isLower === true ? 'du' : 'DU';
            }
        },
        calendar: {
            sameDay: '[ma] LT[-kor]',
            nextDay: '[holnap] LT[-kor]',
            nextWeek: function () {
                return week.call(this, true);
            },
            lastDay: '[tegnap] LT[-kor]',
            lastWeek: function () {
                return week.call(this, false);
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s m\xFAlva',
            past: '%s',
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
            doy: 7
        }
    });
}));