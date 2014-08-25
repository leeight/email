form
=======

**ESF-MS** 提供了系统表单功能页面的样式支持。

表单集
-----

### class name

+ `fieldset`: 作用于表单集容器元素。通常为 *div*，为兼容性考虑，不推荐 *fieldset*。
+ `fieldset-title`: 作用于表单集标题元素。通常为 *div*、*h3*、*h4*，为兼容性考虑，不推荐 *legend*。


### less variable

#### 表单集容器相关

+ `@sys-fieldset-margin`: 10px; 表单集容器外边距。
+ `@sys-fieldset-padding`: 1px 1px 10px; 表单集容器内边距。
+ `@sys-fieldset-border-width`: 0 0 1px; 表单集容器边框宽度。
+ `@sys-fieldset-border-color`: #ddd; 表单集容器边框颜色。
+ `@sys-fieldset-border-style`: solid; 表单集容器边框样式。
+ `@sys-fieldset-background`: false; 表单集容器背景颜色。

#### 表单集标题相关

+ `@sys-fieldset-title-margin`: 0 0 15px; 表单集标题外边距。
+ `@sys-fieldset-title-padding`: 0; 表单集标题内边距。
+ `@sys-fieldset-title-border-width`: 0; 表单集标题边框宽度。
+ `@sys-fieldset-title-border-color`: #ddd; 表单集标题边框颜色。
+ `@sys-fieldset-title-border-style`: solid; 表单集标题边框样式。
+ `@sys-fieldset-title-background`: false; 表单集标题背景颜色。
+ `@sys-fieldset-title-height`: 30px; 表单集标题高度。
+ `@sys-fieldset-title-font-size`: 14px; 表单集标题文字大小。
+ `@sys-fieldset-title-font-bold`: true; 表单集标题文字是否加粗。
+ `@sys-fieldset-title-font-family`: false; 表单集标题字体。
+ `@sys-fieldset-title-color`: #000; 表单集标题文字颜色。

表单行
-----

表单行容器内通常由`lable.field-lable`和`div.field`两个元素组成，水平排列。不使用表单行容器元素可令`lable.field-lable`和`div.field`垂直排列。

预制3种样式`large`、`medium`、`small`，用于控制表单行中`lable.field-lable`的宽度对齐。

### class name

+ `field-row`: 作用于表单行容器元素。通常为 *div*。
+ `field-row-large-label`:  作用于表单行容器元素。不可替代`field-row`，应并存。
+ `field-row-medium-label`:  作用于表单行容器元素。不可替代`field-row`，应并存。
+ `field-row-small-label`:  作用于表单行容器元素。不可替代`field-row`，应并存。

### less variable

+ `@sys-field-row-margin`: 0 10px 0 0; 表单行容器外边距。
+ `@sys-field-row-padding`: 0 0 10px; 表单行容器内边距。
+ `@sys-field-row-border-width`: 0; 表单行容器边框宽度。
+ `@sys-field-row-border-color`: #ddd; 表单行容器边框颜色。
+ `@sys-field-row-border-style`: solid; 表单行容器边框样式。
+ `@sys-field-row-background`: false; 表单行容器背景颜色。
+ `@sys-field-row-large-label-width`: 120px; large label形式的表单行label宽度。
+ `@sys-field-row-medium-label-width`: 80px; medium label形式的表单行label宽度。
+ `@sys-field-row-small-label-width`: 60px; small label形式的表单行label宽度。

表单项Label
-----

表单项Label通常用于对表单项的说明与关联。

### class name

+ `field-label`: 作用于表单项Label元素。通常为 *label*。

### less variable

+ `@sys-field-label-margin`: 0; 表单项Label外边距。
+ `@sys-field-label-padding`: 0 5px; 表单项Label内边距。
+ `@sys-field-label-border-width`: 0; 表单项Label边框宽度。
+ `@sys-field-label-border-color`: #ddd; 表单项Label边框颜色。
+ `@sys-field-label-border-style`: solid; 表单项Label边框样式。
+ `@sys-field-label-background`: false; 表单项Label背景颜色。
+ `@sys-field-label-text-align`: left; 表单项Label文字对齐方式。
+ `@sys-field-label-line-height`: 30px; 表单项Label文字行高。
+ `@sys-field-label-color`: false; 表单项Label文字颜色。
+ `@sys-field-label-width`: false; 表单项Label宽度。

