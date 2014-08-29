(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/es', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var monthsShortDot = 'ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.'.split('_'), monthsShort = 'ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic'.split('_');
    return moment.lang('es', {
        months: 'enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre'.split('_'),
        monthsShort: function (m, format) {
            if (/-MMM-/.test(format)) {
                return monthsShort[m.month()];
            } else {
                return monthsShortDot[m.month()];
            }
        },
        weekdays: 'domingo_lunes_martes_mi\xE9rcoles_jueves_viernes_s\xE1bado'.split('_'),
        weekdaysShort: 'dom._lun._mar._mi\xE9._jue._vie._s\xE1b.'.split('_'),
        weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_S\xE1'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            L: 'DD/MM/YYYY',
            LL: 'D [de] MMMM [del] YYYY',
            LLL: 'D [de] MMMM [del] YYYY LT',
            LLLL: 'dddd, D [de] MMMM [del] YYYY LT'
        },
        calendar: {
            sameDay: function () {
                return '[hoy a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
            },
            nextDay: function () {
                return '[ma\xF1ana a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
            },
            nextWeek: function () {
                return 'dddd [a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
            },
            lastDay: function () {
                return '[ayer a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
            },
            lastWeek: function () {
                return '[el] dddd [pasado a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: 'en %s',
            past: 'hace %s',
            s: 'unos segundos',
            m: 'un minuto',
            mm: '%d minutos',
            h: 'una hora',
            hh: '%d horas',
            d: 'un d\xEDa',
            dd: '%d d\xEDas',
            M: 'un mes',
            MM: '%d meses',
            y: 'un a\xF1o',
            yy: '%d a\xF1os'
        },
        ordinal: '%d\xBA',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));