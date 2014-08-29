(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/fi', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var numbersPast = 'nolla yksi kaksi kolme nelj\xE4 viisi kuusi seitsem\xE4n kahdeksan yhdeks\xE4n'.split(' '), numbersFuture = [
            'nolla',
            'yhden',
            'kahden',
            'kolmen',
            'nelj\xE4n',
            'viiden',
            'kuuden',
            numbersPast[7],
            numbersPast[8],
            numbersPast[9]
        ];
    function translate(number, withoutSuffix, key, isFuture) {
        var result = '';
        switch (key) {
        case 's':
            return isFuture ? 'muutaman sekunnin' : 'muutama sekunti';
        case 'm':
            return isFuture ? 'minuutin' : 'minuutti';
        case 'mm':
            result = isFuture ? 'minuutin' : 'minuuttia';
            break;
        case 'h':
            return isFuture ? 'tunnin' : 'tunti';
        case 'hh':
            result = isFuture ? 'tunnin' : 'tuntia';
            break;
        case 'd':
            return isFuture ? 'p\xE4iv\xE4n' : 'p\xE4iv\xE4';
        case 'dd':
            result = isFuture ? 'p\xE4iv\xE4n' : 'p\xE4iv\xE4\xE4';
            break;
        case 'M':
            return isFuture ? 'kuukauden' : 'kuukausi';
        case 'MM':
            result = isFuture ? 'kuukauden' : 'kuukautta';
            break;
        case 'y':
            return isFuture ? 'vuoden' : 'vuosi';
        case 'yy':
            result = isFuture ? 'vuoden' : 'vuotta';
            break;
        }
        result = verbalNumber(number, isFuture) + ' ' + result;
        return result;
    }
    function verbalNumber(number, isFuture) {
        return number < 10 ? isFuture ? numbersFuture[number] : numbersPast[number] : number;
    }
    return moment.lang('fi', {
        months: 'tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kes\xE4kuu_hein\xE4kuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu'.split('_'),
        monthsShort: 'tammi_helmi_maalis_huhti_touko_kes\xE4_hein\xE4_elo_syys_loka_marras_joulu'.split('_'),
        weekdays: 'sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai'.split('_'),
        weekdaysShort: 'su_ma_ti_ke_to_pe_la'.split('_'),
        weekdaysMin: 'su_ma_ti_ke_to_pe_la'.split('_'),
        longDateFormat: {
            LT: 'HH.mm',
            L: 'DD.MM.YYYY',
            LL: 'Do MMMM[ta] YYYY',
            LLL: 'Do MMMM[ta] YYYY, [klo] LT',
            LLLL: 'dddd, Do MMMM[ta] YYYY, [klo] LT',
            l: 'D.M.YYYY',
            ll: 'Do MMM YYYY',
            lll: 'Do MMM YYYY, [klo] LT',
            llll: 'ddd, Do MMM YYYY, [klo] LT'
        },
        calendar: {
            sameDay: '[t\xE4n\xE4\xE4n] [klo] LT',
            nextDay: '[huomenna] [klo] LT',
            nextWeek: 'dddd [klo] LT',
            lastDay: '[eilen] [klo] LT',
            lastWeek: '[viime] dddd[na] [klo] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s p\xE4\xE4st\xE4',
            past: '%s sitten',
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