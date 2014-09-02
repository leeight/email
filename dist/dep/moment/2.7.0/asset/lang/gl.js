(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/gl', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('gl', {
        months: 'Xaneiro_Febreiro_Marzo_Abril_Maio_Xu\xF1o_Xullo_Agosto_Setembro_Outubro_Novembro_Decembro'.split('_'),
        monthsShort: 'Xan._Feb._Mar._Abr._Mai._Xu\xF1._Xul._Ago._Set._Out._Nov._Dec.'.split('_'),
        weekdays: 'Domingo_Luns_Martes_M\xE9rcores_Xoves_Venres_S\xE1bado'.split('_'),
        weekdaysShort: 'Dom._Lun._Mar._M\xE9r._Xov._Ven._S\xE1b.'.split('_'),
        weekdaysMin: 'Do_Lu_Ma_M\xE9_Xo_Ve_S\xE1'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
            sameDay: function () {
                return '[hoxe ' + (this.hours() !== 1 ? '\xE1s' : '\xE1') + '] LT';
            },
            nextDay: function () {
                return '[ma\xF1\xE1 ' + (this.hours() !== 1 ? '\xE1s' : '\xE1') + '] LT';
            },
            nextWeek: function () {
                return 'dddd [' + (this.hours() !== 1 ? '\xE1s' : 'a') + '] LT';
            },
            lastDay: function () {
                return '[onte ' + (this.hours() !== 1 ? '\xE1' : 'a') + '] LT';
            },
            lastWeek: function () {
                return '[o] dddd [pasado ' + (this.hours() !== 1 ? '\xE1s' : 'a') + '] LT';
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: function (str) {
                if (str === 'uns segundos') {
                    return 'nuns segundos';
                }
                return 'en ' + str;
            },
            past: 'hai %s',
            s: 'uns segundos',
            m: 'un minuto',
            mm: '%d minutos',
            h: 'unha hora',
            hh: '%d horas',
            d: 'un d\xEDa',
            dd: '%d d\xEDas',
            M: 'un mes',
            MM: '%d meses',
            y: 'un ano',
            yy: '%d anos'
        },
        ordinal: '%d\xBA',
        week: {
            dow: 1,
            doy: 7
        }
    });
}));