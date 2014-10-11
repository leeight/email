# UIModel基类

`UIModel`是对`er/Model`的继承，用于将ER与ESUI结合起来。

`UIModel`会重写`set`和`fill`方法，提供数据格式化的功能。

`UIModel`主要用于表单类的模块，`er/Form`控件的`getData()`方法会返回控件的`rawValue`而不是`value`，`rawValue`是一个对象，并不一定是字符串。但前后端交互的HTTP接口一定使用字符串，因此在获得`rawValue`之后，需要一定的方法将之转换为字符串再通过`Model`的相关方法（如`save`或`update`之类）提交，因此`UIModel`提供`formatters`属性用于配置格式化逻辑。

## 继承关系

    - er/Observable
        - er/Model
            - UIModel

## 属性

### {Object} UIModel.formatters

这是`UIModel`上的静态属性，其内置了几个常用的格式化函数：

- `date`：将`Date`类型格式化为`YYYY-MM-dd`格式的日期字符串。
- `dateRange`：将`{ {Date} begin, {Date} end }`类型格式化为`YYYY-MM-dd,YYYY-MM-dd`格式的字符串。
- `time`：将`Date`类型格式化为`YYYY-MM-dd HH:mm:ss`格式的日期字符串。
- `timeRange`：将`{ {Date} begin, {Date} end }`类型格式化为`YYYY-MM-dd HH:mm:ss,YYYY-MM-dd HH:mm:ss`格式的字符串。

### {Object} formatters

通过该属性配置格式化函数，当调用`set`或`fill`将值写入当前`Model`时，会通过此配置查找对应的格式化函数，先经过函数的处理再将值写入。

每一个格式化函数应该接受一个值，返回字符串。

`formatters`属性为一个对象，其键为对应属性的名称，值为格式化函数，如：

    CustomModel.prototype.formatters = {
        birthday: UIModel.formatters.date,
        gender: function (value) {
            return ['male', 'female'][value];
        }
    };

以上配置设定当写入`birthday`属性时，先将值通过内置的`date`函数进行格式化，而当`gender`属性被写入时，使用自定义的函数进行格式化。

## 方法

### {Object} getPart({string..} keys)

由于一个`Model`中会存在许多属性，并不是每一个属性都要在保存、更新时发送到服务器，因此不能直接使用`valueOf()`得到对象，而是需要取出一部分属性，拼装成一个新的对象，通常就是这样的代码：

    var postData = {
        name: model.get('name'),
        age: model.get('age'),
        birthday: model.get('birthday'),
        ...
    };

如果属性较多，会比较累。而使用`getPart`方法，则可以：

    var postData = model.getPart('name', 'age', 'birthday', ...);

以节省代码量，另一种方法是，根据`form.getData()`返回的键，一次性获取所有的值：

    var formData = form.getData();
    model.fill(formData); // 先写到model中，会经过formatter格式化
    var postData = model.getPart(Object.keys(formData)); // 注意Object.keys的兼容性