表单项必选标识
-----

表单项必选标识通常为位于表单项Label内红色的\*号。


### class name

+ `field-required`: 作用于表单项必选标识元素。通常为 *span*，位于表单项Label元素内。

### less variable

+ `@sys-field-required-margin`: 0; 表单项必选标识外边距。
+ `@sys-field-required-padding`: 0 0 0 5px; 表单项必选标识内边距。
+ `@sys-field-required-border-width`: 0; 表单项必选标识边框宽度。
+ `@sys-field-required-border-color`: #ddd; 表单项必选标识边框颜色。
+ `@sys-field-required-border-style`: solid; 表单项必选标识边框样式。
+ `@sys-field-required-background`: false; 表单项必选标识背景颜色。
+ `@sys-field-required-color`: red; 表单项必选标识文字颜色。
+ `@sys-field-required-width`: false; 表单项必选标识宽度。

表单项提示
-----

表单项提示通常为位于表单项输入元素后。


### class name

+ `field-hint`: 作用于表单项提示元素。通常为 *span*，位于输入元素或控件后。


### less variable

+ `@sys-field-hint-margin`: 0; 表单项提示元素外边距。
+ `@sys-field-hint-padding`: 0 0 0 5px; 表单项提示元素内边距。
+ `@sys-field-hint-border-width`: 0; 表单项提示元素边框宽度。
+ `@sys-field-hint-border-color`: #ddd; 表单项提示元素边框颜色。
+ `@sys-field-hint-border-style`: solid; 表单项提示元素边框样式。
+ `@sys-field-hint-background`: false; 表单项提示元素背景颜色。
+ `@sys-field-hint-color`: #999; 表单项提示元素文字颜色。
+ `@sys-field-hint-width`: false; 表单项提示元素宽度。
+ `@sys-field-hint-block`: false; 表单项提示元素是否为block。可控制其紧跟输入元素或换行。

表单区域
-----

表单区域通常作为表单输入框或输入控件的容器元素。

### class name

+ `field`: 作用于表单区域元素。通常为 *div*。

### less variable

+ `@sys-field-line-height`: 30px; 表单区域行高。
+ `@sys-field-margin`: 0 0 10px; 表单区域外边距。
+ `@sys-field-padding`: 0 5px; 表单区域内边距。
+ `@sys-field-border-width`: 0; 表单区域边框宽度。
+ `@sys-field-border-color`: #ddd; 表单区域边框颜色。
+ `@sys-field-border-style`: solid; 表单区域边框样式。
+ `@sys-field-background`: false; 表单区域背景颜色。

操作区域
-----

操作区域通常作为提交、取消等button的容器。

### class name

+ `form-operator`: 作用于操作区域元素。通常为 *div*。

### less variable

+ `@sys-form-operator-margin`: 0; 操作区域外边距。
+ `@sys-form-operator-padding`: 10px; 操作区域内边距。
+ `@sys-form-operator-border-width`: 0; 操作区域边框宽度。
+ `@sys-form-operator-border-color`: #ddd; 操作区域边框颜色。
+ `@sys-form-operator-border-style`: solid; 操作区域边框样式。
+ `@sys-form-operator-background`: false; 操作区域背景颜色。
+ `@sys-form-operator-gap`: 3px; 操作区域button之间的间隔。

Button皮肤
-----

