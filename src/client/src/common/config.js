/**
 * @file 全局配置
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {

    // 接口配置
    // 如果期望添加API时工具自动配置，请保持apiConfig名称不变
    var apiConfig = {
        user: '/data/system/user',
        constants: '/data/system/constants',

        inboxList: '/api/inbox'
    };

    var config = {

        // API配置
        api: apiConfig,

        // ER默认路径
        index: '/dev/index'

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
