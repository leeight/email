define('common/config', ['require'], function (require) {
    var apiConfig = {
            user: function () {
                return {};
            },
            constants: function () {
                return {};
            },
            inboxList: '/api/inbox',
            readMail: '/api/mail/read',
            mailPost: '/api/mail/post',
            markAsRead: '/api/mail/mark_as_read',
            deleteMails: '/api/mail/delete',
            labelList: '/api/labels',
            contactsList: '/api/contacts'
        };
    var config = {
            api: apiConfig,
            index: '/mail/inbox',
            hooks: { SHOW_LOADING: false }
        };
    return config;
});