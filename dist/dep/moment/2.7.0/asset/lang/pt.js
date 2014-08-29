(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/pt', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('pt', {
        months: 'janeiro_fevereiro_mar\xE7o_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro'.split('_'),
        monthsShort: 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_'),
        weekdays: 'domingo_segunda-feira_ter\xE7a-feira_quarta-feira_quinta-feira_sexta-feira_s\xE1bado'.split('_'),
        weekdaysShort: 'dom_seg_ter_qua_qui_sex_s\xE1b'.split('_'),
        weekdaysMin: 'dom_2\xAA_3\xAA_4\xAA_5\xAA_6\xAA_s\xE1b'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D [de] MMMM [de] YYYY',
            LLL: 'D [de] MMMM [de] YYYY LT',
            LLLL: 'dddd, D [de] MMMM [de] YYYY LT'
        },
        calendar: {
            sameDay: '[Hoje \xE0s] LT',
            nextDay: '[Amanh\xE3 \xE0s] LT',
            nextWeek: 'dddd [\xE0s] LT',
            lastDay: '[Ontem \xE0s] LT',
            lastWeek: function () {
                return this.day() === 0 || this.day() === 6 ? '[\xDAltimo] dddd [\xE0s] LT' : '[\xDAltima] dddd [\xE0s] LT';
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: 'em %s',
            past: 'h\xE1 %s',
            s: 'segundos',
            m: 'um minuto',
            mm: '%d minutos',
            h: 'uma hora',
            hh: '%d horas',
            d: 'um dia',
            dd: '%d dias',
            M: 'um m\xEAs',
            MM: '%d meses',
            y: 'um ano',
            yy: '%d anos'
        },
        ordinal: '%d\xBA',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));