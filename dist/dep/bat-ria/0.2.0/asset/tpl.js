define('bat-ria/tpl', [
    'require',
    'er/ajax',
    'etpl'
], function (require) {
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
    function getExtensionDependencies(text) {
        var dependencies = [];
        var defined = {};
        var regex = /data-ui-extension-[^-]+-type="(\w+)"/g;
        var match = regex.exec(text);
        while (match) {
            var type = match[1];
            if (!defined[type]) {
                defined[type] = true;
                var prefix = (extensionModulePrefix[type] || 'ui/extension') + '/';
                dependencies.push(prefix + type);
            }
            match = regex.exec(text);
        }
        return dependencies;
    }
    var plugin = {
            setupTemplateEngine: function (engine) {
                template = engine || etpl;
            },
            load: function (resourceId, parentRequire, load) {
                function addTemplate(text) {
                    template.parse(text);
                    var controls = getControlDependencies(text);
                    var extensions = getExtensionDependencies(text);
                    var dependencies = controls.concat(extensions);
                    require(dependencies, function () {
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
                } else {
                    require([resourceId], addTemplate);
                }
            },
            registerControl: function (moduleId) {
                var lastIndexOfSlash = moduleId.lastIndexOf('/');
                var prefix = moduleId.substring(0, lastIndexOfSlash);
                var type = moduleId.substring(lastIndexOfSlash + 1);
                controlModulePrefix[type] = prefix;
            },
            registerExtension: function (moduleId) {
                var lastIndexOfSlash = moduleId.lastIndexOf('/');
                var prefix = moduleId.substring(0, lastIndexOfSlash);
                var type = moduleId.substring(lastIndexOfSlash + 1);
                extensionModulePrefix[type] = prefix;
            }
        };
    return plugin;
});