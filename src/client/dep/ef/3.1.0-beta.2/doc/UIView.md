# UIView基类

`UIView`是对`er/View`的继承，用于将ER与ESUI结合起来。

`UIView`会重写`enterDocument`方法，使用ESUI对容器进行初始化，以保证控件的渲染。

## 继承关系

    - er/Observable
        - er/View
            - UIView

## 属性

### {Object} uiProperties

通过`uiProperties`属性，可以为控件加上额外的属性。该属性为一个对象，其中的键为对应控件的id，值为控件的额外属性对象，如下代码：

    CustomView.prototype.uiProperties = {
        username: {
            maxLength: 20,
            pattern: '^[a-zA-Z]+$'
        }
    };

则指定id为 **username** 的控件在实例化时额外传递2个属性，分别为`maxLength`和`pattern`。

### {Object} uiEvents

通过`uiEvents`属性，可以为控件绑定指定的事件。该属性为一个对象，由2种方式声明：

- 键为`id:eventName`形式的字符串，值为对应事件的处理函数，如：

        CustomView.prototype.uiEvents = {
            'username:input': function (e) {
                if (this.getValue().length > 20) {
                    warn('已经超出' + (this.getValue().length - 20) + '个字符';
                }
            }
        }

- 键为控件的id，值为一个对象。值对象中的键为事件名称，值为处理函数，如：

        CustomView.prototype.uiEvents = {
            username: {
                input: function (e) {
                    if (this.getValue().length > 20) {
                        warn('已经超出' + (this.getValue().length - 20) + '个字符';
                    }
                }
            }
        }

需要注意的是，在此处声明的事件，运行时的`this`对象均是`View`实例，而非控件的实例。同时，在运行期，`UIView`会克隆该属性，将其中所有的处理函数都进行一次`bind`，将`this`指向自身，因此运行时的`uiEvents`与类声明时的不会相同。

如果需要解除某个事件的绑定，可以使用`.on('type', this.uiEvents.xxx)`进行。

### {ViewContext} viewContext

每一个`UIView`会创建一个单独的`ViewContext`，该视图的所有控件均存放在这个`ViewContext`中。

一般情况下没有使用该属性的必要，特殊场景如清空当前视图下的控件，可以使用`this.viewContext.clean();`。

在`UIView`销毁时，会同时销毁该`ViewContext`，因此不需要关心控件在离开视图时的销毁工作。

## 方法

### {Control} get({string} id)

该方法即`this.viewContext.get(id)`，用于返回当前视图下指定id的控件实例。

### {ViewContext} createViewContext()

创建当前`UIView`实例使用的`ViewContext`对象，默认实现是通过`this.name`或者当前构造函数的名字来创建一个`ViewContext`实例，可重写来创建一个`id`稳定的`ViewContext`对象。

## 其它

### 值替换

`UIView`为ESUI提供了值替换函数，在HTML中对应`data-ui-*`和`data-ui-extension-*`属性的值，如果以 **@** 为起始，则会替换为`Model`中的对应值，如：

    <div data-ui-type="Select" data-ui-datasource="@users"></div>

则在该`Select`控件实例化时，其`datasource`属性的值等于`this.model.get('datasource')`的值，而不是简单的`@users`字符串。

以 **@** 为起始的字符串可以是一个深度的属性路径，如`@user.name.first`也是被允许的。

### enterDocument

如果有需要重写`enterDocument`方法， **必须** 调用`UIView.prototype.enterDocument`，否则ESUI无法正常工作。