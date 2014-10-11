list
=======

**ESF-MS** 提供了系统列表功能页面的样式支持。


列表头部
-----

### class name

+ `list-header`: 作用于列表头容器元素。通常为 *div*。


### less variable

+ `@sys-list-header-background`: #e5eafa;
+ `@sys-list-header-margin`: 0;
+ `@sys-list-header-padding`: 10px;
+ `@sys-list-header-border-width`: 1px;
+ `@sys-list-header-border-style`: solid;
+ `@sys-list-header-border-color`: #ddd;


列表普适功能块
-----

### class name

+ `list-functional-block`: 作用于普适功能块容器元素。通常为 *div*。


### less variable

+ `@sys-list-functional-block-background`: false;
+ `@sys-list-functional-block-padding`: 10px;
+ `@sys-list-functional-block-margin`: 0;
+ `@sys-list-functional-block-border-width`: 0 1px 1px;
+ `@sys-list-functional-block-border-style`: solid;
+ `@sys-list-functional-block-border-color`: #ddd;


数据概况汇总
--------

数据概况项通常位于普适功能块内。

### class name

+ `list-summary`: 作用于数据概况容器元素。必须为 *ul*。
+ `list-summary-item-info`: 作用于数据概况项信息元素。通常为 *strong*、*span*等。
+ `list-summary-item-title`: 作用于数据概况项标题元素。通常为 *span*等。


### less variable

#### 数据概况容器相关

+ `@sys-list-summary-float`: right; 数据概况容器浮动方向。
+ `@sys-list-summary-margin`: 0; 数据概况容器外边距。
+ `@sys-list-summary-padding`: 0; 数据概况容器内边距。
+ `@sys-list-summary-border-width`: 0; 数据概况容器边框宽度。
+ `@sys-list-summary-border-color`: #e8e8e8; 数据概况容器边框颜色。
+ `@sys-list-summary-border-style`: solid; 数据概况容器边框样式。

#### 数据概况项相关

+ `@sys-list-summary-item-float`: left; 数据概况项浮动方向。
+ `@sys-list-summary-item-width`: 80px; 数据概况项宽度。自适应宽度则设置为false。
+ `@sys-list-summary-item-title-color`: #999; 数据概况项标题文字颜色。
+ `@sys-list-summary-item-info-color`: #333; 数据概况项信息文字颜色。
+ `@sys-list-summary-item-info-font-size`: 18px; 数据概况项信息文字大小。


日期区间筛选
--------

