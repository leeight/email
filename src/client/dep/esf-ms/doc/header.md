header
=======

**ESF-MS** 提供了系统页头部分的样式支持。


header容器
----

### class name

+ `header`: 作用于页头容器元素


### less variable

+ `@sys-header-background-color`: #264597; 背景颜色。
+ `@sys-header-background-image`: "img/header-bg.jpg"; 背景图片，系统支持右上对其无平铺的背景图片，不需要背景图片时，将该值设置为false。
+ `@sys-header-height`: 50px; 高度。


logo
----

### class name

+ `logo`: 作用于logo的链接元素。


### less variable

+ `@sys-logo-width`: 98px; 宽度。
+ `@sys-logo-height`: 32px; 高度。
+ `@sys-logo-margin`: 11px 0 0 14px; 外边距，用于控制logo距离左上角的位置。


导航条
----

### class name

+ `nav`: 作用于导航条容器元素，通常为 *ul*。
+ `nav-item-current`: 当前的导航项，作用于导航项元素，通常为 *li*。

### less variable

+ `@sys-nav-left-gap`: 20px; 导航条距离logo的宽度。
+ `@sys-nav-height`: 29px; 导航条高度。
+ `@sys-nav-font-size`: 14px; 导航条文字大小。
+ `@sys-nav-item-border-top-length`: 1px; 导航项上边框宽度。上边框通常用于提升质感。
+ `@sys-nav-item-border-top-color`: #79a3ff; 导航项上边框颜色。
+ `@sys-nav-item-border-top-color-current`: #fff; 当前导航项上边框宽度。
+ `@sys-nav-item-gap`: 5px; 导航项直接间隔的宽度。
+ `@sys-nav-item-padding`: 0 12px; 导航项元素的内边距。
+ `@sys-nav-item-radius`: 3px 3px 0 0; 导航项的圆角。
+ `@sys-nav-item-color`: #fff; 导航项文字颜色。
+ `@sys-nav-item-color-current`: #333; 当前导航项的文字颜色。
+ `@sys-nav-item-underline`: false; 导航项文字是否有下划线。
+ `@sys-nav-item-bg-gradient`: true; 导航项背景是否渐变，非渐变时背景色为top和bottom颜色的average。
+ `@sys-nav-item-bg-top-color`: #5581e5; 导航项顶部背景色。
+ `@sys-nav-item-bg-bottom-color`: #4770c7; 导航项底部背景色。
+ `@sys-nav-item-bg-top-color-current`: #eaeaea; 当前导航项顶部背景色。
+ `@sys-nav-item-bg-bottom-color-current`: #fafafa; 当前导航项底部背景色。

用户信息
----

### class name

+ `user-info`: 作用于用户信息条容器元素，通常为 *ul*。
+ `user-name`: 作用于用户名项，通常其位于用户信息条最左边第一条，为 *li*。

### less variable

+ `@sys-userinfo-right`: 14px; 用户信息条距离右边的距离。
+ `@sys-userinfo-top`: 6px; 用户信息条距离上边的距离。
+ `@sys-userinfo-color`: #ededed; 用户信息条文字颜色。
+ `@sys-userinfo-seperator-color`: #eee; 用户信息项分隔线颜色。
+ `@sys-userinfo-seperator-width`: 1px; 用户信息项分隔线宽度。
+ `@sys-userinfo-item-padding`: 0 10px; 用户信息项内边距。
+ `@sys-userinfo-username-bold`: true; 用户名项是否加粗。

HTML示例
-----

```html
<div class="header">
    <a class="logo" href="#" target="_blank"><img alt="百度推广" title="百度推广" src="src/img/logo.png" width="98" height="32"></a>
    <ul class="nav">
        <li class="nav-item-current"><a href="#">首页</a></li>
        <li><a href="#/">推广管理</a></li>
        <li><a href="#/">数据报告</a></li>
    </ul>
    <ul class="user-info">
        <li class="user-name"><a>username</a></li>
        <li><a href="/user/logout">退出</a></li>
    </ul>
</div>
```

