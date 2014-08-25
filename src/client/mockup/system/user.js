var mockup = require('bat-ria-tool/mockup');

exports.response = function (path, params) {

    return mockup.session(
        // {
        //     visitor: {
        //         username: '访问者',
        //         roleId: 1,
        //         id: 123
        //     },
        //     adOwner: {
        //         username: '广告主',
        //         roleId: 1,
        //         id: 124
        //     }
        // }
    );

    // return mockup.globalFail('无法读取用户信息！');

};
