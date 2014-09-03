* 0.2.1
    - 优化了样式
    - 增加了 `Sidebar` 的默认处理
    - 增加了 NMP 权限模块的支持
    - 增加了列表页的局部刷新功能和 `AuthPanel` 控件
    - 补充 `system/user` 模块的接口
    - 修复 `TableTip` 的一些问题
    - `navigator` 升级，修复子 Tab 的权限问题导致的跳转错误
    - 系统初始化时增加自定义接口的读取

* 0.2.0
    - 修复 merge 错误
    - 跳升版本

* 0.1.17
    - 修复了 AJAX 请求不发送 NMP 指定 Header 的问题
    - 使得 `io.hooks.*` 返回值用来修改传入参数
    - 修复了 `navigator` 匹配路径为字符串的问题
    - `navigator` 现在支持二级菜单及设置显示隐藏
    - 升级了 `serverIO` 模块，以适配新版本 NMP 接口并更好地显示错误信息
    - 修复了 `extension/underscore` 中的一些 bug
    - 修复了 `mvc/BaseView` 中 `popDialog` 的一些问题
    - 给表单页面增加了多个异步确认扩展点
    - 表单页在验证出错后现在会默认将页面滚动到第一个出错的位置

* 0.1.16
    - 增加了可以对单个请求发送器设定不显示 loading 的功能
    - 对 `underscore` 的依赖升级到 `1.6.0`
    - 升级 `util.genRequesters`，递归进行封装，支持 `Function` 类型值
    - 增加了 `_.typeOf`

* 0.1.15
    - 增加列表页的批量操作功能
    - 修复了导航栏在 IE8 下切换时的显示问题
    - `Panel` 的 `appendContent` 功能可以直接使用 ESUI 新版本，不再额外提供
    - 对 ER 和 ESUI 的版本依赖都升级到 `3.1.0-beta.3`
    - 增加 `CHANGELOG.md`
