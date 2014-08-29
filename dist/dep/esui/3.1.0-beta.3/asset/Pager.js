define('esui/Pager', [
    'require',
    'underscore',
    './lib',
    './main',
    './Control',
    './Select',
    './painters'
], function (require) {
    var u = require('underscore');
    var lib = require('./lib');
    var ui = require('./main');
    var Control = require('./Control');
    require('./Select');
    function getMainHTML(pager) {
        var template = [
                '<div id="${pagerWrapperId}" class="${pagerWrapperClass}">',
                '<div id="${selectWrapperId}" ',
                'class="${selectWrapperClass}">',
                '<span id="${labelId}" class="${labelClass}">',
                '${labelText}</span>',
                '<div data-ui="type:Select;childName:select;',
                'id:${selectId};width:40;"></div>',
                '</div>',
                '<ul id="${mainId}" class="${mainClass}"></ul>',
                '</div>'
            ];
        return lib.format(template.join(''), {
            pagerWrapperId: pager.helper.getId('pager-wrapper'),
            pagerWrapperClass: pager.helper.getPartClasses(pager.layout)[0],
            selectWrapperId: pager.helper.getId('select-wrapper'),
            selectWrapperClass: pager.helper.getPartClassName('select-wrapper'),
            labelId: pager.helper.getId('label'),
            labelClass: pager.helper.getPartClassName('label'),
            labelText: '\u6BCF\u9875\u663E\u793A',
            selectId: pager.helper.getId('select'),
            mainId: pager.helper.getId('main'),
            mainClass: pager.helper.getPartClassName('main')
        });
    }
    function getPagerMainHTML(pager) {
        var plainTpl = '<li class="${className}" id="${id}"' + ' data-page="${page}">${text}</li>';
        var anchorTpl = '<li class="${className}" id="${id}">' + '<a href="${link}">${text}</a></li>';
        var omitTpl = '<li class="${className}">\u2026</li>';
        function getUrlByTemplate(num) {
            return lib.format(pager.urlTemplate, {
                page: num,
                pageSize: pager.pageSize
            });
        }
        function getTplObj(className, num, id, text) {
            var obj = { className: pager.helper.getPartClassName(className) };
            if (arguments.length > 1) {
                obj.link = getUrlByTemplate(num);
                obj.id = pager.helper.getId(id);
                obj.page = num;
                obj.text = text;
            }
            return obj;
        }
        function getSegmentHTML(obj, tpl) {
            if (!tpl) {
                var templates = {
                        anchor: anchorTpl,
                        plain: plainTpl
                    };
                tpl = templates[pager.pageType] || templates.anchor;
            }
            return lib.format(tpl, obj);
        }
        function addSegmentToHTML(obj, tpl) {
            if (typeof obj === 'number') {
                obj = getTplObj('item', obj, 'page-' + obj, obj);
            }
            var segment = getSegmentHTML(obj, tpl);
            html.push(segment);
        }
        var page = pager.page;
        var backCount = pager.backCount;
        var forwardCount = pager.forwardCount;
        var totalPage = Math.ceil(pager.count / pager.pageSize);
        var html = [];
        if (page > 1) {
            var obj = getTplObj('item-extend', page - 1, 'page-back', pager.backText);
            addSegmentToHTML(obj);
        }
        if (page > backCount + 1) {
            addSegmentToHTML(1);
            if (page > backCount + 2) {
                var obj = getTplObj('item-omit');
                addSegmentToHTML(obj, omitTpl);
            }
        }
        var len = page > backCount ? backCount : page - 1;
        for (var i = page - len; i < page; i++) {
            addSegmentToHTML(i);
        }
        var obj = getTplObj('item-current', page, 'page-' + page, page);
        addSegmentToHTML(obj, plainTpl);
        var len = totalPage - page > forwardCount ? forwardCount : totalPage - page;
        for (var i = page + 1; i < page + len + 1; i++) {
            addSegmentToHTML(i);
        }
        if (page < totalPage - forwardCount) {
            if (page < totalPage - forwardCount - 1) {
                var obj = getTplObj('item-omit');
                addSegmentToHTML(obj, omitTpl);
            }
            addSegmentToHTML(totalPage);
        }
        if (page < totalPage) {
            var obj = getTplObj('item-extend', page + 1, 'page-forward', pager.forwardText);
            addSegmentToHTML(obj);
        }
        return html.join('');
    }
    function repaintPager(pager) {
        var pageSize = pager.pageSize;
        pageSize = pageSize > 0 ? pageSize : 1;
        pager.pageSize = pageSize;
        pager.getChild('select').set('value', pageSize + '');
        var totalPage = Math.ceil(pager.count / pageSize);
        var page = pager.page;
        page = page > totalPage ? totalPage : page;
        page = page > 0 ? page : 1;
        pager.page = page;
        var pagerMain = pager.helper.getPart('main');
        pagerMain.innerHTML = getPagerMainHTML(pager);
    }
    function repaintLayout(pager, style) {
        function getClasses() {
            var classes = [];
            for (var i = 0, len = arguments.length; i < len; i++) {
                classes.push(pager.helper.getPartClasses(arguments[i])[0]);
            }
            return classes;
        }
        var pagerWrapper = pager.helper.getPart('pager-wrapper');
        lib.removeClasses(pagerWrapper, getClasses('alignLeft', 'alignLeftReversed', 'alignRight', 'alignRightReversed', 'distributed', 'distributedReversed'));
        lib.addClass(pagerWrapper, pager.helper.getPartClasses(style)[0]);
    }
    function pagerClick(e) {
        var target = e.target;
        var backId = this.helper.getId('page-back');
        var forwardId = this.helper.getId('page-forward');
        var page = this.page;
        if (this.helper.isPart(target, 'item') || this.helper.isPart(target, 'item-extend')) {
            if (target.id === backId) {
                page--;
            } else if (target.id === forwardId) {
                page++;
            } else {
                page = +lib.getAttribute(target, 'data-page');
            }
            this.set('page', page);
        }
    }
    function getPageSizes(pageSizes) {
        var datasource = u.map(pageSizes, function (size) {
                return {
                    text: size + '',
                    value: size + ''
                };
            });
        return datasource;
    }
    function changePageSize(e) {
        var pageSize = parseInt(this.getChild('select').getValue(), 10);
        this.pageSize = pageSize;
        repaintPager(this);
        this.fire('changepagesize');
        this.fire('pagesizechange');
    }
    function showSelect(pager) {
        var selectWrapper = pager.helper.getPart('select-wrapper');
        pager.helper.removePartClasses('select-hidden', selectWrapper);
    }
    function hideSelect(pager) {
        var selectWrapper = pager.helper.getPart('select-wrapper');
        pager.helper.addPartClasses('select-hidden', selectWrapper);
    }
    function Pager(options) {
        Control.apply(this, arguments);
    }
    Pager.defaultProperties = {};
    Pager.prototype = {
        type: 'Pager',
        defaultProperties: {
            pageSizes: [
                15,
                30,
                50,
                100
            ],
            pageSize: 15
        },
        initOptions: function (options) {
            var properties = {
                    pageType: 'anchor',
                    count: 0,
                    page: 1,
                    backCount: 3,
                    forwardCount: 3,
                    backText: '\u4E0A\u4E00\u9875',
                    forwardText: '\u4E0B\u4E00\u9875',
                    urlTemplate: '',
                    layout: 'alignLeft'
                };
            u.extend(properties, this.defaultProperties, Pager.defaultProperties, options);
            this.setProperties(properties);
        },
        initStructure: function () {
            this.main.innerHTML = getMainHTML(this);
            this.helper.initChildren();
            var select = this.getChild('select');
            if (!this.pageSizes || !this.pageSizes.length) {
                hideSelect(this);
            } else {
                var properties = {
                        datasource: getPageSizes(this.pageSizes),
                        value: this.pageSize + ''
                    };
                select.setProperties(properties);
            }
            changePageSize.call(this);
        },
        initEvents: function () {
            var select = this.getChild('select');
            select.on('change', changePageSize, this);
            this.helper.addDOMEvent('main', 'click', pagerClick);
        },
        setProperties: function (properties) {
            properties = u.clone(properties);
            if (properties.hasOwnProperty('pageIndex') && !properties.hasOwnProperty('page')) {
                properties.page = +properties.pageIndex + 1;
            }
            var digitalProperties = [
                    'count',
                    'page',
                    'backCount',
                    'forwardCount',
                    'pageSize'
                ];
            u.each(digitalProperties, function (name) {
                var value = properties[name];
                if (u.isString(value)) {
                    properties[name] = +value;
                }
            });
            var changes = Control.prototype.setProperties.apply(this, arguments);
            if (changes.hasOwnProperty('page')) {
                this.fire('changepage');
                this.fire('pagechange');
            }
        },
        repaint: require('./painters').createRepaint(Control.prototype.repaint, {
            name: 'pageSizes',
            paint: function (pager, value) {
                var select = pager.getChild('select');
                if (!value || !value.length) {
                    hideSelect(pager);
                } else {
                    var properties = {
                            datasource: getPageSizes(value),
                            value: pager.pageSize + ''
                        };
                    select.setProperties(properties);
                    showSelect(pager);
                }
            }
        }, {
            name: 'layout',
            paint: repaintLayout
        }, {
            name: [
                'pageType',
                'count',
                'pageSize',
                'page',
                'backCount',
                'forwardCount',
                'backText',
                'forwardText',
                'urlTemplate'
            ],
            paint: repaintPager
        }),
        getPageIndex: function () {
            return this.get('page') - 1;
        }
    };
    lib.inherits(Pager, Control);
    ui.register(Pager);
    return Pager;
});