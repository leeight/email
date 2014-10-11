define(
    function (require) {
        var Model = require('er/Model');

        /**
         * @class ef.UIModel
         *
         * 处理ESUI场景的`Model`实现
         *
         * @constructor
         * @extends er.Model
         */
        var exports = {};

        /**
         * 补0
         *
         * @param {string|number} s 输入的数字或字符串
         * @return {string} 不足2位的补个0
         */
        function pad(s) {
            s = s + '';
            return s.length === 1 ? '0' + s : s;
        }

        /**
         * 内置的格式化函数
         *
         * @type {Object}
         */
        var formatters = {
            /**
             * 格式化日期
             *
             * @param {Date} date 输入的日期
             * @return {string} YYYY-MM-dd格式的字符串
             */
            date: function (date) {
                return date.getFullYear() + '-'
                    + pad(date.getMonth() + 1) + '-'
                    + pad(date.getDate());
            },
            /**
             * 格式化日期范围
             *
             * @param {Object} range 输入的日期范围
             * @return {string} 逗号分隔2个日期，均为YYYY-MM-dd格式
             */
            dateRange: function (range) {
                return formatters.date(range.begin)
                    + ',' + formatters.date(range.end);
            },
            /**
             * 格式化时间
             *
             * @param {Date} time 输入的时间
             * @return {string} YYYY-MM-dd HH:mm:ss格式的字符串
             */
            time: function (time) {
                return formatters.date(time) + ' '
                    + pad(time.getHours()) + ':'
                    + pad(time.getMinutes()) + ':'
                    + pad(time.getSeconds());
            },
            /**
             * 格式化时间范围
             *
             * @param {Object} range 输入的时间范围
             * @return {string} 逗号分隔2个时间，均为YYYY-MM-dd HH:mm:ss格式
             */
            timeRange: function (range) {
                return formatters.time(range.begin)
                    + ',' + formatters.time(range.end);
            }
        };

        /**
         * 配置值的格式化函数，键为属性名称，值为格式化函数，
         * 设置该属性时，值将先经过格式化函数处理
         *
         * @type {Object}
         * @public
         */
        exports.formatters = {};

        /**
         * 设置值
         *
         * @param {string} name 属性名
         * @param {*} value 对应的值
         * @param {Object=} options 相关选项
         * @param {boolean=} options.silent 如果该值为true则不触发`change`事件
         * @public
         */
        exports.set = function (name, value, options) {
            if (this.formatters.hasOwnProperty(name)) {
                value = this.formatters[name](value);
            }
            this.$super([name, value, options]);
        };

        /**
         * 批量设置值
         *
         * @param {Object} extension 批量值的存放对象
         * @param {Object=} options 相关选项
         * @param {boolean=} options.silent 如果该值为true则不触发`change`事件
         * @public
         */
        exports.fill = function (extension, options) {
            for (var name in extension) {
                if (extension.hasOwnProperty(name)
                    && this.formatters.hasOwnProperty(name)
                ) {
                    var formatter = this.formatters[name];
                    var value = extension[name];
                    extension[name] = formatter(value);
                }
            }

            this.$super(arguments);
        };

        /**
         * 根据传入的属性名获取一个组装后的对象
         *
         * @param {Array.<string> | string...} names 需要的属性名列表
         * @return {Object} 包含`names`参数指定的属性的对象
         */
        exports.getPart = function (names) {
            if (Object.prototype.toString.call(names) !== '[object Array]') {
                names = [].slice.call(arguments);
            }

            var part = {};
            for (var i = 0; i < names.length; i++) {
                var name = names[i];
                part[name] = this.get(name);
            }
            return part;
        };

        var UIModel = require('eoo').create(Model, UIModel);

        UIModel.formatters = formatters;

        return UIModel;
    }
);