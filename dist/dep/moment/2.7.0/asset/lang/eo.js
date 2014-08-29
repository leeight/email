(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/eo', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('eo', {
        months: 'januaro_februaro_marto_aprilo_majo_junio_julio_a\u016Dgusto_septembro_oktobro_novembro_decembro'.split('_'),
        monthsShort: 'jan_feb_mar_apr_maj_jun_jul_a\u016Dg_sep_okt_nov_dec'.split('_'),
        weekdays: 'Diman\u0109o_Lundo_Mardo_Merkredo_\u0134a\u016Ddo_Vendredo_Sabato'.split('_'),
        weekdaysShort: 'Dim_Lun_Mard_Merk_\u0134a\u016D_Ven_Sab'.split('_'),
        weekdaysMin: 'Di_Lu_Ma_Me_\u0134a_Ve_Sa'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'YYYY-MM-DD',
            LL: 'D[-an de] MMMM, YYYY',
            LLL: 'D[-an de] MMMM, YYYY LT',
            LLLL: 'dddd, [la] D[-an de] MMMM, YYYY LT'
        },
        meridiem: function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'p.t.m.' : 'P.T.M.';
            } else {
                return isLower ? 'a.t.m.' : 'A.T.M.';
            }
        },
        calendar: {
            sameDay: '[Hodia\u016D je] LT',
            nextDay: '[Morga\u016D je] LT',
            nextWeek: 'dddd [je] LT',
            lastDay: '[Hiera\u016D je] LT',
            lastWeek: '[pasinta] dddd [je] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'je %s',
            past: 'anta\u016D %s',
            s: 'sekundoj',
            m: 'minuto',
            mm: '%d minutoj',
            h: 'horo',
            hh: '%d horoj',
            d: 'tago',
            dd: '%d tagoj',
            M: 'monato',
            MM: '%d monatoj',
            y: 'jaro',
            yy: '%d jaroj'
        },
        ordinal: '%da',
        week: {
            dow: 1,
            doy: 7
        }
    });
}));