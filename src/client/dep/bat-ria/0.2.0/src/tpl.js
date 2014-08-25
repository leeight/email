/**
 * @file tpl加载插件
 * @author otakustay
 */
define(
    function(require) {
        var ajax = require('er/ajax');
        var etpl = require('etpl');
        var template = etpl;

        var controlModulePrefix = {
            BoxGroup: 'esui',
            Button: 'esui',
            Calendar: 'esui',
            CheckBox: 'esui',
            CommandMenu: 'esui',
            Crumb: 'esui',
            Dialog: 'esui',
            Form: 'esui',
            Frame: 'esui',
            Image: './ui',
            Label: 'esui',
            Link: 'esui',
            MonthView: 'esui',
            Pager: 'esui',
            Panel: 'esui',
            RangeCalendar: 'esui',
            Region: 'esui',
            RichCalendar: 'esui',
            Schedule: 'esui',
            SearchBox: 'esui',
            Select: 'esui',
            Sidebar: 'esui',
            Tab: 'esui',
            Table: 'esui',
            TextBox: 'esui',
            TextLine: 'esui',
            Tip: 'esui',
            TipLayer: 'esui',
            Tree: 'esui',
            Uploader: './ui',
            Validity: 'esui',
            Wizard: 'esui',
            ActionPanel: 'ef',
            ActionDialog: 'ef',
            SelectorTreeStrategy: './ui',
            TreeRichSelector: './ui',
            tableRichSelector: './ui',
            RichSelector: './ui',
            ToggleButton: './ui'
        };

        var extensionModulePrefix = {
            AutoSort: 'esui/extension',
            Command: 'esui/extension',
            CustomData: 'esui/extension',
            TableEdit: 'esui/extension',
            AutoSubmit: './ui/extension',
            TableTip: './ui/extension',
            TableSubrow: 'esui/extension',
            WordCount: './ui/extension'
        };

        /**
         * 获取控件依赖关系
         *
         * @param {string} text 模板内容
         * @return {string[]} 依赖的控件列表
         */
        function getControlDependencies(text) {
            var dependencies = [];
            var defined = {};

            var regex = /data-ui-type="(\w+)"/g;
            var match = regex.exec(text);
            while (match) {
                var type = match[1];
                if (!defined[type]) {
                    defined[type] = true;

                    var prefix = (controlModulePrefix[type] || 'ui') + '/';
                    dependencies.push(prefix + type);
                }

                match = regex.exec(text);
            }

            return dependencies;
        }

        /**
         * 获取扩展依赖关系
         *
         * @param {string} text 模板内容
         * @return {string[]} 依赖的扩展列表
         */
        function getExtensionDependencies(text) {
            var dependencies = [];
            var defined = {};

            var regex = /data-ui-extension-[^-]+-type="(\w+)"/g;
            var match = regex.exec(text);
            while (match) {
                var type = match[1];
                if (!defined[type]) {
                    defined[type] = true;

                    var prefix =
                        (extensionModulePrefix[type] || 'ui/extension') + '/';
                    dependencies.push(prefix + type);
                }

                match = regex.exec(text);
            }

            return dependencies;
        }

        /**
         * 模板加载插件，类似[etpl](https://github.com/ecomfe/etpl)的AMD插件，
         * 但此插件会分析模板的源码，当模板按标准书写时，可自动分析控件的依赖
         *
         * 使用此插件的自动控件依赖分析功能，模板必须满足以下条件：
         *
         * - 控件的HTML必须写`data-ui-type="SomeControl"`这一格式，
         * 即 *不能* 有`data-ui="type: SomeControl"`这样的写法
         * - 对于非ESUI、EF框架，且不在`src/ui`文件夹下的控件，
         * 必须通过{@tpl#registerControl}方法注册模块前缀
         * - 对于ESUI扩展，必须写`data-ui-extension-xxx-type="Xxx"`的形式
         * - 业务ESUI扩展必须放置在`src/ui/extension`文件夹下
         *
         * @class tpl
         * @singleton
         */
        var plugin = {
            /**
             * 设置模板引擎实例，可通过此方法来使用非默认引擎实例
             *
             * @param {etpl.Engine} engine 引擎的实例
             */
            setupTemplateEngine: function (engine) {
                template = engine || etpl;
            },

            /**
             * 加载模板，AMD插件对象暴露的方法
             *
             * @param {string} resourceId 模板资源id
             * @param {function} parentRequire 父级`require`函数
             * @param {function} load 加载完成后调用
             */
            load: function (resourceId, parentRequire, load) {
                function addTemplate(text) {
                    template.parse(text);

                    var controls = getControlDependencies(text);
                    var extensions = getExtensionDependencies(text);
                    var dependencies = controls.concat(extensions);

                    require(dependencies, function() {
                        load(text);
                    });
                }

                if (/\.html?$/.test(resourceId)) {
                    var options = {
                        method: 'GET',
                        url: parentRequire.toUrl(resourceId),
                        cache: true,
                        dataType: 'text'
                    };
                    ajax.request(options).then(addTemplate);
                }
                else {
                    require([resourceId], addTemplate);
                }
            },

            /**
             * 注册业务控件的模块
             *
             * @param {string} moduleId 业务控件对应的模块id，必须为顶级id
             */
            registerControl: function (moduleId) {
                var lastIndexOfSlash = moduleId.lastIndexOf('/');
                var prefix = moduleId.substring(0, lastIndexOfSlash);
                var type = moduleId.substring(lastIndexOfSlash + 1);
                controlModulePrefix[type] = prefix;
            },

            /**
             * 注册业务控件扩展的模块
             *
             * @param {string} moduleId 业务控件对应的模块id，必须为顶级id
             */
            registerExtension: function (moduleId) {
                var lastIndexOfSlash = moduleId.lastIndexOf('/');
                var prefix = moduleId.substring(0, lastIndexOfSlash);
                var type = moduleId.substring(lastIndexOfSlash + 1);
                extensionModulePrefix[type] = prefix;
            }
        };

        return plugin;
    }
);