**ESF-MS** 内置了`major`和`minor`两种Button皮肤，需要 *突出* 或 *弱化* 的按钮可以使用。使用该内置皮肤需要使用 [ESUI](https://github.com/ecomfe/esui) 的Button控件。

### less variable

#### major

+ `@sys-major-button-margin`: 0; major button外边距。
+ `@sys-major-button-padding`: 0; major button内边距。
+ `@sys-major-button-border-width`: 1px; major button边框宽度。
+ `@sys-major-button-border-color`: #2f52b7; major button边框颜色。
+ `@sys-major-button-border-color-disabled`: #cfcfcf; major button disabled时的边框颜色。
+ `@sys-major-button-border-style`: solid; major button边框样式。
+ `@sys-major-button-bg-gradient`: true; major button背景是否渐变，非渐变时背景色为top和bottom颜色的average。
+ `@sys-major-button-bg-top-color`: #648bdc; major button渐变背景色起始。
+ `@sys-major-button-bg-bottom-color`: #5276c2; major button渐变背景色终止。
+ `@sys-major-button-bg-top-color-hover`: #5984dd; major button hover时渐变背景色起始。
+ `@sys-major-button-bg-bottom-color-hover`: #476ebf; major button hover时渐变背景色终止。
+ `@sys-major-button-bg-top-color-active`: #5276c2; major button active时渐变背景色起始。
+ `@sys-major-button-bg-bottom-color-active`: #648bdc; major button active时渐变背景色终止。
+ `@sys-major-button-bg-top-color-disabled`: #f6f6f6; major button disabled时渐变背景色起始。
+ `@sys-major-button-bg-bottom-color-disabled`: #f6f6f6; major button disabled时渐变背景色终止。
+ `@sys-major-button-color`: #fff; major button文字颜色。
+ `@sys-major-button-color-disabled`: #999; major button disabled时文字颜色。

#### minor

+ `@sys-minor-button-margin`: 0; minor button外边距。
+ `@sys-minor-button-padding`: 1px; minor button内边距。
+ `@sys-minor-button-border-width`: 0; minor button边框宽度。
+ `@sys-minor-button-border-color`: #2f52b7; minor button边框颜色。
+ `@sys-minor-button-border-style`: solid; minor button边框样式。
+ `@sys-minor-button-color`: #555; minor button文字颜色。
+ `@sys-minor-button-color-hover`: #222; minor button hover时文字颜色。
+ `@sys-minor-button-color-active`: #333; minor button active时文字颜色。
+ `@sys-minor-button-color-disabled`: #999; minor button disabled时文字颜色。
+ `@sys-minor-button-color-underline`: true; minor button文字是否带下划线。

表单HTML示例
-------

### 简单的整体示例

```html
<div class="field-row">
    <label class="field-label">名称:</label>
    <div class="field"><input /></div>
</div>

<div class="field-row">
    <label class="field-label">投放地域:</label>
    <div class="field">
        <input type="radio" checked="checked" title="不限" id="id1" />
        <label for="id1">不限</label>
        <input type="radio" title="选择地域" value="0" id="id2"  />
        <label for="id2">选择地域</label>
    </div>
</div>

<div class="form-operator">
    <div data-ui="type:Button;skin:major">OK</div>
    <div data-ui="type:Button;skin:minor">cancel</div>
</div>
```

### 使用fieldset对表单进行归类

```html
<div class="fieldset">
    <div class="fieldset-title">基本信息</div>

    <div class="field-row">
        <label class="field-label">名称:</label>
        <div class="field"><input /></div>
    </div>

    <div class="field-row">
        <label class="field-label">投放地域:</label>
        <div class="field">
            <input type="radio" checked="checked" title="不限" id="id1" />
            <label for="id1">不限</label>
            <input type="radio" title="选择地域" value="0" id="id2"  />
            <label for="id2">选择地域</label>
        </div>
    </div>
</div>
```

### 让表单label和输入元素垂直排列

```html
<div class="fieldset">
    <div class="fieldset-title">基本信息</div>

    <label class="field-label">名称:</label>
    <div class="field"><input /></div>

    <label class="field-label">投放地域:</label>
    <div class="field">
        <input type="radio" checked="checked" title="不限" id="id1" />
        <label for="id1">不限</label>
        <input type="radio" title="选择地域" value="0" id="id2"  />
        <label for="id2">选择地域</label>
    </div>
</div>
```
