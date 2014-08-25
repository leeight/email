er-track
========

用于ER的页面访问统计套件

    var track = require('er-track').create();

    // 使用百度统计
    track.use('baidu')
        .config('scriptURL', '/common/h.js') // 可使用自定义脚本地址，默认使用统计提供的异步脚本
        .setAccount('e11f12430782bff9553b65f2be26d907');

    // 使用`console`输出
    track.use('console')
        .setAccount('Console group from er-track');

    track.start();