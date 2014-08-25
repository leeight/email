/**
 * @file 常用的校验规则
 * @author chestnutchen(chenli11@baidu.com)
 */

define(
    function (require) {
        return {
            maxLength: 20,

            mail: {
                /**
                 * 默认的mail字段最大长度
                 */
                maxLength: 100,

                /**
                 * 电子邮件地址正则字符串
                 */
                pattern: '^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$',

                internal: {
                    /**
                     * 公司电子邮件地址正则字符串
                     */
                    pattern: '^\\w+([-+.]\\w+)*@(\\w+\\.)?baidu\\.com$'
                }
            },

            multiEmail: {
                /**
                 * 电子邮件地址正则字符串
                 */
                pattern: '^((\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*),?)+$',

                internal: {
                    /**
                     * 公司电子邮件地址正则字符串
                     */
                    pattern: '^((\\w+([-+.]\\w+)*@(\\w+\\.)?baidu\\.com),?)+$'
                }
            },

            description: {
                /**
                 * 默认的description说明字段最大长度
                 */
                maxLength: 4000
            },

            mobile: {
                /**
                 * 手机号码，以13、14、15、18开头的11位数字
                 */
                pattern: '^(1(3|4|5|8)\\d{9})?$'
            },

            phone: {
                /**
                 * 电话号码和手机号码，可为空，固话区号和分机号可选
                 * 固话格式{3到4位区号}-{7到8位号码}-{3到5位分机号}
                 */
                pattern: '(^((0\\d{2,3})-)(\\d{7,8})(-(\\d{3,}))?$)|(^(1(3|4|5|8)\\d{9})?$)'
            },

            url: {
                /**
                 * url网址最大长度
                 */
                maxLength: 1024,

                /**
                 * url网址正则
                 */
                pattern: '^(?:https?|ftp|wap):\\/\\/.+$|^(?!(?:https?|ftp|wap):\\/\\/).+$'
            },

            positiveInteger: {
                /**
                 * 正整数正则字符串
                 */
                pattern: '^\\d+$'
            },

            money: {
                /**
                 * 价格类数字正则字符串
                 * 精确至小数点后两位
                 */
                pattern: '^\\d+(\\.\\d{1,2})?$'
            }
        };
    }
);
