define(['require'], function (require) {
    return {
        maxLength: 20,
        mail: {
            maxLength: 100,
            pattern: '^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$',
            internal: { pattern: '^\\w+([-+.]\\w+)*@(\\w+\\.)?baidu\\.com$' }
        },
        multiEmail: {
            pattern: '^((\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*),?)+$',
            internal: { pattern: '^((\\w+([-+.]\\w+)*@(\\w+\\.)?baidu\\.com),?)+$' }
        },
        description: { maxLength: 4000 },
        mobile: { pattern: '^(1(3|4|5|8)\\d{9})?$' },
        phone: { pattern: '(^((0\\d{2,3})-)(\\d{7,8})(-(\\d{3,}))?$)|(^(1(3|4|5|8)\\d{9})?$)' },
        url: {
            maxLength: 1024,
            pattern: '^(?:https?|ftp|wap):\\/\\/.+$|^(?!(?:https?|ftp|wap):\\/\\/).+$'
        },
        positiveInteger: { pattern: '^\\d+$' },
        money: { pattern: '^\\d+(\\.\\d{1,2})?$' }
    };
});