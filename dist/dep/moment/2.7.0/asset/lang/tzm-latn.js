(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/tzm-latn', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('tzm-latn', {
        months: 'innayr_br\u02E4ayr\u02E4_mar\u02E4s\u02E4_ibrir_mayyw_ywnyw_ywlywz_\u0263w\u0161t_\u0161wtanbir_kt\u02E4wbr\u02E4_nwwanbir_dwjnbir'.split('_'),
        monthsShort: 'innayr_br\u02E4ayr\u02E4_mar\u02E4s\u02E4_ibrir_mayyw_ywnyw_ywlywz_\u0263w\u0161t_\u0161wtanbir_kt\u02E4wbr\u02E4_nwwanbir_dwjnbir'.split('_'),
        weekdays: 'asamas_aynas_asinas_akras_akwas_asimwas_asi\u1E0Dyas'.split('_'),
        weekdaysShort: 'asamas_aynas_asinas_akras_akwas_asimwas_asi\u1E0Dyas'.split('_'),
        weekdaysMin: 'asamas_aynas_asinas_akras_akwas_asimwas_asi\u1E0Dyas'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[asdkh g] LT',
            nextDay: '[aska g] LT',
            nextWeek: 'dddd [g] LT',
            lastDay: '[assant g] LT',
            lastWeek: 'dddd [g] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'dadkh s yan %s',
            past: 'yan %s',
            s: 'imik',
            m: 'minu\u1E0D',
            mm: '%d minu\u1E0D',
            h: 'sa\u025Ba',
            hh: '%d tassa\u025Bin',
            d: 'ass',
            dd: '%d ossan',
            M: 'ayowr',
            MM: '%d iyyirn',
            y: 'asgas',
            yy: '%d isgasn'
        },
        week: {
            dow: 6,
            doy: 12
        }
    });
}));