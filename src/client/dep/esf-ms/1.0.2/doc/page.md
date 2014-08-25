page
========

**ESF-MS** 提供了页面主体的样式支持。

reset
------

**ESF-MS** 默认调用了 **EST** 的`global-reset`，对页面样式进行reset。

整体
----

### less variable

+ `@sys-font-size`: 12px; 文本宽度。
+ `@sys-font-family`: Arial,Helvetica,STHeiti,SimSun,sans-serif; 字体。
+ `@sys-text-color`: #333; 文字颜色。
+ `@sys-min-width`: 1004px; 页面最小宽度，不需要限制时设置为false。

### 页面最小宽度

如果设置了页面最小宽度`@sys-min-width`，需要如下的html结构，以保证IE6的兼容性。


```html
<body>
<!--[if IE 6]><div class="layout-ie6-out"><div class="layout-ie6-in"><![endif]-->
<div class="header">......</div>
<div class="main-area">......</div>
<!--[if IE 6]></div></div><![endif]-->
</body>
```


header
------

页面header部分的支持请参考文档 [页头](header.md)


主体与侧边栏
------

### class name

+ `main-area`: 作用于页面主区域。
+ `main-area-sidebar-neighbor`: 当侧边栏存在并展开时，作用于页面主区域。不可替代`main-area`，应并存。
+ `main-area-sidebar-neighbor-hide`: 当侧边栏存在并收起时，作用于页面主区域。不可替代`main-area`，应并存。

### less variable

+ `@sys-mainarea-margin`: 10px 10px 0 0; 页面主区域与浏览器边缘的距离。
+ `@sys-has-sidebar`: true; 是否存在侧边栏。
+ `@sys-sidebar-header-bg-gradient`: true; 侧边栏头部背景是否渐变，非渐变时背景色为top和bottom颜色的average。
+ `@sys-sidebar-header-bg-top-color`: #fff; 侧边栏头部渐变背景色起始。
+ `@sys-sidebar-header-bg-bottom-color`: #ebebeb; 侧边栏头部渐变背景色中止。
+ `@sys-sidebar-header-font-size`: false; 侧边栏头部文字大小。
+ `@sys-sidebar-header-line-height`: false; 侧边栏头部文字行高。
+ `@sys-sidebar-header-color`: false; 侧边栏头部文字颜色。
+ `@sys-sidebar-header-padding-left`: 8px; 侧边栏头部文字距离左边框的宽度。


### 侧边栏说明

如果系统需要支持 *侧边栏* ，除了设置`@sys-has-sidebar`为true外，系统开发者还需要引入 [ESUI](https://github.com/ecomfe/esui) 的Sidebar控件，在Javascript中初始化控件，并监听`onmodechange`，为页面主区域绑定className。

下面是关于使用或者不使用侧边栏的一些代码示例：


#### 不使用侧边栏的HTML主体结构

```html
<div class="main-area">
    <div id="main"></div>
    <div class="copyright">©2013 Baidu</div>
</div>
```

#### 使用侧边栏的HTML主体结构

```html
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
```


#### 为侧边栏的显示模式切换绑定事件，控制主区域的className

```javascript
var NEIGHBOR_ID             = 'main-area';
var NEIGHBOR_CLASS          = 'main-area';
var NEIGHBOR_FIXED_CLASS    = 'main-area-sidebar-neighbor';
var NEIGHBOR_AUTOHIDE_CLASS = 'main-area-sidebar-neighbor-hide';

sidebar.onmodechange = function ( sidebarArg ) {
    var neighborExtraClass = NEIGHBOR_AUTOHIDE_CLASS;
    if ( sidebarArg.mode === 'fixed' ) {
        neighborExtraClass = NEIGHBOR_FIXED_CLASS;
    }

    var neighbor = document.getElementById( NEIGHBOR_ID );
    neighbor.className = NEIGHBOR_CLASS + ' ' + neighborExtraClass;
};
```
