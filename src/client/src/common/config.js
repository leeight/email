/**
 * @file 全局配置
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {

    // 接口配置
    // 如果期望添加API时工具自动配置，请保持apiConfig名称不变
    var apiConfig = {
        user: function(){ return {} },
        constants: function(){ return {} },

        inboxList: '/api/inbox',
        readMail: '/api/mail/read',
        mailPost: '/api/mail/post',
        mailSearch: '/api/mail/search',
        markAsRead: '/api/mail/mark_as_read',
        addStar: '/api/mail/add_star',
        removeStar: '/api/mail/remove_star',
        deleteMails: '/api/mail/delete',
        labelList: '/api/labels',
        threadList: '/api/thread/list',
        readThread: '/api/thread/read',
        contactsList: '/api/contacts',
        pcsRetry: '/api/pcs/retry'
    };

    var config = {

        // API配置
        api: apiConfig,

        // ER默认路径
        index: '/mail/inbox',

        hooks: {
            SHOW_LOADING: false
        }

        // // 系统名称
        // systemName: '品牌广告',

        // // 导航栏
        // nav: {
        //     navId: 'nav',
        //     tabs: []
        // }
    };

    return config;
});
