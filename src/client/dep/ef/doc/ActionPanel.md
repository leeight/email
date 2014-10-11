# ActionPanel控件

`ActionPanel`控件渲染一个`Panel`，但在该面板里加载一个子Action。

## 继承关系

    - er/Control
        - er/Panel
            - ActionPanel

## 属性

### {string} url

指定需要加载的子Action对应的地址。

### {Object} actionOptions

指定加载子Action时传递的额外参数。

### {er/Action} action

当子Action加载完毕后，可以使用该属性访问到`Action`对象实例。

该属性为 **只读** 。

## 事件

### actionloaded

子Action加载完毕时触发。