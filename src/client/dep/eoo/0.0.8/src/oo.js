// TODO:
// - test case
// - demo
void function (define) {
    define(function () {
        var Empty = function () { };
        var NAME_PROPERTY_NAME = '__name__';
        var OWNER_PROPERTY_NAME = '__owner__';

        function Class() {
            return Class.create.apply(Class, Array.prototype.slice.call(arguments));
        }

        /**
         * @class Class
         * 简单的 js oo 库
         *
         * 用法:
         *      @example
         *      // 来个简单的基类，最简单的是 var Super = Class();
         *      var Super = Class({
         *          superProp1: 'superProp1',
         *          superProp2: 'superProp2',
         *          method: function(){
         *              alert(this.superProp1);
         *          },
         *          superMethod2: function(){
         *              alert(this.superProp2);
         *          }
         *      })
         *
         *      // 来个派生类，继承 Super
         *      var Sub = Class(Super, {
         *          // constructor 会在实例化时调用
         *          constructor: function(prop){
         *             // $super 会自动调用父类的同名方法
         *             this.$super(arguments)
         *             this.subProp = prop
         *             alert("Sub init")
         *          },
         *          method: function(){
         *              this.$super(arguments);
         *              alert(this.subProp);
         *          }
         *      })
         *
         *      var Sub1 = Class(Sub, {
         *          constructor: function(prop1, prop2){
         *             this.$super(arguments)
         *             this.sub1Prop = prop2;
         *             alert("Sub1 init")
         *          },
         *          method: function(){
         *              this.$super(arguments)
         *              alert(this.sub1Prop)
         *          }
         *      })
         *
         *      var superIns = new Super();
         *      var sub = new Sub('Sub'); // alert: Sub init
         *      var sub1 = new Sub1('Sub', 'Sub1') // alert: Sub init, Sub1 init
         *      superIns.method() // alert: superProp1
         *      sub.method() // alert: superProp1, Sub
         *      sub1.method() // alert: superProp1, Sub, Sub1
         *      sub.superMethod() // alert: superProp2
         *      sub1.superMethod() // alert: superProp2
         *
         */
        Class.create = function (BaseClass, overrides) {
            overrides = overrides || {};
            BaseClass = BaseClass || Class;
            if (typeof BaseClass == 'object') {
                overrides = BaseClass;
                BaseClass = Class;
            }

            var kclass = inherit(BaseClass);
            var proto = kclass.prototype;
            eachObject(overrides, function (value, key) {
                if (typeof value == 'function') {
                    value[NAME_PROPERTY_NAME] = key;
                    value[OWNER_PROPERTY_NAME] = kclass;
                }

                proto[key] = value;
            });

            kclass.toString = toString;

            return kclass;
        };

        /**
         *
         * @type {Function} creates a new object with the specified prototype object and properties.
         *  Just equals `Object.create` method.
         * @param proto {Object} The object which should be the prototype of the newly-created object.
         * @return {Object}
         */
        Class.static = typeof Object.create === 'function' ? Object.create :
            function (o) {
                if (arguments.length > 1) {
                    throw Error('Second argument not supported');
                }
                if (typeof o != 'object') {
                    throw TypeError('Argument must be an object');
                }
                Empty.prototype = o;
                return new Empty();
            };

        Class.toString = function () {
            return 'function Class() { [native code] }';
        };

        Class.prototype = {
            constructor: function () {},
            $self: Class,
            $superClass: Object,
            $super: function (args) {
                var method = this.$super.caller;
                var name = method.__name__;
                var superClass = method.__owner__.$superClass;
                var superMethod = superClass.prototype[name];

                if (typeof superMethod !== 'function') {
                    throw "Call the super class's " + name + ", but it is not a function!";
                }

                return superMethod.apply(this, args);
            }
        };

        function inherit(BaseClass) {
            var kclass = function () {
                /**
                 * 若未进行 constructor 的重写，则klass.prototype.constructor指向BaseClass.prototype.constructor
                 */
                return kclass.prototype.constructor.apply(this, arguments);

                // 下面是之前的代码，我也不知道为什么写的这么多，还有 bug- -！！5555~~

                // 兼容非 oo 创建的类继承 oo 类时的构造函数调用
                /*if (kclass.caller === this.constructor) {
                 return kclass.prototype.constructor.apply(this, arguments);
                 }

                 return this.constructor !== kclass &&
                 typeof this.constructor == 'function' &&
                 this.constructor.apply(this, arguments);*/
            };

            Empty.prototype = BaseClass.prototype;

            var proto = kclass.prototype = new Empty();
            proto.$self = kclass;
            kclass.$superClass = BaseClass;

            if (!('$super' in proto)) {
                proto.$super = Class.prototype.$super;
            }

            return kclass;
        }

        var hasEnumBug = !({toString: 1}['propertyIsEnumerable']('toString'));
        var enumProperties = [
            'constructor',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'toString',
            'toLocaleString',
            'valueOf'
        ];

        function eachObject(obj, fn) {
            for (var k in obj) {
                hasOwnProperty(obj, k) && fn(obj[k], k, obj);
            }
            //ie6-8 enum bug
            if (hasEnumBug) {
                for (var i = enumProperties.length - 1; i > -1; --i) {
                    var key = enumProperties[i];
                    hasOwnProperty(obj, key) && fn(obj[key], key, obj);
                }
            }
        }

        function hasOwnProperty(obj, key) {
            return Object.prototype.hasOwnProperty.call(obj, key);
        }

        function toString() {
            return this.prototype.constructor.toString();
        }

        return Class;
    });
}(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });