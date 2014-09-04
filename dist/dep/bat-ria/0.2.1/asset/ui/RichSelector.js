define('bat-ria/ui/RichSelector', [
    'require',
    'esui/Label',
    'esui/Panel',
    'esui/SearchBox',
    'esui/lib',
    'esui/painters',
    'esui/InputControl',
    'underscore',
    'esui'
], function (require) {
    require('esui/Label');
    require('esui/Panel');
    require('esui/SearchBox');
    var lib = require('esui/lib');
    var painter = require('esui/painters');
    var InputControl = require('esui/InputControl');
    var u = require('underscore');
    function RichSelector(options) {
        InputControl.apply(this, arguments);
    }
    lib.inherits(RichSelector, InputControl);
    RichSelector.prototype.type = 'RichSelector';
    RichSelector.prototype.initOptions = function (options) {
        var properties = {
                height: '200',
                width: '200',
                hasHead: true,
                title: '\u6807\u9898\u540D',
                needBatchAction: false,
                batchActionLabel: '\u6279\u91CF\u64CD\u4F5C',
                hasSearchBox: true,
                hasFoot: true,
                itemName: '\u7ED3\u679C',
                emptyText: '\u6CA1\u6709\u76F8\u5E94\u7684\u641C\u7D22\u7ED3\u679C',
                holdState: false,
                mode: 'add',
                multi: true
            };
        if (options.hasHead === 'false') {
            options.hasHead = false;
        }
        if (options.hasSearchBox === 'false') {
            options.hasSearchBox = false;
        }
        if (options.hasFoot === 'false') {
            options.hasFoot = false;
        }
        if (options.holdState === 'false') {
            options.holdState = false;
        }
        if (options.multi === 'false') {
            options.multi = false;
        }
        if (options.mode === 'load') {
            options.multi = false;
        }
        lib.extend(properties, options);
        this.setProperties(properties);
    };
    RichSelector.prototype.getHeadHTML = function () {
        var helper = this.helper;
        var actionLink = '';
        if (this.needBatchAction) {
            var linkClassName = helper.getPartClassName('batch-action-link');
            var linkId = this.helper.getId('batch-action');
            actionLink = '' + '<span class="' + linkClassName + '" id="' + linkId + '" >' + this.batchActionLabel + '</span>';
        }
        var head = [
                '<div data-ui="type:Panel;childName:head;"',
                ' class="${headClass}">',
                '<h3 data-ui="type:Label;childName:title;">',
                '${title}</h3>',
                '${actionLink}',
                '</div>'
            ].join('\n');
        head = lib.format(head, {
            headClass: helper.getPartClassName('head'),
            title: this.title,
            actionLink: actionLink
        });
        return head;
    };
    RichSelector.prototype.getFootHTML = function () {
        return [
            '<div data-ui="type:Panel;childName:foot;"',
            ' class="' + this.helper.getPartClassName('foot') + '">',
            '<span data-ui="type:Label;childName:totalCount">',
            '</span>',
            '</div>'
        ].join('\n');
    };
    RichSelector.prototype.initStructure = function () {
        var tpl = [
                '${head}',
                '<div data-ui="type:Panel;childName:body;"',
                ' class="${bodyClass}">',
                '${searchInput}',
                '<div data-ui="type:Panel;childName:content"',
                ' class="${contentClass}">',
                '<div data-ui="type:Label;childName:emptyText"',
                ' class="${emptyTextClass}">${emptyText}</div>',
                '<div data-ui="type:Panel;childName:queryList"',
                ' class="${queryListClass}">',
                '</div>',
                '</div>',
                '</div>',
                '${footInfo}'
            ];
        var helper = this.helper;
        var head = '';
        if (this.hasHead) {
            head = this.getHeadHTML();
        }
        var searchInput = '';
        if (this.hasSearchBox) {
            var searchBoxWidth = this.width - 45;
            searchInput = [
                '<div data-ui="type:Panel;childName:searchBoxArea"',
                ' class="${searchWrapperClass}">',
                '<div data-ui="type:SearchBox;childName:itemSearch;"',
                ' data-ui-skin="magnifier"',
                ' data-ui-width="' + searchBoxWidth + '">',
                '</div>',
                '</div>',
                '<div data-ui="type:Panel;',
                'childName:generalQueryResultArea"',
                ' class="${generalQueryResultClass}"',
                ' id="${queryResultId}">',
                '<span class="${linkClass}" id="${linkId}">\u6E05\u7A7A</span>',
                '\u5171\u627E\u5230<span id="${queryResultCountId}"></span>\u4E2A',
                '</div>'
            ].join('\n');
            searchInput = lib.format(searchInput, {
                searchWrapperClass: helper.getPartClassName('search-wrapper'),
                generalQueryResultClass: helper.getPartClassName('query-result-general'),
                queryResultCountId: helper.getId('result-count'),
                linkClass: helper.getPartClassName('clear-query-link'),
                linkId: helper.getId('clear-query')
            });
        }
        var footInfo = '';
        if (this.hasFoot) {
            footInfo = this.getFootHTML();
        }
        this.main.style.width = this.width + 'px';
        this.main.innerHTML = lib.format(tpl.join('\n'), {
            head: head,
            bodyClass: helper.getPartClassName('body'),
            searchInput: searchInput,
            contentClass: helper.getPartClassName('content-wrapper'),
            emptyTextClass: helper.getPartClassName('empty-text'),
            emptyText: this.emptyText,
            queryListClass: helper.getPartClassName('query-list'),
            footInfo: footInfo
        });
        this.initChildren();
        if (this.mode === 'load') {
            this.addState('load');
        } else if (this.mode === 'add') {
            this.addState('add');
        } else {
            this.addState('del');
        }
        var batchActionLink = helper.getPart('batch-action');
        if (batchActionLink) {
            helper.addDOMEvent(batchActionLink, 'click', u.bind(this.batchAction, this));
        }
        var clearQueryLink = helper.getPart('clear-query');
        if (clearQueryLink) {
            helper.addDOMEvent(clearQueryLink, 'click', u.bind(this.clearQuery, this));
        }
        var searchBox = this.getSearchBox();
        if (searchBox) {
            searchBox.on('search', this.search, this);
        }
        var queryList = this.getQueryList().main;
        helper.addDOMEvent(queryList, 'click', u.bind(this.eventDispatcher, this));
    };
    RichSelector.prototype.eventDispatcher = function (e) {
        return false;
    };
    RichSelector.prototype.search = function (e) {
        var keyword = lib.trim(e.target.getValue());
        this.queryItem(keyword);
        this.refreshResult();
        this.refreshFoot();
        this.addState('queried');
        this.adjustHeight();
    };
    RichSelector.prototype.refreshResult = function () {
        var count = this.getCurrentStateItemsCount();
        this.helper.getPart('result-count').innerHTML = count;
    };
    RichSelector.prototype.clearQuery = function () {
        this.removeState('queried');
        var searchBox = this.getSearchBox();
        if (searchBox) {
            searchBox.set('text', '');
        }
        this.clearData();
        this.refreshResult();
        this.refreshContent();
        this.refreshFoot();
        this.adjustHeight();
        return false;
    };
    RichSelector.prototype.getContent = function () {
        var body = this.getChild('body');
        if (body) {
            return body.getChild('content');
        }
        return null;
    };
    RichSelector.prototype.getKeyword = function () {
        var searchBox = this.getSearchBox();
        var isQuery = this.isQuery();
        if (searchBox && isQuery) {
            return lib.trim(searchBox.getValue());
        }
        return null;
    };
    RichSelector.prototype.getQueryList = function () {
        var content = this.getContent();
        if (content) {
            return content.getChild('queryList');
        }
        return null;
    };
    RichSelector.prototype.getSearchBox = function () {
        var searchBoxArea = this.getChild('body').getChild('searchBoxArea');
        if (searchBoxArea) {
            return searchBoxArea.getChild('itemSearch');
        }
    };
    RichSelector.prototype.getTotalCountPanel = function () {
        var foot = this.getChild('foot');
        if (!foot) {
            return null;
        }
        return foot.getChild('totalCount');
    };
    RichSelector.prototype.isQuery = function () {
        return this.hasState('queried');
    };
    RichSelector.prototype.batchAction = function () {
        if (this.mode === 'delete') {
            this.deleteAll();
            this.refreshFoot();
        } else if (this.mode === 'add') {
            this.selectAll();
        }
        return false;
    };
    RichSelector.prototype.deleteAll = function () {
        return false;
    };
    RichSelector.prototype.addAll = function () {
        return false;
    };
    RichSelector.prototype.adjustHeight = function () {
        var settingHeight = this.height;
        var headHeight = 28;
        var searchBoxHeight = this.hasSearchBox ? 45 : 0;
        var footHeight = this.hasFoot ? 25 : 0;
        var content = this.getContent().main;
        if (settingHeight === 'auto') {
            content.style.height = 'auto';
        } else {
            var contentHeight = settingHeight - headHeight - searchBoxHeight - footHeight;
            if (this.isQuery()) {
                contentHeight -= 30;
            }
            content.style.height = contentHeight + 'px';
        }
    };
    RichSelector.prototype.adaptData = function () {
    };
    RichSelector.prototype.refresh = function () {
        if (this.hasSearchBox) {
            if (this.holdState && this.isQuery()) {
                var keyword = this.getKeyword();
                this.queryItem(keyword);
            } else {
                this.clearQuery();
                this.adaptData();
                this.refreshContent();
            }
        } else {
            this.adaptData();
            this.refreshContent();
        }
        this.refreshFoot();
        this.adjustHeight();
    };
    RichSelector.prototype.refreshFoot = function () {
        if (!this.hasFoot) {
            return;
        }
        var count = this.getCurrentStateItemsCount();
        var totalCountPanel = this.getTotalCountPanel();
        if (totalCountPanel) {
            var itemName = u.escape(this.itemName);
            totalCountPanel.setText('\u5171 ' + count + ' \u4E2A' + itemName);
        }
    };
    RichSelector.prototype.getCurrentStateItemsCount = function () {
        return 0;
    };
    RichSelector.prototype.repaint = painter.createRepaint(InputControl.prototype.repaint, {
        name: 'title',
        paint: function (control, title) {
            var head = control.getChild('head');
            var titleLabel = head && head.getChild('title');
            titleLabel && titleLabel.setText(title);
        }
    });
    RichSelector.prototype.getSelectedItems = function () {
        return [];
    };
    RichSelector.prototype.selectItems = function (items, toBeSelected) {
    };
    RichSelector.prototype.setRawValue = function (selectedItems) {
        this.rawValue = selectedItems;
        this.selectItems(selectedItems, true);
    };
    RichSelector.prototype.getRawValue = function () {
        return this.getSelectedItems();
    };
    RichSelector.prototype.stringifyValue = function (rawValue) {
        var selectedIds = [];
        u.each(rawValue, function (item) {
            selectedIds.push(item.id);
        });
        return selectedIds.join(',');
    };
    require('esui').register(RichSelector);
    return RichSelector;
});