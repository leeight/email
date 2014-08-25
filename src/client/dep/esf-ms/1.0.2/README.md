ESF-MS
==============

**ESF-MS** (Enterprise Styling Framework for Manage System) 是基于 `管理端业务系统特点` 抽象的 `样式与布局框架`，依赖于 [LESS](http://github.com/cloudhead/less.js) 与 [EST](https://github.com/ecomfe/est)，部分页面部件（如侧边栏、按钮、表格）需要依赖于 [ESUI](https://github.com/ecomfe/esui)。

**ESF-MS** 的抽象包括常用部件的 `className`，相应的`html结构`，常变更样式点的`variable`。


使用
------

要使用 **ESF-MS** ，需要将 **EST** 和 **ESF-MS** 导入，在项目中建立自己的 `LESS` 文件，在该文件中import **EST** 和 **ESF-MS** 。

```css
@import "../../dep/est/1.0.0/src/all.less";
@import "../../dep/esf-ms/1.0.0/src/main.less";
```


文档
------

下面的文档详细说明了 **ESF-MS** 对管理端页面部件的支持：

- [页面](doc/page.md)
- [页头](doc/header.md)
- [列表](doc/list.md)
- [表单](doc/form.md)
- [版权](doc/copyright.md)


额外定义样式
------

**ESF-MS** 内置了一套标准的管理端系统样式，但很可能与您当前正在开发的系统的UE设计不完全契合。下面从几个方面给出额外定义样式的指导：


### 整体样式

如果是系统整体样式的差异，并且差异点 **ESF-MS** 已经进行了抽象，则可以通过定义less variable的方式设置。

```css
@import "../../dep/est/1.0.0/src/all.less";
@import "../../dep/esf-ms/1.0.0/src/main.less";

@sys-fieldset-title-font-size: 15px;
@sys-fieldset-title-font-family: STHeiti, 'Microsoft YaHei', SimHei;
@sys-fieldset-title-font-bold: true;
@sys-fieldset-title-color: #666;
@sys-field-label-color: #666;
@sys-field-line-height: 15px;
@sys-field-label-line-height: 30px;
@sys-field-margin: 0 0 5px;
```

如果是系统整体样式的差异，但是 **ESF-MS** 没有将该差异抽象成less variable，则通过额外编写css rule的方式额外定义。

```css
@import "../../dep/est/1.0.0/src/all.less";
@import "../../dep/esf-ms/1.0.0/src/main.less";

.field-label {
    font-weight: bold;
}
```

### 特殊业务样式

有时候，我们系统中大部分相似功能的样式都是相同的，但是有那么几处地方与其他地方不一样。这时候，定义这些特殊业务样式，我们需要从业务维度出发，创造新的class name，利用css优先级的规则，对整体样式进行覆盖。

下面是对列表的普适功能块样式扩展的一个例子：

##### html

```html
<div class="list-functional-block"></div>
<div class="list-functional-block biz-name"></div>
```

##### less

```css
@import "../../dep/est/1.0.0/src/all.less";
@import "../../dep/esf-ms/1.0.0/src/main.less";

.biz-name {
    background: red;
}
```


展示：一个典型的管理端系统
------

![Manage System](https://raw.github.com/ecomfe/esf-ms/master/doc/sys.png)


例子：一个典型的管理端系统HTML结构
------

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>title</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <link rel="stylesheet" href="src/common/css/main.less" />

    <script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-4-2/esl.js"></script>
</head>
<body>
    <!--[if IE 6]>
    <div class="layout-ie6-out"><div class="layout-ie6-in">
    <![endif]-->

    <div class="header">
        <a class="logo" href="#" target="_blank"><img alt="" title="" src="src/img/logo.png" width="98" height="32"></a>
        <ul class="nav">
            <li class="nav-current"><a href="#">首页</a></li>
            <li><a href="#">导航1</a></li>
            <li><a href="#">导航2</a></li>
        </ul>
        <div class="user-info">
            <a class="user-name"></a>
            <a href="/user/logout">退出</a>
        </div>
    </div>

    <div>
        <div data-ui-type="Sidebar" data-ui-id="accountSidebar">
            <div>侧边栏header标题文字</div>
            <div>
                 <div data-ui-type="Tree" data-ui-id="accountTree"></div>
            </div>
        </div>
        <div class="main-area" id="main-area">
            <div id="main"></div>
            <div class="copyright">©2013 Baidu</div>
        </div>
    </div>
    <!--[if IE 6]></div></div><![endif]-->

    <script>
    require.config( { ...... } );
    require( [ 'common/main' ] , function ( main ) {
        main.init();
    });
    </script>
</body>
</html>
```


