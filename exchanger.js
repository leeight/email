/**
 * @file exchanger.js ~ 2014/08/19 17:18:43
 * @author leeight(liyubei@baidu.com)
 **/
var exchanger = require('exchanger');
exchanger.initialize({
    url: 'email.baidu.com',
    username: 'liyubei',
    password: 'zhenxixiaohui@^@262'
}, function(err) {
    exchanger.getEmails('inbox', 50, function(err, emails) {
        console.log(err);
        console.log(emails);
    });
});








/* vim: set ts=4 sw=4 sts=4 tw=120: */
