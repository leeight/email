(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/fr', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('fr', {
        months: 'janvier_f\xE9vrier_mars_avril_mai_juin_juillet_ao\xFBt_septembre_octobre_novembre_d\xE9cembre'.split('_'),
        monthsShort: 'janv._f\xE9vr._mars_avr._mai_juin_juil._ao\xFBt_sept._oct._nov._d\xE9c.'.split('_'),
        weekdays: 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
        weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
        weekdaysMin: 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Aujourd\'hui \xE0] LT',
            nextDay: '[Demain \xE0] LT',
            nextWeek: 'dddd [\xE0] LT',
            lastDay: '[Hier \xE0] LT',
            lastWeek: 'dddd [dernier \xE0] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'dans %s',
            past: 'il y a %s',
            s: 'quelques secondes',
            m: 'une minute',
            mm: '%d minutes',
            h: 'une heure',
            hh: '%d heures',
            d: 'un jour',
            dd: '%d jours',
            M: 'un mois',
            MM: '%d mois',
            y: 'un an',
            yy: '%d ans'
        },
        ordinal: function (number) {
            return number + (number === 1 ? 'er' : '');
        },
        week: {
            dow: 1,
            doy: 4
        }
    });
}));