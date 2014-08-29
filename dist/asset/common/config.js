define('common/config', ['require'], function (require) {
    var apiConfig = {
            user: '/data/system/user',
            constants: '/data/system/constants',
            inboxList: '/api/inbox',
            readMail: '/api/mail/read',
            mailPost: '/api/mail/post',
            labelList: '/api/labels'
        };
    var config = {
            api: apiConfig,
            index: '/dev/index'
        };
    return config;
});