日期区间筛选需要使用 [ESUI](https://github.com/ecomfe/esui) 的RangeCalendar控件。
日期区间筛选通常位于普适功能块内，与数据概况区域呈现一左一右排列。
日期区间筛选控件的样式需要通过ESUI的样式规则定制。

### class name

+ `list-date-range`: 作用于日期区间筛选区域容器元素。必须为 *div*。


### less variable

+ `@sys-list-date-range-float`: left; 日期区间筛选容器浮动方向。
+ `@sys-list-date-range-margin`: 0; 日期区间筛选容器外边距。
+ `@sys-list-date-range-padding`: 0; 日期区间筛选容器内边距。

列表导航
----

列表导航功能需要使用 [ESUI](https://github.com/ecomfe/esui) 的Tab控件。

### class name

+ `list-functional-tab`: 作用于列表导航区容器元素。通常为 *div*。


### less variable

#### 导航区容器相关

+ `@sys-list-functional-tab-margin`: 10px 0 0 0; 列表导航区外边距。
+ `@sys-list-functional-tab-padding`: 0; 列表导航区内边距。
+ `@sys-list-functional-tab-border-width`: 0 0 1px; 列表导航区边框宽度。
+ `@sys-list-functional-tab-border-color`: #ddd; 列表导航区边框颜色。
+ `@sys-list-functional-tab-border-style`: solid; 列表导航区边框样式。

#### 导航项相关

+ `@sys-list-tab-item-height`: 28px; 导航项高度。
+ `@sys-list-tab-item-font-size`: 14px; 导航项文字大小。
+ `@sys-list-tab-item-color`: #636F88; 导航项文字颜色。
+ `@sys-list-tab-item-color-active`: #333; 导航项active状态时的文字颜色。
+ `@sys-list-tab-item-padding`: 0 12px; 导航项内边距。
+ `@sys-list-tab-item-margin`: 0 6px 0 0; 导航项外边距。
+ `@sys-list-tab-item-has-border`: true; 导航项是否有边框，此处只允许1像素边框。
+ `@sys-list-tab-item-border-color`: #ced9e8; 导航项边框颜色。
+ `@sys-list-tab-item-border-color-active`: #ddd; 导航项active状态时边框颜色。
+ `@sys-list-tab-item-border-radius`: 5px 5px 0 0; 导航项边缘圆角弧度。
+ `@sys-list-tab-item-bg-gradient`: true; 导航项背景是否渐变，非渐变时背景色为top和bottom颜色的average。
+ `@sys-list-tab-item-bg-top-color`: #f2f6ff; 导航项渐变背景色起始。
+ `@sys-list-tab-item-bg-bottom-color`: #eaf1f9; 导航项渐变背景色终止。
+ `@sys-list-tab-item-bg-top-color-active`: #f9f9f9; 导航项active状态时渐变背景色起始。
+ `@sys-list-tab-item-bg-bottom-color-active`: #f9f9f9; 导航项active状态时渐变背景色终止。
+ `@sys-list-tab-item-active-sink`: true; active状态的导航项是否下沉，背景融入下层元素。


列表操作区
----

### class name

+ `list-operator`: 作用于列表操作区容器元素。通常为 *div*。


### less variable

+ `@sys-list-operator-margin`: 0; 列表操作区外边距。
+ `@sys-list-operator-padding`: 10px 8px; 列表操作区内边距。
+ `@sys-list-operator-border-width`: 0 1px; 列表操作区边框宽度。
+ `@sys-list-operator-border-color`: #ddd; 列表操作区边框颜色。
+ `@sys-list-operator-border-style`: solid; 列表操作区边框样式。
+ `@sys-list-operator-background`: #f9f9f9; 列表操作区背景颜色。
+ `@sys-list-operator-gap`: 3px; 列表操作区操作控件之间的间隔宽度。


表格
----

表格功能需要使用 [ESUI](https://github.com/ecomfe/esui) 的Table控件。 **ESF-MS** 不为表格样式做过多的抽象，有较高定制需求请参考ESUI的样式规则定制。

### less variable

+ `@sys-list-table-border-color`: #ddd; 表格边框颜色。
+ `@sys-list-table-head-background`: #f9f9f9; 表格标头的背景颜色。



页信息区域
----

页信息需要使用 [ESUI](https://github.com/ecomfe/esui) 的Pager控件。 **ESF-MS** 不为页信息区域的样式做过多的抽象，有较高定制需求请参考ESUI的样式规则定制。

+ `@sys-list-page-info-margin`: 0; 页信息条外边距。
+ `@sys-list-page-info-padding`: 5px; 页信息条内边距。
+ `@sys-list-page-info-border-width`: 0 1px 1px; 页信息条边框宽度。
+ `@sys-list-page-info-border-color`: #ddd; 页信息条边框颜色。
+ `@sys-list-page-info-border-style`: solid; 页信息条边框样式。
+ `@sys-list-page-info-background`: #f9f9f9; 页信息条背景颜色。


列表HTML示例
-------


```html
<div class="list-header">
    header content and controls
</div>

<div class="list-functional-block">
    <div class="list-date-range"><input data-ui="id:ListDateRange;type:RangeCalendar" ></div>
    <ul class="list-summary">
        <li>
            <strong class="list-summary-item-info">${total.show}</strong>
            <span class="list-summary-item-title">展现</span>
        </li>
        <li>
            <strong class="list-summary-item-info">${total.click}</strong>
            <span class="list-summary-item-title">点击</span>
        </li>
        <li>同上...</li>
    </ul>
</div>

<div class="list-functional-tab" data-ui-type="Tab" data-ui-id="ListTab"></div>

<div class="list-operator">
    <div data-ui="type:Button;id:OpenCreateDialog;skin:winter">新建</div>
    <div data-ui="type:Button;id:OpenBudgetDialog">修改预算</div>
    <div data-ui="type:CommandMenu;id:PlanToggle"></div>
    <div data-ui="type:Button;id:PlanDelete">删除</div>
</div>

<div class="list-table" data-ui="type:Table;id:ListTable" data-ui-extension-command-type="Command" data-ui-extension-tableedit-type="TableEdit"></div>

<div data-ui="type:Pager;id:ListPager;skin:table-pager"></div>
```
