define('esui/Region', [
    'require',
    './Select',
    './lib',
    './controlHelper',
    './InputControl',
    './main',
    'underscore'
], function (require) {
    require('./Select');
    var lib = require('./lib');
    var helper = require('./controlHelper');
    var InputControl = require('./InputControl');
    var ui = require('./main');
    var u = require('underscore');
    function Region(options) {
        InputControl.apply(this, arguments);
    }
    function createMultiRegion(region) {
        var data = region.regionData;
        var len = data.length;
        var html = [];
        for (var i = 0; i < len; i++) {
            html.push(getLevelHtml(region, data[i], 1));
        }
        var tpl = '<input type="hidden" id="${inputId}" name="${name}" />';
        html.push(lib.format(tpl, {
            inputId: helper.getId(region, 'param-value'),
            name: region.name
        }));
        region.main.innerHTML = html.join('');
    }
    function walk(node, handler, context) {
        handler.call(context, node);
        u.each(node.children, function (child) {
            walk(child, handler, context);
        });
    }
    function selectMulti(region, values) {
        var regionDataIndex = region.regionDataIndex;
        var fullValues = [];
        u.each(values, function (value) {
            var node = regionDataIndex[value];
            if (node) {
                walk(node, function (node) {
                    fullValues.push(node.id);
                });
            }
        });
        var map = {};
        u.each(fullValues, function (value) {
            map[value] = 1;
        });
        u.each(region.regionDataIndex, function (item, key) {
            var checked = map.hasOwnProperty(key);
            var checkbox = getOptionDOM(region, key);
            if (checkbox) {
                checkbox.checked = checked;
            } else {
                item.isSelected = checked;
            }
        });
        updateMulti(region);
        updateParamValue(region);
    }
    function getOptionDOM(region, id) {
        return lib.g(helper.getId(region, 'item-' + id));
    }
    function updateMulti(region, data, dontResetValue, level) {
        var level = level || 0;
        data = data || { children: region.regionData };
        var indexData = region.regionDataIndex[data.id];
        if (!dontResetValue) {
            region.rawValue = [];
        }
        var isItemChecked;
        var selChildLength = 0;
        var checkbox = data.id && getOptionDOM(region, data.id);
        var children = data.children;
        var len = children instanceof Array && children.length;
        if (len) {
            var isChecked = true;
            for (var i = 0; i < len; i++) {
                isItemChecked = updateMulti(region, children[i], 1, level + 1);
                if (isItemChecked) {
                    selChildLength++;
                }
                isChecked = isChecked && isItemChecked;
            }
            if (checkbox) {
                checkbox.checked = isChecked;
                isChecked && region.rawValue.push(data.id);
                indexData.isSelected = isChecked;
            }
            if (level == 3) {
                if (!isChecked) {
                    updateSelectedTip(region, selChildLength, len, data.id);
                } else {
                    updateSelectedTip(region, 1, 1, data.id);
                }
            }
            return isChecked;
        } else {
            if (checkbox) {
                if (checkbox.checked) {
                    region.rawValue.push(data.id);
                }
                return checkbox.checked;
            } else if (indexData.isSelected) {
                region.rawValue.push(data.id);
            }
            return indexData.isSelected;
        }
    }
    function getHiddenClassName() {
        return ui.getConfig('stateClassPrefix') + '-hidden';
    }
    function updateSelectedTip(region, selCityIdsLength, cLength, id) {
        var infoTag = lib.g(helper.getId(region, 'info-' + id));
        if (selCityIdsLength !== 0 && selCityIdsLength !== cLength) {
            lib.removeClass(infoTag, getHiddenClassName());
            infoTag.innerHTML = selCityIdsLength + '/' + cLength + '';
        } else {
            lib.addClass(infoTag, getHiddenClassName());
            infoTag.innerHTML = '';
        }
    }
    var tplInputItem = [
            '<div class="${itemClasses}" id="${itemWrapperId}" >',
            '<input type="checkbox" value="${itemValue}" id="${itemId}"',
            ' data-optionId="${itemValue}" data-level="${level}">',
            '<label for="${itemId}">${text}</label>',
            '</div>'
        ].join('');
    var tplBoxWrapper = [
            '<div class="${boxClass}">',
            tplInputItem,
            '<div class="${contentClass}">${content}</div>',
            '</div>'
        ].join('');
    var tplPopLayer = [
            '<div class="${popLayerClass}">',
            '<div class="${hiddenClass} ${layerBoxClass}" id="${id}">',
            '${innerHTML}</div>',
            '<b class="${hiddenClass}" id="${infoId}"></b>',
            '</div>'
        ].join('');
    var tplProvinceWrapper = '<div class="${classes}">${content}</div>';
    var tempIdx = 0;
    function getLevelHtml(region, item, level) {
        item.level = level;
        var subItemHtml = [];
        var children = item.children;
        if (children != null) {
            item.isSelected = false;
            if (item.level == 3) {
                if (item.children && item.children.length > 0) {
                    region.cityCache[item.id] = formatItemChildren(region, item);
                }
            } else {
                var len = children instanceof Array && children.length;
                for (var i = 0; i < len; i++) {
                    subItemHtml.push(getLevelHtml(region, item.children[i], level + 1));
                }
            }
        }
        switch (level) {
        case 1:
            return lib.format(tplBoxWrapper, {
                boxClass: helper.getPartClasses(region, 'country-box').join(' '),
                itemClasses: helper.getPartClasses(region, 'country-check').join(' '),
                itemWrapperId: '',
                itemValue: item.id,
                itemId: helper.getId(region, 'item-' + item.id),
                level: item.level,
                text: item.text,
                contentClass: '',
                content: subItemHtml.join('')
            });
        case 2:
            return lib.format(tplBoxWrapper, {
                boxClass: helper.getPartClasses(region, 'region-box' + tempIdx++ % 2).join(' '),
                itemClasses: helper.getPartClasses(region, 'region-check').join(' '),
                itemWrapperId: '',
                itemValue: item.id,
                itemId: helper.getId(region, 'item-' + item.id),
                level: item.level,
                text: item.text,
                contentClass: helper.getPartClasses(region, 'province-box').join(' '),
                content: subItemHtml.join('')
            });
        case 3:
            var layer = lib.format(tplPopLayer, {
                    popLayerClass: helper.getPartClasses(region, 'locator').join(' '),
                    layerBoxClass: helper.getPartClasses(region, 'city-box').join(' '),
                    hiddenClass: getHiddenClassName(),
                    id: helper.getId(region, 'sub-' + item.id),
                    infoId: helper.getId(region, 'info-' + item.id),
                    innerHTML: subItemHtml.join('')
                });
            var text = lib.format(tplInputItem, {
                    itemClasses: helper.getPartClasses(region, 'text').join(' '),
                    itemWrapperId: helper.getId(region, 'wrapper-' + item.id),
                    itemValue: item.id,
                    itemId: helper.getId(region, 'item-' + item.id),
                    level: item.level,
                    text: item.text
                });
            return lib.format(tplProvinceWrapper, {
                classes: helper.getPartClasses(region, 'province-item').join(' '),
                content: layer + text
            });
        case 4:
            return lib.format(tplInputItem, {
                itemClasses: helper.getPartClasses(region, 'city').join(' '),
                itemWrapperId: '',
                itemValue: item.id,
                itemId: helper.getId(region, 'item-' + item.id),
                level: item.level,
                text: item.text
            });
        }
    }
    function formatItemChildren(region, item) {
        if (item.level == 3 && item.children != null) {
            var itemHtml = [];
            var leftLength = 0, rightLength = 0;
            for (var i = 0; i < item.children.length; i++) {
                item.children[i].parent = item;
                item.children[i].level = item.level + 1;
                itemHtml.push(getLevelHtml(region, item.children[i], item.level + 1));
                if (i % 2 === 0 && item.children[i].text.length > leftLength) {
                    leftLength = item.children[i].text.length;
                }
                if (i % 2 === 1 && item.children[i].text.length > rightLength) {
                    rightLength = item.children[i].text.length;
                }
            }
            if (itemHtml.length % 2 === 1) {
                itemHtml.push('');
            }
            var html = [
                    '<table border="0" cellspacing="0" cellpadding="0"',
                    ' width="',
                    (leftLength + rightLength) * 14 + 66,
                    '">'
                ].join('');
            var tpl = [
                    '<tr>',
                    '<td width="',
                    leftLength * 14 + 33,
                    '">${firstItem}',
                    '</td>',
                    '<td width="',
                    rightLength * 14 + 33,
                    '">${secondItem}',
                    '</td>',
                    '</tr>'
                ].join('');
            for (var j = 0; j < itemHtml.length; j += 2) {
                html += lib.format(tpl, {
                    firstItem: itemHtml[j],
                    secondItem: itemHtml[j + 1]
                });
            }
            return html + '</table>';
        }
        return '';
    }
    function initMultiData(region, properties) {
        var source = properties.regionData;
        properties.regionDataIndex = {};
        walker(source, { children: source });
        function walker(data, parent) {
            var len = data instanceof Array && data.length;
            var i;
            var item;
            if (!len) {
                return;
            }
            for (var i = 0; i < len; i++) {
                var item = lib.clone(data[i]);
                item.parent = parent;
                properties.regionDataIndex[item.id] = item;
                walker(item.children, item);
            }
        }
    }
    function mainClick(e) {
        if (this.disabled || this.readOnly) {
            return;
        }
        var tar = e.target;
        while (tar && tar != document.body) {
            var hit = false;
            if (tar.nodeName.toLowerCase() === 'input') {
                hit = true;
            } else if (tar.nodeName.toLowerCase() === 'label') {
                var checkId = lib.getAttribute(tar, 'for');
                tar = lib.g(checkId);
                hit = true;
            }
            if (hit) {
                optionClick(this, tar);
                this.fire('change');
                return;
            }
            tar = tar.parentNode;
        }
    }
    function optionClick(region, dom, dontRefreshView) {
        var id = lib.getAttribute(dom, 'data-optionId');
        var isChecked = dom.checked;
        var data = region.regionDataIndex[id];
        data.isSelected = isChecked;
        var children = data.children;
        var len = children instanceof Array && children.length;
        if (len) {
            u.each(children, function (child) {
                var checkbox = getOptionDOM(region, child.id);
                if (checkbox) {
                    checkbox.checked = isChecked;
                    optionClick(region, checkbox, 1);
                } else {
                    region.regionDataIndex[child.id].isSelected = isChecked;
                }
            });
        } else if (len === 0) {
            if (lib.getAttribute(dom, 'level') == 3) {
                var selCityIdsLength = 0;
                var cityTotal = region.regionDataIndex[id].parent.children;
                u.each(cityTotal, function (city) {
                    if (getOptionDOM(city.id).checked === true) {
                        selCityIdsLength++;
                    }
                });
                updateSelectedTip(region, selCityIdsLength, cityTotal.length, region.regionDataIndex[id].parent.id);
            }
        }
        if (!dontRefreshView) {
            updateMulti(region);
            updateParamValue(region);
        }
    }
    function mainMouseHandler(type, e) {
        if (this.disabled || this.readOnly) {
            return;
        }
        var tar = e.target;
        var textClass = helper.getPartClasses(this, 'text');
        var layerClass = helper.getPartClasses(this, 'city-box');
        var handler = showSubCity;
        if (type == 'hide') {
            handler = hideSubCity;
        }
        var itemId;
        while (tar && tar != document.body) {
            var optionChildLayer;
            if (lib.hasClass(tar, textClass[0])) {
                itemId = lib.getAttribute(tar.firstChild, 'value');
                optionChildLayer = tar.previousSibling.firstChild;
            } else if (lib.hasClass(tar, layerClass[0])) {
                optionChildLayer = tar;
            }
            if (optionChildLayer) {
                handler(this, optionChildLayer, itemId);
                return;
            }
            tar = tar.parentNode;
        }
    }
    function showSubCity(region, dom, itemId) {
        if (itemId) {
            var subCityHTML = region.cityCache[itemId];
            if (!subCityHTML) {
                return;
            }
            dom.innerHTML = subCityHTML;
            selectMulti(region, region.rawValue);
        }
        lib.removeClass(dom, getHiddenClassName());
        var wrapper = dom.parentNode.nextSibling;
        helper.addPartClasses(region, 'text-over', wrapper);
    }
    function hideSubCity(region, dom, itemId) {
        lib.addClass(dom, getHiddenClassName());
        var wrapper = dom.parentNode.nextSibling;
        helper.removePartClasses(region, 'text-over', wrapper);
    }
    function initSingleData(region, properties) {
        var result = [];
        walker({ children: properties.regionData });
        function walker(data) {
            var children = data.children;
            var hasChild = !!children;
            if (data.id) {
                result.push({
                    text: data.text,
                    value: data.id,
                    disabled: hasChild
                });
            }
            if (hasChild) {
                var len = children.length;
                for (var i = 0, len = children.length; i < len; i++) {
                    walker(children[i]);
                }
            }
        }
        properties.singleRegionData = result;
    }
    function createSingleRegion(region) {
        var tpl = '' + '<div data-ui="type:Select;childName:regionSel;' + 'id:regionSel;width:100;"></div>' + '<input type="hidden" id="${inputId}" name="${name}" />';
        region.main.innerHTML = lib.format(tpl, {
            inputId: helper.getId(region, 'param-value'),
            name: region.name
        });
        region.initChildren(region.main);
        var regionSel = region.getChild('regionSel');
        regionSel.setProperties({ datasource: region.singleRegionData });
        regionSel.on('change', lib.bind(changeSingleRegion, null, region, regionSel));
    }
    function changeSingleRegion(region, regionSel) {
        var regionId = parseInt(regionSel.getValue(), 10);
        region.rawValue = regionId;
        updateParamValue(region);
    }
    function changeToDisabled(region, disabled) {
        if (region.mode === 'multi') {
            var elements = region.main.getElementsByTagName('input');
            for (var i = 0, length = elements.length; i < length; i++) {
                var item = elements[i];
                item.disabled = disabled;
            }
        } else {
            var regionSel = region.getChild('regionSel');
            regionSel.setProperties({ disabled: disabled });
        }
    }
    function updateParamValue(region) {
        var input = lib.g(helper.getId(region, 'param-value'));
        var value = region.rawValue;
        if (lib.isArray(value)) {
            input.value = value.join(',');
        } else {
            input.value = value;
        }
    }
    function getPureSelected(region, node) {
        var dataIndex = region.regionDataIndex;
        var ids = [];
        if (dataIndex[node.id] && dataIndex[node.id].isSelected) {
            ids.push(node.id);
        } else {
            u.each(node.children, function (child) {
                var indexChild = dataIndex[child.id];
                ids.push.apply(ids, getPureSelected(region, indexChild));
            });
        }
        return ids;
    }
    Region.prototype = {
        type: 'Region',
        initOptions: function (options) {
            var properties = {
                    regionData: lib.clone(Region.REGION_LIST),
                    mode: 'multi',
                    pureSelect: false,
                    rawValue: []
                };
            helper.extractValueFromInput(this, options);
            if (options.value) {
                options.rawValue = options.value.split(',');
            }
            lib.extend(properties, options);
            if (properties.mode == 'multi') {
                initMultiData(this, properties);
                this.cityCache = {};
            } else {
                properties.rawValue = '';
                initSingleData(this, properties);
            }
            if (properties.pureSelect == 'false') {
                properties.pureSelect = false;
            }
            this.setProperties(properties);
        },
        initStructure: function () {
            if (lib.isInput(this.main)) {
                helper.replaceMain(this);
            }
            if (this.mode == 'multi') {
                createMultiRegion(this);
            } else {
                createSingleRegion(this);
                lib.addClass(this.main, helper.getPartClasses(this, 'single').join(' '));
            }
        },
        initEvents: function () {
            if (this.mode == 'multi') {
                this.helper.addDOMEvent(this.main, 'click', mainClick);
                this.helper.addDOMEvent(this.main, 'mouseover', lib.curry(mainMouseHandler, 'show'));
                this.helper.addDOMEvent(this.main, 'mouseout', lib.curry(mainMouseHandler, 'hide'));
            } else {
                var regionSel = this.getChild('regionSel');
                regionSel.on('change', lib.bind(changeSingleRegion, null, this, regionSel));
            }
        },
        repaint: helper.createRepaint(InputControl.prototype.repaint, {
            name: 'rawValue',
            paint: function (region, value) {
                if (region.mode == 'multi') {
                    selectMulti(region, value);
                } else {
                    var regionSel = region.getChild('regionSel');
                    regionSel.setProperties({ value: value });
                }
            }
        }, {
            name: [
                'disabled',
                'readOnly'
            ],
            paint: function (region, disabled, readOnly) {
                var editable = true;
                if (disabled || readOnly) {
                    editable = false;
                }
                changeToDisabled(region, !editable);
                if (!disabled && readOnly) {
                    var input = lib.g(helper.getId(region, 'param-value'));
                    input.disabled = false;
                }
            }
        }),
        setRawValue: function (value) {
            this.setProperties({ 'rawValue': value });
        },
        getRawValue: function () {
            if (this.mode == 'single') {
                return this.getChild('regionSel').getValue();
            }
            if (this.pureSelect) {
                var node = {
                        id: '-100',
                        children: this.regionData
                    };
                var ids = getPureSelected(this, node);
                return ids;
            }
            return this.rawValue;
        },
        stringifyValue: function (rawValue) {
            if (this.mode == 'multi') {
                return rawValue.join(',');
            } else {
                return rawValue;
            }
        },
        parseValue: function (value) {
            return value.split(',');
        }
    };
    Region.REGION_LIST = [
        {
            'id': '90',
            'text': '\u4E2D\u56FD',
            'children': [
                {
                    'id': '80',
                    'text': '\u534E\u5317\u5730\u533A',
                    'children': [
                        {
                            'id': '1',
                            'text': '\u5317\u4EAC',
                            'children': [
                                {
                                    'id': '742',
                                    'text': '\u660C\u5E73\u533A'
                                },
                                {
                                    'id': '743',
                                    'text': '\u671D\u9633\u533A'
                                },
                                {
                                    'id': '744',
                                    'text': '\u5D07\u6587\u533A'
                                },
                                {
                                    'id': '745',
                                    'text': '\u5927\u5174\u533A'
                                },
                                {
                                    'id': '746',
                                    'text': '\u4E1C\u57CE\u533A'
                                },
                                {
                                    'id': '747',
                                    'text': '\u623F\u5C71\u533A'
                                },
                                {
                                    'id': '748',
                                    'text': '\u4E30\u53F0\u533A'
                                },
                                {
                                    'id': '749',
                                    'text': '\u6D77\u6DC0\u533A'
                                },
                                {
                                    'id': '750',
                                    'text': '\u6000\u67D4\u533A'
                                },
                                {
                                    'id': '751',
                                    'text': '\u95E8\u5934\u6C9F\u533A'
                                },
                                {
                                    'id': '752',
                                    'text': '\u5BC6\u4E91\u53BF'
                                },
                                {
                                    'id': '753',
                                    'text': '\u5E73\u8C37\u533A'
                                },
                                {
                                    'id': '754',
                                    'text': '\u77F3\u666F\u5C71\u533A'
                                },
                                {
                                    'id': '755',
                                    'text': '\u987A\u4E49\u533A'
                                },
                                {
                                    'id': '756',
                                    'text': '\u901A\u5DDE\u533A'
                                },
                                {
                                    'id': '757',
                                    'text': '\u897F\u57CE\u533A'
                                },
                                {
                                    'id': '758',
                                    'text': '\u5BA3\u6B66\u533A'
                                },
                                {
                                    'id': '759',
                                    'text': '\u5EF6\u5E86\u53BF'
                                }
                            ]
                        },
                        {
                            'id': '3',
                            'text': '\u5929\u6D25',
                            'children': [
                                {
                                    'id': '760',
                                    'text': '\u5B9D\u577B\u533A'
                                },
                                {
                                    'id': '761',
                                    'text': '\u5317\u8FB0\u533A'
                                },
                                {
                                    'id': '763',
                                    'text': '\u4E1C\u4E3D\u533A'
                                },
                                {
                                    'id': '765',
                                    'text': '\u6CB3\u5317\u533A'
                                },
                                {
                                    'id': '766',
                                    'text': '\u6CB3\u4E1C\u533A'
                                },
                                {
                                    'id': '767',
                                    'text': '\u548C\u5E73\u533A'
                                },
                                {
                                    'id': '768',
                                    'text': '\u6CB3\u897F\u533A'
                                },
                                {
                                    'id': '769',
                                    'text': '\u7EA2\u6865\u533A'
                                },
                                {
                                    'id': '770',
                                    'text': '\u84DF\u53BF'
                                },
                                {
                                    'id': '771',
                                    'text': '\u6D25\u5357\u533A'
                                },
                                {
                                    'id': '772',
                                    'text': '\u9759\u6D77\u53BF'
                                },
                                {
                                    'id': '773',
                                    'text': '\u5357\u5F00\u533A'
                                },
                                {
                                    'id': '774',
                                    'text': '\u5B81\u6CB3\u53BF'
                                },
                                {
                                    'id': '776',
                                    'text': '\u6B66\u6E05\u533A'
                                },
                                {
                                    'id': '777',
                                    'text': '\u897F\u9752\u533A'
                                },
                                {
                                    'id': '900',
                                    'text': '\u6EE8\u6D77\u65B0\u533A'
                                }
                            ]
                        },
                        {
                            'id': '15',
                            'text': '\u6CB3\u5317',
                            'children': [
                                {
                                    'id': '226',
                                    'text': '\u4FDD\u5B9A\u5E02'
                                },
                                {
                                    'id': '228',
                                    'text': '\u6CA7\u5DDE\u5E02'
                                },
                                {
                                    'id': '229',
                                    'text': '\u627F\u5FB7\u5E02'
                                },
                                {
                                    'id': '230',
                                    'text': '\u90AF\u90F8\u5E02'
                                },
                                {
                                    'id': '231',
                                    'text': '\u8861\u6C34\u5E02'
                                },
                                {
                                    'id': '234',
                                    'text': '\u5ECA\u574A\u5E02'
                                },
                                {
                                    'id': '236',
                                    'text': '\u79E6\u7687\u5C9B\u5E02'
                                },
                                {
                                    'id': '239',
                                    'text': '\u77F3\u5BB6\u5E84\u5E02'
                                },
                                {
                                    'id': '240',
                                    'text': '\u5510\u5C71\u5E02'
                                },
                                {
                                    'id': '241',
                                    'text': '\u90A2\u53F0\u5E02'
                                },
                                {
                                    'id': '242',
                                    'text': '\u5F20\u5BB6\u53E3\u5E02'
                                }
                            ]
                        },
                        {
                            'id': '24',
                            'text': '\u5185\u8499\u53E4',
                            'children': [
                                {
                                    'id': '428',
                                    'text': '\u963F\u62C9\u5584\u76DF'
                                },
                                {
                                    'id': '429',
                                    'text': '\u5DF4\u5F66\u6DD6\u5C14\u5E02'
                                },
                                {
                                    'id': '430',
                                    'text': '\u5305\u5934\u5E02'
                                },
                                {
                                    'id': '431',
                                    'text': '\u8D64\u5CF0\u5E02'
                                },
                                {
                                    'id': '432',
                                    'text': '\u9102\u5C14\u591A\u65AF\u5E02'
                                },
                                {
                                    'id': '434',
                                    'text': '\u547C\u548C\u6D69\u7279\u5E02'
                                },
                                {
                                    'id': '435',
                                    'text': '\u547C\u4F26\u8D1D\u5C14\u5E02'
                                },
                                {
                                    'id': '437',
                                    'text': '\u901A\u8FBD\u5E02'
                                },
                                {
                                    'id': '438',
                                    'text': '\u4E4C\u6D77\u5E02'
                                },
                                {
                                    'id': '439',
                                    'text': '\u4E4C\u5170\u5BDF\u5E03\u5E02'
                                },
                                {
                                    'id': '442',
                                    'text': '\u9521\u6797\u90ED\u52D2\u76DF'
                                },
                                {
                                    'id': '444',
                                    'text': '\u5174\u5B89\u76DF'
                                }
                            ]
                        },
                        {
                            'id': '28',
                            'text': '\u5C71\u897F',
                            'children': [
                                {
                                    'id': '486',
                                    'text': '\u5927\u540C\u5E02'
                                },
                                {
                                    'id': '491',
                                    'text': '\u664B\u57CE\u5E02'
                                },
                                {
                                    'id': '492',
                                    'text': '\u664B\u4E2D\u5E02'
                                },
                                {
                                    'id': '493',
                                    'text': '\u4E34\u6C7E\u5E02'
                                },
                                {
                                    'id': '494',
                                    'text': '\u5415\u6881\u5E02'
                                },
                                {
                                    'id': '495',
                                    'text': '\u6714\u5DDE\u5E02'
                                },
                                {
                                    'id': '496',
                                    'text': '\u592A\u539F\u5E02'
                                },
                                {
                                    'id': '497',
                                    'text': '\u5FFB\u5DDE\u5E02'
                                },
                                {
                                    'id': '498',
                                    'text': '\u9633\u6CC9\u5E02'
                                },
                                {
                                    'id': '501',
                                    'text': '\u8FD0\u57CE\u5E02'
                                },
                                {
                                    'id': '502',
                                    'text': '\u957F\u6CBB\u5E02'
                                }
                            ]
                        }
                    ]
                },
                {
                    'id': '81',
                    'text': '\u4E1C\u5317\u5730\u533A',
                    'children': [
                        {
                            'id': '17',
                            'text': '\u9ED1\u9F99\u6C5F',
                            'children': [
                                {
                                    'id': '272',
                                    'text': '\u5927\u5E86\u5E02'
                                },
                                {
                                    'id': '273',
                                    'text': '\u5927\u5174\u5B89\u5CAD\u5730\u533A'
                                },
                                {
                                    'id': '276',
                                    'text': '\u54C8\u5C14\u6EE8\u5E02'
                                },
                                {
                                    'id': '278',
                                    'text': '\u9E64\u5C97\u5E02'
                                },
                                {
                                    'id': '279',
                                    'text': '\u9ED1\u6CB3\u5E02'
                                },
                                {
                                    'id': '282',
                                    'text': '\u9E21\u897F\u5E02'
                                },
                                {
                                    'id': '284',
                                    'text': '\u4F73\u6728\u65AF\u5E02'
                                },
                                {
                                    'id': '287',
                                    'text': '\u7261\u4E39\u6C5F\u5E02'
                                },
                                {
                                    'id': '289',
                                    'text': '\u4E03\u53F0\u6CB3\u5E02'
                                },
                                {
                                    'id': '290',
                                    'text': '\u9F50\u9F50\u54C8\u5C14\u5E02'
                                },
                                {
                                    'id': '291',
                                    'text': '\u53CC\u9E2D\u5C71\u5E02'
                                },
                                {
                                    'id': '293',
                                    'text': '\u7EE5\u5316\u5E02'
                                },
                                {
                                    'id': '298',
                                    'text': '\u4F0A\u6625\u5E02'
                                }
                            ]
                        },
                        {
                            'id': '20',
                            'text': '\u5409\u6797',
                            'children': [
                                {
                                    'id': '345',
                                    'text': '\u767D\u57CE\u5E02'
                                },
                                {
                                    'id': '346',
                                    'text': '\u767D\u5C71\u5E02'
                                },
                                {
                                    'id': '351',
                                    'text': '\u5409\u6797\u5E02'
                                },
                                {
                                    'id': '352',
                                    'text': '\u8FBD\u6E90\u5E02'
                                },
                                {
                                    'id': '355',
                                    'text': '\u56DB\u5E73\u5E02'
                                },
                                {
                                    'id': '356',
                                    'text': '\u677E\u539F\u5E02'
                                },
                                {
                                    'id': '358',
                                    'text': '\u901A\u5316\u5E02'
                                },
                                {
                                    'id': '359',
                                    'text': '\u5EF6\u8FB9\u671D\u9C9C\u65CF\u81EA\u6CBB\u5DDE'
                                },
                                {
                                    'id': '361',
                                    'text': '\u957F\u6625\u5E02'
                                }
                            ]
                        },
                        {
                            'id': '23',
                            'text': '\u8FBD\u5B81',
                            'children': [
                                {
                                    'id': '413',
                                    'text': '\u978D\u5C71\u5E02'
                                },
                                {
                                    'id': '414',
                                    'text': '\u672C\u6EAA\u5E02'
                                },
                                {
                                    'id': '415',
                                    'text': '\u671D\u9633\u5E02'
                                },
                                {
                                    'id': '416',
                                    'text': '\u5927\u8FDE\u5E02'
                                },
                                {
                                    'id': '417',
                                    'text': '\u4E39\u4E1C\u5E02'
                                },
                                {
                                    'id': '418',
                                    'text': '\u629A\u987A\u5E02'
                                },
                                {
                                    'id': '419',
                                    'text': '\u961C\u65B0\u5E02'
                                },
                                {
                                    'id': '421',
                                    'text': '\u846B\u82A6\u5C9B\u5E02'
                                },
                                {
                                    'id': '422',
                                    'text': '\u9526\u5DDE\u5E02'
                                },
                                {
                                    'id': '423',
                                    'text': '\u8FBD\u9633\u5E02'
                                },
                                {
                                    'id': '424',
                                    'text': '\u76D8\u9526\u5E02'
                                },
                                {
                                    'id': '425',
                                    'text': '\u6C88\u9633\u5E02'
                                },
                                {
                                    'id': '426',
                                    'text': '\u94C1\u5CAD\u5E02'
                                },
                                {
                                    'id': '427',
                                    'text': '\u8425\u53E3\u5E02'
                                }
                            ]
                        }
                    ]
                },
                {
                    'id': '82',
                    'text': '\u534E\u4E1C\u5730\u533A',
                    'children': [
                        {
                            'id': '2',
                            'text': '\u4E0A\u6D77',
                            'children': [
                                {
                                    'id': '818',
                                    'text': '\u5B9D\u5C71\u533A'
                                },
                                {
                                    'id': '819',
                                    'text': '\u5D07\u660E\u53BF'
                                },
                                {
                                    'id': '820',
                                    'text': '\u5949\u8D24\u533A'
                                },
                                {
                                    'id': '821',
                                    'text': '\u8679\u53E3\u533A'
                                },
                                {
                                    'id': '822',
                                    'text': '\u9EC4\u6D66\u533A'
                                },
                                {
                                    'id': '823',
                                    'text': '\u5609\u5B9A\u533A'
                                },
                                {
                                    'id': '824',
                                    'text': '\u91D1\u5C71\u533A'
                                },
                                {
                                    'id': '825',
                                    'text': '\u9759\u5B89\u533A'
                                },
                                {
                                    'id': '826',
                                    'text': '\u5362\u6E7E\u533A'
                                },
                                {
                                    'id': '827',
                                    'text': '\u95F5\u884C\u533A'
                                },
                                {
                                    'id': '830',
                                    'text': '\u6D66\u4E1C\u65B0\u533A'
                                },
                                {
                                    'id': '831',
                                    'text': '\u666E\u9640\u533A'
                                },
                                {
                                    'id': '832',
                                    'text': '\u9752\u6D66\u533A'
                                },
                                {
                                    'id': '833',
                                    'text': '\u677E\u6C5F\u533A'
                                },
                                {
                                    'id': '834',
                                    'text': '\u5F90\u6C47\u533A'
                                },
                                {
                                    'id': '835',
                                    'text': '\u6768\u6D66\u533A'
                                },
                                {
                                    'id': '836',
                                    'text': '\u95F8\u5317\u533A'
                                },
                                {
                                    'id': '837',
                                    'text': '\u957F\u5B81\u533A'
                                }
                            ]
                        },
                        {
                            'id': '8',
                            'text': '\u5B89\u5FBD',
                            'children': [
                                {
                                    'id': '101',
                                    'text': '\u5B89\u5E86\u5E02'
                                },
                                {
                                    'id': '102',
                                    'text': '\u868C\u57E0\u5E02'
                                },
                                {
                                    'id': '103',
                                    'text': '\u4EB3\u5DDE\u5E02'
                                },
                                {
                                    'id': '104',
                                    'text': '\u5DE2\u6E56\u5E02'
                                },
                                {
                                    'id': '105',
                                    'text': '\u6C60\u5DDE\u5E02'
                                },
                                {
                                    'id': '106',
                                    'text': '\u6EC1\u5DDE\u5E02'
                                },
                                {
                                    'id': '107',
                                    'text': '\u961C\u9633\u5E02'
                                },
                                {
                                    'id': '110',
                                    'text': '\u5408\u80A5\u5E02'
                                },
                                {
                                    'id': '111',
                                    'text': '\u6DEE\u5317\u5E02'
                                },
                                {
                                    'id': '112',
                                    'text': '\u6DEE\u5357\u5E02'
                                },
                                {
                                    'id': '113',
                                    'text': '\u9EC4\u5C71\u5E02'
                                },
                                {
                                    'id': '115',
                                    'text': '\u516D\u5B89\u5E02'
                                },
                                {
                                    'id': '116',
                                    'text': '\u9A6C\u978D\u5C71\u5E02'
                                },
                                {
                                    'id': '118',
                                    'text': '\u94DC\u9675\u5E02'
                                },
                                {
                                    'id': '119',
                                    'text': '\u829C\u6E56\u5E02'
                                },
                                {
                                    'id': '120',
                                    'text': '\u5BBF\u5DDE\u5E02'
                                },
                                {
                                    'id': '121',
                                    'text': '\u5BA3\u57CE\u5E02'
                                }
                            ]
                        },
                        {
                            'id': '9',
                            'text': '\u798F\u5EFA',
                            'children': [
                                {
                                    'id': '124',
                                    'text': '\u798F\u5DDE\u5E02'
                                },
                                {
                                    'id': '126',
                                    'text': '\u9F99\u5CA9\u5E02'
                                },
                                {
                                    'id': '127',
                                    'text': '\u5357\u5E73\u5E02'
                                },
                                {
                                    'id': '128',
                                    'text': '\u5B81\u5FB7\u5E02'
                                },
                                {
                                    'id': '129',
                                    'text': '\u8386\u7530\u5E02'
                                },
                                {
                                    'id': '130',
                                    'text': '\u6CC9\u5DDE\u5E02'
                                },
                                {
                                    'id': '131',
                                    'text': '\u4E09\u660E\u5E02'
                                },
                                {
                                    'id': '132',
                                    'text': '\u53A6\u95E8\u5E02'
                                },
                                {
                                    'id': '138',
                                    'text': '\u6F33\u5DDE\u5E02'
                                }
                            ]
                        },
                        {
                            'id': '21',
                            'text': '\u6C5F\u82CF',
                            'children': [
                                {
                                    'id': '363',
                                    'text': '\u5E38\u5DDE\u5E02'
                                },
                                {
                                    'id': '367',
                                    'text': '\u6DEE\u5B89\u5E02'
                                },
                                {
                                    'id': '375',
                                    'text': '\u8FDE\u4E91\u6E2F\u5E02'
                                },
                                {
                                    'id': '376',
                                    'text': '\u5357\u4EAC\u5E02'
                                },
                                {
                                    'id': '377',
                                    'text': '\u5357\u901A\u5E02'
                                },
                                {
                                    'id': '381',
                                    'text': '\u82CF\u5DDE\u5E02'
                                },
                                {
                                    'id': '383',
                                    'text': '\u6CF0\u5DDE\u5E02'
                                },
                                {
                                    'id': '386',
                                    'text': '\u65E0\u9521\u5E02'
                                },
                                {
                                    'id': '391',
                                    'text': '\u5BBF\u8FC1\u5E02'
                                },
                                {
                                    'id': '392',
                                    'text': '\u5F90\u5DDE\u5E02'
                                },
                                {
                                    'id': '393',
                                    'text': '\u76D0\u57CE\u5E02'
                                },
                                {
                                    'id': '395',
                                    'text': '\u626C\u5DDE\u5E02'
                                },
                                {
                                    'id': '399',
                                    'text': '\u9547\u6C5F\u5E02'
                                }
                            ]
                        },
                        {
                            'id': '22',
                            'text': '\u6C5F\u897F',
                            'children': [
                                {
                                    'id': '401',
                                    'text': '\u629A\u5DDE\u5E02'
                                },
                                {
                                    'id': '402',
                                    'text': '\u8D63\u5DDE\u5E02'
                                },
                                {
                                    'id': '403',
                                    'text': '\u5409\u5B89\u5E02'
                                },
                                {
                                    'id': '404',
                                    'text': '\u666F\u5FB7\u9547\u5E02'
                                },
                                {
                                    'id': '406',
                                    'text': '\u4E5D\u6C5F\u5E02'
                                },
                                {
                                    'id': '407',
                                    'text': '\u5357\u660C\u5E02'
                                },
                                {
                                    'id': '408',
                                    'text': '\u840D\u4E61\u5E02'
                                },
                                {
                                    'id': '409',
                                    'text': '\u4E0A\u9976\u5E02'
                                },
                                {
                                    'id': '410',
                                    'text': '\u65B0\u4F59\u5E02'
                                },
                                {
                                    'id': '411',
                                    'text': '\u5B9C\u6625\u5E02'
                                },
                                {
                                    'id': '412',
                                    'text': '\u9E70\u6F6D\u5E02'
                                }
                            ]
                        },
                        {
                            'id': '27',
                            'text': '\u5C71\u4E1C',
                            'children': [
                                {
                                    'id': '461',
                                    'text': '\u6EE8\u5DDE\u5E02'
                                },
                                {
                                    'id': '462',
                                    'text': '\u5FB7\u5DDE\u5E02'
                                },
                                {
                                    'id': '463',
                                    'text': '\u4E1C\u8425\u5E02'
                                },
                                {
                                    'id': '466',
                                    'text': '\u83CF\u6CFD\u5E02'
                                },
                                {
                                    'id': '467',
                                    'text': '\u6D4E\u5357\u5E02'
                                },
                                {
                                    'id': '468',
                                    'text': '\u6D4E\u5B81\u5E02'
                                },
                                {
                                    'id': '470',
                                    'text': '\u83B1\u829C\u5E02'
                                },
                                {
                                    'id': '472',
                                    'text': '\u804A\u57CE\u5E02'
                                },
                                {
                                    'id': '473',
                                    'text': '\u4E34\u6C82\u5E02'
                                },
                                {
                                    'id': '474',
                                    'text': '\u9752\u5C9B\u5E02'
                                },
                                {
                                    'id': '476',
                                    'text': '\u65E5\u7167\u5E02'
                                },
                                {
                                    'id': '477',
                                    'text': '\u6CF0\u5B89\u5E02'
                                },
                                {
                                    'id': '479',
                                    'text': '\u5A01\u6D77\u5E02'
                                },
                                {
                                    'id': '480',
                                    'text': '\u6F4D\u574A\u5E02'
                                },
                                {
                                    'id': '481',
                                    'text': '\u70DF\u53F0\u5E02'
                                },
                                {
                                    'id': '482',
                                    'text': '\u67A3\u5E84\u5E02'
                                },
                                {
                                    'id': '485',
                                    'text': '\u6DC4\u535A\u5E02'
                                }
                            ]
                        },
                        {
                            'id': '34',
                            'text': '\u6D59\u6C5F',
                            'children': [
                                {
                                    'id': '604',
                                    'text': '\u676D\u5DDE\u5E02'
                                },
                                {
                                    'id': '605',
                                    'text': '\u6E56\u5DDE\u5E02'
                                },
                                {
                                    'id': '606',
                                    'text': '\u5609\u5174\u5E02'
                                },
                                {
                                    'id': '608',
                                    'text': '\u91D1\u534E\u5E02'
                                },
                                {
                                    'id': '611',
                                    'text': '\u4E3D\u6C34\u5E02'
                                },
                                {
                                    'id': '615',
                                    'text': '\u5B81\u6CE2\u5E02'
                                },
                                {
                                    'id': '617',
                                    'text': '\u8862\u5DDE\u5E02'
                                },
                                {
                                    'id': '619',
                                    'text': '\u7ECD\u5174\u5E02'
                                },
                                {
                                    'id': '621',
                                    'text': '\u53F0\u5DDE\u5E02'
                                },
                                {
                                    'id': '624',
                                    'text': '\u6E29\u5DDE\u5E02'
                                },
                                {
                                    'id': '630',
                                    'text': '\u821F\u5C71\u5E02'
                                }
                            ]
                        }
                    ]
                },
                {
                    'id': '83',
                    'text': '\u534E\u4E2D\u5730\u533A',
                    'children': [
                        {
                            'id': '16',
                            'text': '\u6CB3\u5357',
                            'children': [
                                {
                                    'id': '243',
                                    'text': '\u5B89\u9633\u5E02'
                                },
                                {
                                    'id': '246',
                                    'text': '\u9E64\u58C1\u5E02'
                                },
                                {
                                    'id': '249',
                                    'text': '\u7126\u4F5C\u5E02'
                                },
                                {
                                    'id': '250',
                                    'text': '\u5F00\u5C01\u5E02'
                                },
                                {
                                    'id': '252',
                                    'text': '\u6F2F\u6CB3\u5E02'
                                },
                                {
                                    'id': '253',
                                    'text': '\u6D1B\u9633\u5E02'
                                },
                                {
                                    'id': '254',
                                    'text': '\u5357\u9633\u5E02'
                                },
                                {
                                    'id': '255',
                                    'text': '\u5E73\u9876\u5C71\u5E02'
                                },
                                {
                                    'id': '256',
                                    'text': '\u6FEE\u9633\u5E02'
                                },
                                {
                                    'id': '257',
                                    'text': '\u4E09\u95E8\u5CE1\u5E02'
                                },
                                {
                                    'id': '258',
                                    'text': '\u5546\u4E18\u5E02'
                                },
                                {
                                    'id': '261',
                                    'text': '\u65B0\u4E61\u5E02'
                                },
                                {
                                    'id': '262',
                                    'text': '\u4FE1\u9633\u5E02'
                                },
                                {
                                    'id': '263',
                                    'text': '\u8BB8\u660C\u5E02'
                                },
                                {
                                    'id': '266',
                                    'text': '\u90D1\u5DDE\u5E02'
                                },
                                {
                                    'id': '267',
                                    'text': '\u5468\u53E3\u5E02'
                                },
                                {
                                    'id': '268',
                                    'text': '\u9A7B\u9A6C\u5E97\u5E02'
                                },
                                {
                                    'id': '901',
                                    'text': '\u6D4E\u6E90\u5E02'
                                }
                            ]
                        },
                        {
                            'id': '18',
                            'text': '\u6E56\u5317',
                            'children': [
                                {
                                    'id': '304',
                                    'text': '\u9102\u5DDE\u5E02'
                                },
                                {
                                    'id': '305',
                                    'text': '\u6069\u65BD\u5E02'
                                },
                                {
                                    'id': '307',
                                    'text': '\u9EC4\u5188\u5E02'
                                },
                                {
                                    'id': '308',
                                    'text': '\u9EC4\u77F3\u5E02'
                                },
                                {
                                    'id': '309',
                                    'text': '\u8346\u95E8\u5E02'
                                },
                                {
                                    'id': '310',
                                    'text': '\u8346\u5DDE\u5E02'
                                },
                                {
                                    'id': '311',
                                    'text': '\u6F5C\u6C5F\u5E02'
                                },
                                {
                                    'id': '312',
                                    'text': '\u795E\u519C\u67B6\u6797\u533A'
                                },
                                {
                                    'id': '313',
                                    'text': '\u5341\u5830\u5E02'
                                },
                                {
                                    'id': '314',
                                    'text': '\u968F\u5DDE\u5E02'
                                },
                                {
                                    'id': '315',
                                    'text': '\u5929\u95E8\u5E02'
                                },
                                {
                                    'id': '317',
                                    'text': '\u6B66\u6C49'
                                },
                                {
                                    'id': '319',
                                    'text': '\u4ED9\u6843\u5E02'
                                },
                                {
                                    'id': '320',
                                    'text': '\u54B8\u5B81\u5E02'
                                },
                                {
                                    'id': '321',
                                    'text': '\u8944\u6A0A\u5E02'
                                },
                                {
                                    'id': '323',
                                    'text': '\u5B5D\u611F\u5E02'
                                },
                                {
                                    'id': '324',
                                    'text': '\u5B9C\u660C\u5E02'
                                }
                            ]
                        },
                        {
                            'id': '19',
                            'text': '\u6E56\u5357',
                            'children': [
                                {
                                    'id': '328',
                                    'text': '\u5E38\u5FB7\u5E02'
                                },
                                {
                                    'id': '329',
                                    'text': '\u90F4\u5DDE\u5E02'
                                },
                                {
                                    'id': '330',
                                    'text': '\u8861\u9633\u5E02'
                                },
                                {
                                    'id': '331',
                                    'text': '\u6000\u5316\u5E02'
                                },
                                {
                                    'id': '334',
                                    'text': '\u5A04\u5E95\u5E02'
                                },
                                {
                                    'id': '335',
                                    'text': '\u90B5\u9633\u5E02'
                                },
                                {
                                    'id': '337',
                                    'text': '\u6E58\u6F6D\u5E02'
                                },
                                {
                                    'id': '338',
                                    'text': '\u6E58\u897F\u571F\u5BB6\u65CF\u82D7\u65CF\u81EA\u6CBB\u5DDE'
                                },
                                {
                                    'id': '339',
                                    'text': '\u76CA\u9633\u5E02'
                                },
                                {
                                    'id': '340',
                                    'text': '\u6C38\u5DDE\u5E02'
                                },
                                {
                                    'id': '341',
                                    'text': '\u5CB3\u9633\u5E02'
                                },
                                {
                                    'id': '342',
                                    'text': '\u5F20\u5BB6\u754C\u5E02'
                                },
                                {
                                    'id': '343',
                                    'text': '\u957F\u6C99\u5E02'
                                },
                                {
                                    'id': '344',
                                    'text': '\u682A\u6D32\u5E02'
                                }
                            ]
                        }
                    ]
                },
                {
                    'id': '84',
                    'text': '\u534E\u5357\u5730\u533A',
                    'children': [
                        {
                            'id': '11',
                            'text': '\u5E7F\u4E1C',
                            'children': [
                                {
                                    'id': '157',
                                    'text': '\u6F6E\u5DDE\u5E02'
                                },
                                {
                                    'id': '158',
                                    'text': '\u4E1C\u839E\u5E02'
                                },
                                {
                                    'id': '160',
                                    'text': '\u4F5B\u5C71\u5E02'
                                },
                                {
                                    'id': '162',
                                    'text': '\u5E7F\u5DDE\u5E02'
                                },
                                {
                                    'id': '163',
                                    'text': '\u6CB3\u6E90\u5E02'
                                },
                                {
                                    'id': '164',
                                    'text': '\u60E0\u5DDE\u5E02'
                                },
                                {
                                    'id': '166',
                                    'text': '\u6C5F\u95E8\u5E02'
                                },
                                {
                                    'id': '167',
                                    'text': '\u63ED\u9633\u5E02'
                                },
                                {
                                    'id': '169',
                                    'text': '\u8302\u540D\u5E02'
                                },
                                {
                                    'id': '170',
                                    'text': '\u6885\u5DDE\u5E02'
                                },
                                {
                                    'id': '172',
                                    'text': '\u6E05\u8FDC\u5E02'
                                },
                                {
                                    'id': '173',
                                    'text': '\u6C55\u5934\u5E02'
                                },
                                {
                                    'id': '174',
                                    'text': '\u6C55\u5C3E\u5E02'
                                },
                                {
                                    'id': '175',
                                    'text': '\u97F6\u5173\u5E02'
                                },
                                {
                                    'id': '176',
                                    'text': '\u6DF1\u5733\u5E02'
                                },
                                {
                                    'id': '180',
                                    'text': '\u9633\u6C5F\u5E02'
                                },
                                {
                                    'id': '182',
                                    'text': '\u4E91\u6D6E\u5E02'
                                },
                                {
                                    'id': '184',
                                    'text': '\u6E5B\u6C5F\u5E02'
                                },
                                {
                                    'id': '185',
                                    'text': '\u8087\u5E86\u5E02'
                                },
                                {
                                    'id': '186',
                                    'text': '\u4E2D\u5C71\u5E02'
                                },
                                {
                                    'id': '187',
                                    'text': '\u73E0\u6D77\u5E02'
                                }
                            ]
                        },
                        {
                            'id': '12',
                            'text': '\u5E7F\u897F',
                            'children': [
                                {
                                    'id': '188',
                                    'text': '\u767E\u8272\u5E02'
                                },
                                {
                                    'id': '189',
                                    'text': '\u5317\u6D77\u5E02'
                                },
                                {
                                    'id': '191',
                                    'text': '\u9632\u57CE\u6E2F\u5E02'
                                },
                                {
                                    'id': '193',
                                    'text': '\u8D35\u6E2F\u5E02'
                                },
                                {
                                    'id': '194',
                                    'text': '\u6842\u6797\u5E02'
                                },
                                {
                                    'id': '195',
                                    'text': '\u6CB3\u6C60\u5E02'
                                },
                                {
                                    'id': '196',
                                    'text': '\u8D3A\u5DDE\u5E02'
                                },
                                {
                                    'id': '197',
                                    'text': '\u6765\u5BBE\u5E02'
                                },
                                {
                                    'id': '198',
                                    'text': '\u67F3\u5DDE\u5E02'
                                },
                                {
                                    'id': '199',
                                    'text': '\u5357\u5B81\u5E02'
                                },
                                {
                                    'id': '200',
                                    'text': '\u94A6\u5DDE\u5E02'
                                },
                                {
                                    'id': '201',
                                    'text': '\u68A7\u5DDE\u5E02'
                                },
                                {
                                    'id': '203',
                                    'text': '\u7389\u6797\u5E02'
                                }
                            ]
                        },
                        {
                            'id': '14',
                            'text': '\u6D77\u5357',
                            'children': [
                                {
                                    'id': '218',
                                    'text': '\u510B\u5DDE\u5E02'
                                },
                                {
                                    'id': '219',
                                    'text': '\u4E1C\u65B9\u5E02'
                                },
                                {
                                    'id': '220',
                                    'text': '\u6D77\u53E3\u5E02'
                                },
                                {
                                    'id': '221',
                                    'text': '\u743C\u6D77\u5E02'
                                },
                                {
                                    'id': '223',
                                    'text': '\u4E09\u4E9A\u5E02'
                                },
                                {
                                    'id': '225',
                                    'text': '\u6587\u660C\u5E02'
                                },
                                {
                                    'id': '867',
                                    'text': '\u4E94\u6307\u5C71'
                                },
                                {
                                    'id': '868',
                                    'text': '\u4E07\u5B81'
                                }
                            ]
                        }
                    ]
                },
                {
                    'id': '85',
                    'text': '\u897F\u5357\u5730\u533A',
                    'children': [
                        {
                            'id': '4',
                            'text': '\u91CD\u5E86',
                            'children': [
                                {
                                    'id': '778',
                                    'text': '\u5DF4\u5357\u533A'
                                },
                                {
                                    'id': '779',
                                    'text': '\u5317\u789A\u533A'
                                },
                                {
                                    'id': '780',
                                    'text': '\u74A7\u5C71\u53BF'
                                },
                                {
                                    'id': '781',
                                    'text': '\u57CE\u53E3\u53BF'
                                },
                                {
                                    'id': '782',
                                    'text': '\u5927\u6E21\u53E3\u533A'
                                },
                                {
                                    'id': '783',
                                    'text': '\u5927\u8DB3\u53BF'
                                },
                                {
                                    'id': '784',
                                    'text': '\u57AB\u6C5F\u53BF'
                                },
                                {
                                    'id': '785',
                                    'text': '\u4E30\u90FD\u53BF'
                                },
                                {
                                    'id': '786',
                                    'text': '\u5949\u8282\u53BF'
                                },
                                {
                                    'id': '787',
                                    'text': '\u6DAA\u9675\u533A'
                                },
                                {
                                    'id': '788',
                                    'text': '\u5408\u5DDD\u533A'
                                },
                                {
                                    'id': '789',
                                    'text': '\u6C5F\u5317\u533A'
                                },
                                {
                                    'id': '790',
                                    'text': '\u6C5F\u6D25\u533A'
                                },
                                {
                                    'id': '791',
                                    'text': '\u4E5D\u9F99\u5761\u533A'
                                },
                                {
                                    'id': '792',
                                    'text': '\u5F00\u53BF'
                                },
                                {
                                    'id': '793',
                                    'text': '\u6881\u5E73\u53BF'
                                },
                                {
                                    'id': '794',
                                    'text': '\u5357\u5CB8\u533A'
                                },
                                {
                                    'id': '795',
                                    'text': '\u5357\u5DDD\u533A'
                                },
                                {
                                    'id': '796',
                                    'text': '\u5F6D\u6C34\u53BF'
                                },
                                {
                                    'id': '797',
                                    'text': '\u7DA6\u6C5F\u53BF'
                                },
                                {
                                    'id': '798',
                                    'text': '\u9ED4\u6C5F\u533A'
                                },
                                {
                                    'id': '799',
                                    'text': '\u8363\u660C\u53BF'
                                },
                                {
                                    'id': '800',
                                    'text': '\u6C99\u576A\u575D\u533A'
                                },
                                {
                                    'id': '801',
                                    'text': '\u77F3\u67F1\u53BF'
                                },
                                {
                                    'id': '802',
                                    'text': '\u53CC\u6865\u533A'
                                },
                                {
                                    'id': '803',
                                    'text': '\u94DC\u6881\u53BF'
                                },
                                {
                                    'id': '804',
                                    'text': '\u6F7C\u5357\u53BF'
                                },
                                {
                                    'id': '805',
                                    'text': '\u4E07\u76DB\u533A'
                                },
                                {
                                    'id': '806',
                                    'text': '\u4E07\u5DDE\u533A'
                                },
                                {
                                    'id': '807',
                                    'text': '\u5DEB\u5C71\u53BF'
                                },
                                {
                                    'id': '808',
                                    'text': '\u5DEB\u6EAA\u53BF'
                                },
                                {
                                    'id': '809',
                                    'text': '\u6B66\u9686\u53BF'
                                },
                                {
                                    'id': '810',
                                    'text': '\u79C0\u5C71\u53BF'
                                },
                                {
                                    'id': '811',
                                    'text': '\u6C38\u5DDD\u533A'
                                },
                                {
                                    'id': '812',
                                    'text': '\u9149\u9633\u53BF'
                                },
                                {
                                    'id': '813',
                                    'text': '\u6E1D\u5317\u533A'
                                },
                                {
                                    'id': '814',
                                    'text': '\u6E1D\u4E2D\u533A'
                                },
                                {
                                    'id': '815',
                                    'text': '\u4E91\u9633\u53BF'
                                },
                                {
                                    'id': '816',
                                    'text': '\u957F\u5BFF\u533A'
                                },
                                {
                                    'id': '817',
                                    'text': '\u5FE0\u53BF'
                                }
                            ]
                        },
                        {
                            'id': '13',
                            'text': '\u8D35\u5DDE',
                            'children': [
                                {
                                    'id': '204',
                                    'text': '\u5B89\u987A\u5E02'
                                },
                                {
                                    'id': '205',
                                    'text': '\u6BD5\u8282\u5E02'
                                },
                                {
                                    'id': '208',
                                    'text': '\u8D35\u9633\u5E02'
                                },
                                {
                                    'id': '210',
                                    'text': '\u516D\u76D8\u6C34\u5E02'
                                },
                                {
                                    'id': '211',
                                    'text': '\u9ED4\u4E1C\u5357\u82D7\u65CF\u4F97\u65CF\u81EA\u6CBB\u5DDE'
                                },
                                {
                                    'id': '212',
                                    'text': '\u9ED4\u5357\u5E03\u4F9D\u65CF\u82D7\u65CF\u81EA\u6CBB\u5DDE'
                                },
                                {
                                    'id': '213',
                                    'text': '\u9ED4\u897F\u5357\u5E03\u4F9D\u65CF\u82D7\u65CF\u81EA\u6CBB\u5DDE'
                                },
                                {
                                    'id': '215',
                                    'text': '\u94DC\u4EC1\u5E02'
                                },
                                {
                                    'id': '217',
                                    'text': '\u9075\u4E49\u5E02'
                                }
                            ]
                        },
                        {
                            'id': '30',
                            'text': '\u56DB\u5DDD',
                            'children': [
                                {
                                    'id': '516',
                                    'text': '\u963F\u575D\u85CF\u65CF\u7F8C\u65CF\u81EA\u6CBB\u5DDE'
                                },
                                {
                                    'id': '517',
                                    'text': '\u5DF4\u4E2D\u5E02'
                                },
                                {
                                    'id': '518',
                                    'text': '\u6210\u90FD\u5E02'
                                },
                                {
                                    'id': '519',
                                    'text': '\u8FBE\u5DDE\u5E02'
                                },
                                {
                                    'id': '520',
                                    'text': '\u5FB7\u9633\u5E02'
                                },
                                {
                                    'id': '523',
                                    'text': '\u7518\u5B5C\u85CF\u65CF\u81EA\u6CBB\u5DDE'
                                },
                                {
                                    'id': '524',
                                    'text': '\u5E7F\u5B89\u5E02'
                                },
                                {
                                    'id': '526',
                                    'text': '\u5E7F\u5143\u5E02'
                                },
                                {
                                    'id': '528',
                                    'text': '\u4E50\u5C71\u5E02'
                                },
                                {
                                    'id': '529',
                                    'text': '\u51C9\u5C71\u5F5D\u65CF\u81EA\u6CBB\u5DDE'
                                },
                                {
                                    'id': '530',
                                    'text': '\u6CF8\u5DDE\u5E02'
                                },
                                {
                                    'id': '531',
                                    'text': '\u7709\u5C71\u5E02'
                                },
                                {
                                    'id': '532',
                                    'text': '\u7EF5\u9633\u5E02'
                                },
                                {
                                    'id': '534',
                                    'text': '\u5357\u5145\u5E02'
                                },
                                {
                                    'id': '535',
                                    'text': '\u5185\u6C5F\u5E02'
                                },
                                {
                                    'id': '536',
                                    'text': '\u6500\u679D\u82B1\u5E02'
                                },
                                {
                                    'id': '538',
                                    'text': '\u9042\u5B81\u5E02'
                                },
                                {
                                    'id': '540',
                                    'text': '\u96C5\u5B89\u5E02'
                                },
                                {
                                    'id': '541',
                                    'text': '\u5B9C\u5BBE\u5E02'
                                },
                                {
                                    'id': '542',
                                    'text': '\u8D44\u9633\u5E02'
                                },
                                {
                                    'id': '543',
                                    'text': '\u81EA\u8D21\u5E02'
                                }
                            ]
                        },
                        {
                            'id': '31',
                            'text': '\u897F\u85CF',
                            'children': [
                                {
                                    'id': '546',
                                    'text': '\u62C9\u8428\u5E02'
                                },
                                {
                                    'id': '547',
                                    'text': '\u6797\u829D\u5730\u533A'
                                },
                                {
                                    'id': '548',
                                    'text': '\u90A3\u66F2\u5730\u533A'
                                },
                                {
                                    'id': '549',
                                    'text': '\u65E5\u5580\u5219\u5730\u533A'
                                }
                            ]
                        },
                        {
                            'id': '33',
                            'text': '\u4E91\u5357',
                            'children': [
                                {
                                    'id': '578',
                                    'text': '\u4FDD\u5C71\u5E02'
                                },
                                {
                                    'id': '579',
                                    'text': '\u695A\u96C4\u5E02'
                                },
                                {
                                    'id': '580',
                                    'text': '\u5927\u7406\u5E02'
                                },
                                {
                                    'id': '581',
                                    'text': '\u5FB7\u5B8F\u50A3\u65CF\u666F\u9887\u65CF\u81EA\u6CBB\u5DDE'
                                },
                                {
                                    'id': '585',
                                    'text': '\u7EA2\u6CB3\u54C8\u5C3C\u65CF\u5F5D\u65CF\u81EA\u6CBB\u5DDE'
                                },
                                {
                                    'id': '587',
                                    'text': '\u6606\u660E\u5E02'
                                },
                                {
                                    'id': '589',
                                    'text': '\u4E3D\u6C5F\u5E02'
                                },
                                {
                                    'id': '590',
                                    'text': '\u4E34\u6CA7\u5E02'
                                },
                                {
                                    'id': '593',
                                    'text': '\u666E\u6D31\u5E02'
                                },
                                {
                                    'id': '594',
                                    'text': '\u66F2\u9756\u5E02'
                                },
                                {
                                    'id': '595',
                                    'text': '\u6587\u5C71\u5E02'
                                },
                                {
                                    'id': '597',
                                    'text': '\u7389\u6EAA\u5E02'
                                },
                                {
                                    'id': '598',
                                    'text': '\u662D\u901A\u5E02'
                                }
                            ]
                        }
                    ]
                },
                {
                    'id': '86',
                    'text': '\u897F\u5317\u5730\u533A',
                    'children': [
                        {
                            'id': '10',
                            'text': '\u7518\u8083',
                            'children': [
                                {
                                    'id': '139',
                                    'text': '\u767D\u94F6\u5E02'
                                },
                                {
                                    'id': '140',
                                    'text': '\u5B9A\u897F\u5E02'
                                },
                                {
                                    'id': '144',
                                    'text': '\u5609\u5CEA\u5173\u5E02'
                                },
                                {
                                    'id': '145',
                                    'text': '\u91D1\u660C\u5E02'
                                },
                                {
                                    'id': '146',
                                    'text': '\u9152\u6CC9\u5E02'
                                },
                                {
                                    'id': '147',
                                    'text': '\u5170\u5DDE\u5E02'
                                },
                                {
                                    'id': '148',
                                    'text': '\u4E34\u590F\u56DE\u65CF\u81EA\u6CBB\u5DDE'
                                },
                                {
                                    'id': '150',
                                    'text': '\u9647\u5357\u5E02'
                                },
                                {
                                    'id': '151',
                                    'text': '\u5E73\u51C9\u5E02'
                                },
                                {
                                    'id': '152',
                                    'text': '\u5E86\u9633\u5E02'
                                },
                                {
                                    'id': '153',
                                    'text': '\u5929\u6C34\u5E02'
                                },
                                {
                                    'id': '154',
                                    'text': '\u6B66\u5A01\u5E02'
                                },
                                {
                                    'id': '156',
                                    'text': '\u5F20\u6396\u5E02'
                                }
                            ]
                        },
                        {
                            'id': '25',
                            'text': '\u5B81\u590F',
                            'children': [
                                {
                                    'id': '446',
                                    'text': '\u56FA\u539F\u5E02'
                                },
                                {
                                    'id': '447',
                                    'text': '\u77F3\u5634\u5C71\u5E02'
                                },
                                {
                                    'id': '448',
                                    'text': '\u5434\u5FE0\u5E02'
                                },
                                {
                                    'id': '449',
                                    'text': '\u94F6\u5DDD\u5E02'
                                },
                                {
                                    'id': '450',
                                    'text': '\u4E2D\u536B\u5E02'
                                }
                            ]
                        },
                        {
                            'id': '26',
                            'text': '\u9752\u6D77',
                            'children': [
                                {
                                    'id': '454',
                                    'text': '\u6D77\u4E1C\u5730\u533A'
                                },
                                {
                                    'id': '456',
                                    'text': '\u6D77\u897F\u8499\u53E4\u65CF\u85CF\u65CF\u81EA\u6CBB\u5DDE'
                                },
                                {
                                    'id': '458',
                                    'text': '\u897F\u5B81\u5E02'
                                },
                                {
                                    'id': '459',
                                    'text': '\u7389\u6811\u85CF\u65CF\u81EA\u6CBB\u5DDE'
                                }
                            ]
                        },
                        {
                            'id': '29',
                            'text': '\u9655\u897F',
                            'children': [
                                {
                                    'id': '503',
                                    'text': '\u5B89\u5EB7\u5E02'
                                },
                                {
                                    'id': '504',
                                    'text': '\u5B9D\u9E21\u5E02'
                                },
                                {
                                    'id': '506',
                                    'text': '\u6C49\u4E2D\u5E02'
                                },
                                {
                                    'id': '508',
                                    'text': '\u5546\u6D1B\u5E02'
                                },
                                {
                                    'id': '509',
                                    'text': '\u94DC\u5DDD\u5E02'
                                },
                                {
                                    'id': '510',
                                    'text': '\u6E2D\u5357\u5E02'
                                },
                                {
                                    'id': '511',
                                    'text': '\u897F\u5B89\u5E02'
                                },
                                {
                                    'id': '512',
                                    'text': '\u54B8\u9633\u5E02'
                                },
                                {
                                    'id': '513',
                                    'text': '\u5EF6\u5B89\u5E02'
                                },
                                {
                                    'id': '515',
                                    'text': '\u6986\u6797\u5E02'
                                }
                            ]
                        },
                        {
                            'id': '32',
                            'text': '\u65B0\u7586',
                            'children': [
                                {
                                    'id': '551',
                                    'text': '\u963F\u514B\u82CF\u5730\u533A'
                                },
                                {
                                    'id': '554',
                                    'text': '\u963F\u52D2\u6CF0\u5E02'
                                },
                                {
                                    'id': '556',
                                    'text': '\u5DF4\u97F3\u90ED\u695E\u8499\u53E4\u81EA\u6CBB\u5DDE'
                                },
                                {
                                    'id': '557',
                                    'text': '\u535A\u5C14\u5854\u62C9\u8499\u53E4\u81EA\u6CBB\u5DDE'
                                },
                                {
                                    'id': '560',
                                    'text': '\u660C\u5409\u56DE\u65CF\u81EA\u6CBB\u5DDE'
                                },
                                {
                                    'id': '563',
                                    'text': '\u54C8\u5BC6\u5E02'
                                },
                                {
                                    'id': '564',
                                    'text': '\u548C\u7530\u5E02'
                                },
                                {
                                    'id': '565',
                                    'text': '\u5580\u4EC0\u5E02'
                                },
                                {
                                    'id': '566',
                                    'text': '\u514B\u62C9\u739B\u4F9D\u5E02'
                                },
                                {
                                    'id': '570',
                                    'text': '\u77F3\u6CB3\u5B50\u5E02'
                                },
                                {
                                    'id': '571',
                                    'text': '\u5854\u57CE\u5E02'
                                },
                                {
                                    'id': '572',
                                    'text': '\u5410\u9C81\u756A\u5E02'
                                },
                                {
                                    'id': '573',
                                    'text': '\u4E4C\u9C81\u6728\u9F50\u5E02'
                                },
                                {
                                    'id': '576',
                                    'text': '\u4F0A\u7281\u5E02'
                                },
                                {
                                    'id': '869',
                                    'text': '\u514B\u5B5C\u52D2\u82CF\u67EF\u5C14\u514B\u5B5C'
                                },
                                {
                                    'id': '870',
                                    'text': '\u4E94\u5BB6\u6E20'
                                }
                            ]
                        }
                    ]
                },
                {
                    'id': '87',
                    'text': '\u6E2F\u6FB3\u53F0',
                    'children': [
                        {
                            'id': '5',
                            'text': '\u6FB3\u95E8'
                        },
                        {
                            'id': '6',
                            'text': '\u9999\u6E2F'
                        },
                        {
                            'id': '7',
                            'text': '\u53F0\u6E7E'
                        }
                    ]
                }
            ]
        },
        {
            'id': '999',
            'text': '\u56FD\u5916'
        },
        {
            'id': '0',
            'text': '\u5176\u4ED6'
        }
    ];
    lib.inherits(Region, InputControl);
    ui.register(Region);
    return Region;
});