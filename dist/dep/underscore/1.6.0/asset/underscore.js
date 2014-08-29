define('underscore/underscore', [
    'require',
    'exports',
    'module'
], function (require, exports, module) {
    (function () {
        var root = this;
        var previousUnderscore = root._;
        var breaker = {};
        var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
        var push = ArrayProto.push, slice = ArrayProto.slice, concat = ArrayProto.concat, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty;
        var nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind;
        var _ = function (obj) {
            if (obj instanceof _)
                return obj;
            if (!(this instanceof _))
                return new _(obj);
            this._wrapped = obj;
        };
        if (typeof exports !== 'undefined') {
            if (typeof module !== 'undefined' && module.exports) {
                exports = module.exports = _;
            }
            exports._ = _;
        } else {
            root._ = _;
        }
        _.VERSION = '1.6.0';
        var createCallback = function (func, context, argCount) {
            if (context === void 0)
                return func;
            switch (argCount == null ? 3 : argCount) {
            case 1:
                return function (value) {
                    return func.call(context, value);
                };
            case 2:
                return function (value, other) {
                    return func.call(context, value, other);
                };
            case 3:
                return function (value, index, collection) {
                    return func.call(context, value, index, collection);
                };
            case 4:
                return function (accumulator, value, index, collection) {
                    return func.call(context, accumulator, value, index, collection);
                };
            }
            return function () {
                return func.apply(context, arguments);
            };
        };
        var lookupIterator = function (value, context, argCount) {
            if (value == null)
                return _.identity;
            if (_.isFunction(value))
                return createCallback(value, context, argCount);
            if (_.isObject(value))
                return _.matches(value);
            return _.property(value);
        };
        _.each = _.forEach = function (obj, iterator, context) {
            var i, length;
            if (obj == null)
                return obj;
            iterator = createCallback(iterator, context);
            if (obj.length === +obj.length) {
                for (i = 0, length = obj.length; i < length; i++) {
                    if (iterator(obj[i], i, obj) === breaker)
                        break;
                }
            } else {
                var keys = _.keys(obj);
                for (i = 0, length = keys.length; i < length; i++) {
                    if (iterator(obj[keys[i]], keys[i], obj) === breaker)
                        break;
                }
            }
            return obj;
        };
        _.map = _.collect = function (obj, iterator, context) {
            var results = [];
            if (obj == null)
                return results;
            iterator = lookupIterator(iterator, context);
            _.each(obj, function (value, index, list) {
                results.push(iterator(value, index, list));
            });
            return results;
        };
        var reduceError = 'Reduce of empty array with no initial value';
        _.reduce = _.foldl = _.inject = function (obj, iterator, memo, context) {
            var initial = arguments.length > 2;
            if (obj == null)
                obj = [];
            iterator = createCallback(iterator, context, 4);
            _.each(obj, function (value, index, list) {
                if (!initial) {
                    memo = value;
                    initial = true;
                } else {
                    memo = iterator(memo, value, index, list);
                }
            });
            if (!initial)
                throw TypeError(reduceError);
            return memo;
        };
        _.reduceRight = _.foldr = function (obj, iterator, memo, context) {
            var initial = arguments.length > 2;
            if (obj == null)
                obj = [];
            var length = obj.length;
            iterator = createCallback(iterator, context, 4);
            if (length !== +length) {
                var keys = _.keys(obj);
                length = keys.length;
            }
            _.each(obj, function (value, index, list) {
                index = keys ? keys[--length] : --length;
                if (!initial) {
                    memo = obj[index];
                    initial = true;
                } else {
                    memo = iterator(memo, obj[index], index, list);
                }
            });
            if (!initial)
                throw TypeError(reduceError);
            return memo;
        };
        _.find = _.detect = function (obj, predicate, context) {
            var result;
            predicate = lookupIterator(predicate, context);
            _.some(obj, function (value, index, list) {
                if (predicate(value, index, list)) {
                    result = value;
                    return true;
                }
            });
            return result;
        };
        _.filter = _.select = function (obj, predicate, context) {
            var results = [];
            if (obj == null)
                return results;
            predicate = lookupIterator(predicate, context);
            _.each(obj, function (value, index, list) {
                if (predicate(value, index, list))
                    results.push(value);
            });
            return results;
        };
        _.reject = function (obj, predicate, context) {
            return _.filter(obj, _.negate(lookupIterator(predicate)), context);
        };
        _.every = _.all = function (obj, predicate, context) {
            var result = true;
            if (obj == null)
                return result;
            predicate = lookupIterator(predicate, context);
            _.each(obj, function (value, index, list) {
                result = predicate(value, index, list);
                if (!result)
                    return breaker;
            });
            return !!result;
        };
        _.some = _.any = function (obj, predicate, context) {
            var result = false;
            if (obj == null)
                return result;
            predicate = lookupIterator(predicate, context);
            _.each(obj, function (value, index, list) {
                result = predicate(value, index, list);
                if (result)
                    return breaker;
            });
            return !!result;
        };
        _.contains = _.include = function (obj, target) {
            if (obj == null)
                return false;
            if (obj.length === +obj.length)
                return _.indexOf(obj, target) >= 0;
            return _.some(obj, function (value) {
                return value === target;
            });
        };
        _.invoke = function (obj, method) {
            var args = slice.call(arguments, 2);
            var isFunc = _.isFunction(method);
            return _.map(obj, function (value) {
                return (isFunc ? method : value[method]).apply(value, args);
            });
        };
        _.pluck = function (obj, key) {
            return _.map(obj, _.property(key));
        };
        _.where = function (obj, attrs) {
            return _.filter(obj, _.matches(attrs));
        };
        _.findWhere = function (obj, attrs) {
            return _.find(obj, _.matches(attrs));
        };
        _.max = function (obj, iterator, context) {
            var result = -Infinity, lastComputed = -Infinity, value, computed;
            if (!iterator && _.isArray(obj)) {
                for (var i = 0, length = obj.length; i < length; i++) {
                    value = obj[i];
                    if (value > result) {
                        result = value;
                    }
                }
            } else {
                iterator = lookupIterator(iterator, context);
                _.each(obj, function (value, index, list) {
                    computed = iterator(value, index, list);
                    if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
                        result = value;
                        lastComputed = computed;
                    }
                });
            }
            return result;
        };
        _.min = function (obj, iterator, context) {
            var result = Infinity, lastComputed = Infinity, value, computed;
            if (!iterator && _.isArray(obj)) {
                for (var i = 0, length = obj.length; i < length; i++) {
                    value = obj[i];
                    if (value < result) {
                        result = value;
                    }
                }
            } else {
                iterator = lookupIterator(iterator, context);
                _.each(obj, function (value, index, list) {
                    computed = iterator(value, index, list);
                    if (computed < lastComputed || computed === Infinity && result === Infinity) {
                        result = value;
                        lastComputed = computed;
                    }
                });
            }
            return result;
        };
        _.shuffle = function (obj) {
            var rand;
            var index = 0;
            var shuffled = [];
            _.each(obj, function (value) {
                rand = _.random(index++);
                shuffled[index - 1] = shuffled[rand];
                shuffled[rand] = value;
            });
            return shuffled;
        };
        _.sample = function (obj, n, guard) {
            if (n == null || guard) {
                if (obj.length !== +obj.length)
                    obj = _.values(obj);
                return obj[_.random(obj.length - 1)];
            }
            return _.shuffle(obj).slice(0, Math.max(0, n));
        };
        _.sortBy = function (obj, iterator, context) {
            iterator = lookupIterator(iterator, context);
            return _.pluck(_.map(obj, function (value, index, list) {
                return {
                    value: value,
                    index: index,
                    criteria: iterator(value, index, list)
                };
            }).sort(function (left, right) {
                var a = left.criteria;
                var b = right.criteria;
                if (a !== b) {
                    if (a > b || a === void 0)
                        return 1;
                    if (a < b || b === void 0)
                        return -1;
                }
                return left.index - right.index;
            }), 'value');
        };
        var group = function (behavior) {
            return function (obj, iterator, context) {
                var result = {};
                iterator = lookupIterator(iterator, context);
                _.each(obj, function (value, index) {
                    var key = iterator(value, index, obj);
                    behavior(result, value, key);
                });
                return result;
            };
        };
        _.groupBy = group(function (result, value, key) {
            if (_.has(result, key))
                result[key].push(value);
            else
                result[key] = [value];
        });
        _.indexBy = group(function (result, value, key) {
            result[key] = value;
        });
        _.countBy = group(function (result, value, key) {
            if (_.has(result, key))
                result[key]++;
            else
                result[key] = 1;
        });
        _.sortedIndex = function (array, obj, iterator, context) {
            iterator = lookupIterator(iterator, context, 1);
            var value = iterator(obj);
            var low = 0, high = array.length;
            while (low < high) {
                var mid = low + high >>> 1;
                if (iterator(array[mid]) < value)
                    low = mid + 1;
                else
                    high = mid;
            }
            return low;
        };
        _.toArray = function (obj) {
            if (!obj)
                return [];
            if (_.isArray(obj))
                return slice.call(obj);
            if (obj.length === +obj.length)
                return _.map(obj, _.identity);
            return _.values(obj);
        };
        _.size = function (obj) {
            if (obj == null)
                return 0;
            return obj.length === +obj.length ? obj.length : _.keys(obj).length;
        };
        _.partition = function (obj, predicate, context) {
            predicate = lookupIterator(predicate, context);
            var pass = [], fail = [];
            _.each(obj, function (value, key, obj) {
                (predicate(value, key, obj) ? pass : fail).push(value);
            });
            return [
                pass,
                fail
            ];
        };
        _.first = _.head = _.take = function (array, n, guard) {
            if (array == null)
                return void 0;
            if (n == null || guard)
                return array[0];
            if (n < 0)
                return [];
            return slice.call(array, 0, n);
        };
        _.initial = function (array, n, guard) {
            return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
        };
        _.last = function (array, n, guard) {
            if (array == null)
                return void 0;
            if (n == null || guard)
                return array[array.length - 1];
            return slice.call(array, Math.max(array.length - n, 0));
        };
        _.rest = _.tail = _.drop = function (array, n, guard) {
            return slice.call(array, n == null || guard ? 1 : n);
        };
        _.compact = function (array) {
            return _.filter(array, _.identity);
        };
        var flatten = function (input, shallow, strict, output) {
            if (shallow && _.every(input, _.isArray)) {
                return concat.apply(output, input);
            }
            for (var i = 0, length = input.length; i < length; i++) {
                var value = input[i];
                if (!_.isArray(value) && !_.isArguments(value)) {
                    if (!strict)
                        output.push(value);
                } else if (shallow) {
                    push.apply(output, value);
                } else {
                    flatten(value, shallow, strict, output);
                }
            }
            return output;
        };
        _.flatten = function (array, shallow) {
            return flatten(array, shallow, false, []);
        };
        _.without = function (array) {
            return _.difference(array, slice.call(arguments, 1));
        };
        _.uniq = _.unique = function (array, isSorted, iterator, context) {
            if (array == null)
                return [];
            if (_.isFunction(isSorted)) {
                context = iterator;
                iterator = isSorted;
                isSorted = false;
            }
            if (iterator)
                iterator = lookupIterator(iterator, context);
            var result = [];
            var seen = [];
            for (var i = 0, length = array.length; i < length; i++) {
                var value = array[i];
                if (iterator)
                    value = iterator(value, i, array);
                if (isSorted ? !i || seen !== value : !_.contains(seen, value)) {
                    if (isSorted)
                        seen = value;
                    else
                        seen.push(value);
                    result.push(array[i]);
                }
            }
            return result;
        };
        _.union = function () {
            return _.uniq(flatten(arguments, true, true, []));
        };
        _.intersection = function (array) {
            if (array == null)
                return [];
            var result = [];
            var argsLength = arguments.length;
            for (var i = 0, length = array.length; i < length; i++) {
                var item = array[i];
                if (_.contains(result, item))
                    continue;
                for (var j = 1; j < argsLength; j++) {
                    if (!_.contains(arguments[j], item))
                        break;
                }
                if (j === argsLength)
                    result.push(item);
            }
            return result;
        };
        _.difference = function (array) {
            var rest = flatten(slice.call(arguments, 1), true, true, []);
            return _.filter(array, function (value) {
                return !_.contains(rest, value);
            });
        };
        _.zip = function (array) {
            if (array == null)
                return [];
            var length = _.max(arguments, 'length').length;
            var results = Array(length);
            for (var i = 0; i < length; i++) {
                results[i] = _.pluck(arguments, i);
            }
            return results;
        };
        _.object = function (list, values) {
            if (list == null)
                return {};
            var result = {};
            for (var i = 0, length = list.length; i < length; i++) {
                if (values) {
                    result[list[i]] = values[i];
                } else {
                    result[list[i][0]] = list[i][1];
                }
            }
            return result;
        };
        _.indexOf = function (array, item, isSorted) {
            if (array == null)
                return -1;
            var i = 0, length = array.length;
            if (isSorted) {
                if (typeof isSorted == 'number') {
                    i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
                } else {
                    i = _.sortedIndex(array, item);
                    return array[i] === item ? i : -1;
                }
            }
            for (; i < length; i++)
                if (array[i] === item)
                    return i;
            return -1;
        };
        _.lastIndexOf = function (array, item, from) {
            if (array == null)
                return -1;
            var i = from == null ? array.length : from;
            while (i--)
                if (array[i] === item)
                    return i;
            return -1;
        };
        _.range = function (start, stop, step) {
            if (arguments.length <= 1) {
                stop = start || 0;
                start = 0;
            }
            step = arguments[2] || 1;
            var length = Math.max(Math.ceil((stop - start) / step), 0);
            var idx = 0;
            var range = Array(length);
            while (idx < length) {
                range[idx++] = start;
                start += step;
            }
            return range;
        };
        var Ctor = function () {
        };
        _.bind = function (func, context) {
            var args, bound;
            if (nativeBind && func.bind === nativeBind)
                return nativeBind.apply(func, slice.call(arguments, 1));
            if (!_.isFunction(func))
                throw TypeError('Bind must be called on a function');
            args = slice.call(arguments, 2);
            bound = function () {
                if (!(this instanceof bound))
                    return func.apply(context, args.concat(slice.call(arguments)));
                Ctor.prototype = func.prototype;
                var self = new Ctor();
                Ctor.prototype = null;
                var result = func.apply(self, args.concat(slice.call(arguments)));
                if (Object(result) === result)
                    return result;
                return self;
            };
            return bound;
        };
        _.partial = function (func) {
            var boundArgs = slice.call(arguments, 1);
            return function () {
                var position = 0;
                var args = boundArgs.slice();
                for (var i = 0, length = args.length; i < length; i++) {
                    if (args[i] === _)
                        args[i] = arguments[position++];
                }
                while (position < arguments.length)
                    args.push(arguments[position++]);
                return func.apply(this, args);
            };
        };
        _.bindAll = function (obj) {
            var i = 1, length = arguments.length, key;
            if (length <= 1)
                throw Error('bindAll must be passed function names');
            for (; i < length; i++) {
                key = arguments[i];
                obj[key] = createCallback(obj[key], obj, Infinity);
            }
            return obj;
        };
        _.memoize = function (func, hasher) {
            var memoize = function (key) {
                var cache = memoize.cache;
                var address = hasher ? hasher.apply(this, arguments) : key;
                if (!_.has(cache, address))
                    cache[address] = func.apply(this, arguments);
                return cache[key];
            };
            memoize.cache = {};
            return memoize;
        };
        _.delay = function (func, wait) {
            var args = slice.call(arguments, 2);
            return setTimeout(function () {
                return func.apply(null, args);
            }, wait);
        };
        _.defer = function (func) {
            return _.delay.apply(_, [
                func,
                1
            ].concat(slice.call(arguments, 1)));
        };
        _.throttle = function (func, wait, options) {
            var context, args, result;
            var timeout = null;
            var previous = 0;
            if (!options)
                options = {};
            var later = function () {
                previous = options.leading === false ? 0 : _.now();
                timeout = null;
                result = func.apply(context, args);
                if (!timeout)
                    context = args = null;
            };
            return function () {
                var now = _.now();
                if (!previous && options.leading === false)
                    previous = now;
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0 || remaining > wait) {
                    clearTimeout(timeout);
                    timeout = null;
                    previous = now;
                    result = func.apply(context, args);
                    if (!timeout)
                        context = args = null;
                } else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        };
        _.debounce = function (func, wait, immediate) {
            var timeout, args, context, timestamp, result;
            var later = function () {
                var last = _.now() - timestamp;
                if (last < wait && last > 0) {
                    timeout = setTimeout(later, wait - last);
                } else {
                    timeout = null;
                    if (!immediate) {
                        result = func.apply(context, args);
                        if (!timeout)
                            context = args = null;
                    }
                }
            };
            return function () {
                context = this;
                args = arguments;
                timestamp = _.now();
                var callNow = immediate && !timeout;
                if (!timeout)
                    timeout = setTimeout(later, wait);
                if (callNow) {
                    result = func.apply(context, args);
                    context = args = null;
                }
                return result;
            };
        };
        _.once = function (func) {
            var ran = false, memo;
            return function () {
                if (ran)
                    return memo;
                ran = true;
                memo = func.apply(this, arguments);
                func = null;
                return memo;
            };
        };
        _.wrap = function (func, wrapper) {
            return _.partial(wrapper, func);
        };
        _.negate = function (predicate) {
            return function () {
                return !predicate.apply(this, arguments);
            };
        };
        _.compose = function () {
            var funcs = arguments;
            return function () {
                var args = arguments;
                for (var i = funcs.length - 1; i >= 0; i--) {
                    args = [funcs[i].apply(this, args)];
                }
                return args[0];
            };
        };
        _.after = function (times, func) {
            return function () {
                if (--times < 1) {
                    return func.apply(this, arguments);
                }
            };
        };
        _.keys = function (obj) {
            if (!_.isObject(obj))
                return [];
            if (nativeKeys)
                return nativeKeys(obj);
            var keys = [];
            for (var key in obj)
                if (_.has(obj, key))
                    keys.push(key);
            return keys;
        };
        _.values = function (obj) {
            var keys = _.keys(obj);
            var length = keys.length;
            var values = Array(length);
            for (var i = 0; i < length; i++) {
                values[i] = obj[keys[i]];
            }
            return values;
        };
        _.pairs = function (obj) {
            var keys = _.keys(obj);
            var length = keys.length;
            var pairs = Array(length);
            for (var i = 0; i < length; i++) {
                pairs[i] = [
                    keys[i],
                    obj[keys[i]]
                ];
            }
            return pairs;
        };
        _.invert = function (obj) {
            var result = {};
            var keys = _.keys(obj);
            for (var i = 0, length = keys.length; i < length; i++) {
                result[obj[keys[i]]] = keys[i];
            }
            return result;
        };
        _.functions = _.methods = function (obj) {
            var names = [];
            for (var key in obj) {
                if (_.isFunction(obj[key]))
                    names.push(key);
            }
            return names.sort();
        };
        _.extend = function (obj) {
            if (!_.isObject(obj))
                return obj;
            var source, prop;
            for (var i = 1, length = arguments.length; i < length; i++) {
                source = arguments[i];
                for (prop in source) {
                    obj[prop] = source[prop];
                }
            }
            return obj;
        };
        _.pick = function (obj, iterator, context) {
            var result = {}, key;
            if (_.isFunction(iterator)) {
                for (key in obj) {
                    var value = obj[key];
                    if (iterator.call(context, value, key, obj))
                        result[key] = value;
                }
            } else {
                var keys = concat.apply([], slice.call(arguments, 1));
                for (var i = 0, length = keys.length; i < length; i++) {
                    key = keys[i];
                    if (key in obj)
                        result[key] = obj[key];
                }
            }
            return result;
        };
        _.omit = function (obj, iterator, context) {
            if (_.isFunction(iterator)) {
                iterator = _.negate(iterator);
            } else {
                var keys = _.map(concat.apply([], slice.call(arguments, 1)), String);
                iterator = function (value, key) {
                    return !_.contains(keys, key);
                };
            }
            return _.pick(obj, iterator, context);
        };
        _.defaults = function (obj) {
            if (!_.isObject(obj))
                return obj;
            for (var i = 1, length = arguments.length; i < length; i++) {
                var source = arguments[i];
                for (var prop in source) {
                    if (obj[prop] === void 0)
                        obj[prop] = source[prop];
                }
            }
            return obj;
        };
        _.clone = function (obj) {
            if (!_.isObject(obj))
                return obj;
            return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
        };
        _.tap = function (obj, interceptor) {
            interceptor(obj);
            return obj;
        };
        var eq = function (a, b, aStack, bStack) {
            if (a === b)
                return a !== 0 || 1 / a === 1 / b;
            if (a == null || b == null)
                return a === b;
            if (a instanceof _)
                a = a._wrapped;
            if (b instanceof _)
                b = b._wrapped;
            var className = toString.call(a);
            if (className !== toString.call(b))
                return false;
            switch (className) {
            case '[object RegExp]':
            case '[object String]':
                return '' + a === '' + b;
            case '[object Number]':
                if (a != +a)
                    return b != +b;
                return a == 0 ? 1 / a == 1 / b : a == +b;
            case '[object Date]':
            case '[object Boolean]':
                return +a === +b;
            }
            if (typeof a != 'object' || typeof b != 'object')
                return false;
            var length = aStack.length;
            while (length--) {
                if (aStack[length] === a)
                    return bStack[length] === b;
            }
            var aCtor = a.constructor, bCtor = b.constructor;
            if (aCtor !== bCtor && 'constructor' in a && 'constructor' in b && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor)) {
                return false;
            }
            aStack.push(a);
            bStack.push(b);
            var size, result;
            if (className === '[object Array]') {
                size = a.length;
                result = size === b.length;
                if (result) {
                    while (size--) {
                        if (!(result = eq(a[size], b[size], aStack, bStack)))
                            break;
                    }
                }
            } else {
                var keys = _.keys(a), key;
                size = keys.length;
                result = _.keys(b).length == size;
                if (result) {
                    while (size--) {
                        key = keys[size];
                        if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack)))
                            break;
                    }
                }
            }
            aStack.pop();
            bStack.pop();
            return result;
        };
        _.isEqual = function (a, b) {
            return eq(a, b, [], []);
        };
        _.isEmpty = function (obj) {
            if (obj == null)
                return true;
            if (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))
                return obj.length === 0;
            for (var key in obj)
                if (_.has(obj, key))
                    return false;
            return true;
        };
        _.isElement = function (obj) {
            return !!(obj && obj.nodeType === 1);
        };
        _.isArray = nativeIsArray || function (obj) {
            return toString.call(obj) === '[object Array]';
        };
        _.isObject = function (obj) {
            return obj === Object(obj);
        };
        _.each([
            'Arguments',
            'Function',
            'String',
            'Number',
            'Date',
            'RegExp'
        ], function (name) {
            _['is' + name] = function (obj) {
                return toString.call(obj) === '[object ' + name + ']';
            };
        });
        if (!_.isArguments(arguments)) {
            _.isArguments = function (obj) {
                return _.has(obj, 'callee');
            };
        }
        if (typeof /./ !== 'function') {
            _.isFunction = function (obj) {
                return typeof obj === 'function';
            };
        }
        _.isFinite = function (obj) {
            return isFinite(obj) && !isNaN(parseFloat(obj));
        };
        _.isNaN = function (obj) {
            return _.isNumber(obj) && obj !== +obj;
        };
        _.isBoolean = function (obj) {
            return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
        };
        _.isNull = function (obj) {
            return obj === null;
        };
        _.isUndefined = function (obj) {
            return obj === void 0;
        };
        _.has = function (obj, key) {
            return obj != null && hasOwnProperty.call(obj, key);
        };
        _.noConflict = function () {
            root._ = previousUnderscore;
            return this;
        };
        _.identity = function (value) {
            return value;
        };
        _.constant = function (value) {
            return function () {
                return value;
            };
        };
        _.noop = function () {
        };
        _.property = function (key) {
            return function (obj) {
                return obj[key];
            };
        };
        _.matches = function (attrs) {
            return function (obj) {
                if (obj == null)
                    return _.isEmpty(attrs);
                if (obj === attrs)
                    return true;
                for (var key in attrs)
                    if (attrs[key] !== obj[key])
                        return false;
                return true;
            };
        };
        _.times = function (n, iterator, context) {
            var accum = Array(Math.max(0, n));
            iterator = createCallback(iterator, context, 1);
            for (var i = 0; i < n; i++)
                accum[i] = iterator(i);
            return accum;
        };
        _.random = function (min, max) {
            if (max == null) {
                max = min;
                min = 0;
            }
            return min + Math.floor(Math.random() * (max - min + 1));
        };
        _.now = Date.now || function () {
            return new Date().getTime();
        };
        var entityMap = {
                escape: {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    '\'': '&#x27;'
                }
            };
        entityMap.unescape = _.invert(entityMap.escape);
        var entityRegexes = {
                escape: RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
                unescape: RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
            };
        _.each([
            'escape',
            'unescape'
        ], function (method) {
            _[method] = function (string) {
                if (string == null)
                    return '';
                return ('' + string).replace(entityRegexes[method], function (match) {
                    return entityMap[method][match];
                });
            };
        });
        _.result = function (object, property) {
            if (object == null)
                return void 0;
            var value = object[property];
            return _.isFunction(value) ? object[property]() : value;
        };
        var idCounter = 0;
        _.uniqueId = function (prefix) {
            var id = ++idCounter + '';
            return prefix ? prefix + id : id;
        };
        _.templateSettings = {
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%=([\s\S]+?)%>/g,
            escape: /<%-([\s\S]+?)%>/g
        };
        var noMatch = /(.)^/;
        var escapes = {
                '\'': '\'',
                '\\': '\\',
                '\r': 'r',
                '\n': 'n',
                '\u2028': 'u2028',
                '\u2029': 'u2029'
            };
        var escaper = /\\|'|\r|\n|\u2028|\u2029/g;
        var escapeChar = function (match) {
            return '\\' + escapes[match];
        };
        _.template = function (text, data, settings) {
            settings = _.defaults({}, settings, _.templateSettings);
            var matcher = RegExp([
                    (settings.escape || noMatch).source,
                    (settings.interpolate || noMatch).source,
                    (settings.evaluate || noMatch).source
                ].join('|') + '|$', 'g');
            var index = 0;
            var source = '__p+=\'';
            text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
                source += text.slice(index, offset).replace(escaper, escapeChar);
                index = offset + match.length;
                if (escape) {
                    source += '\'+\n((__t=(' + escape + '))==null?\'\':_.escape(__t))+\n\'';
                } else if (interpolate) {
                    source += '\'+\n((__t=(' + interpolate + '))==null?\'\':__t)+\n\'';
                } else if (evaluate) {
                    source += '\';\n' + evaluate + '\n__p+=\'';
                }
                return match;
            });
            source += '\';\n';
            if (!settings.variable)
                source = 'with(obj||{}){\n' + source + '}\n';
            source = 'var __t,__p=\'\',__j=Array.prototype.join,' + 'print=function(){__p+=__j.call(arguments,\'\');};\n' + source + 'return __p;\n';
            try {
                var render = Function(settings.variable || 'obj', '_', source);
            } catch (e) {
                e.source = source;
                throw e;
            }
            if (data)
                return render(data, _);
            var template = function (data) {
                return render.call(this, data, _);
            };
            var argument = settings.variable || 'obj';
            template.source = 'function(' + argument + '){\n' + source + '}';
            return template;
        };
        _.chain = function (obj) {
            var instance = _(obj);
            instance._chain = true;
            return instance;
        };
        var result = function (obj) {
            return this._chain ? _(obj).chain() : obj;
        };
        _.mixin = function (obj) {
            _.each(_.functions(obj), function (name) {
                var func = _[name] = obj[name];
                _.prototype[name] = function () {
                    var args = [this._wrapped];
                    push.apply(args, arguments);
                    return result.call(this, func.apply(_, args));
                };
            });
        };
        _.mixin(_);
        _.each([
            'pop',
            'push',
            'reverse',
            'shift',
            'sort',
            'splice',
            'unshift'
        ], function (name) {
            var method = ArrayProto[name];
            _.prototype[name] = function () {
                var obj = this._wrapped;
                method.apply(obj, arguments);
                if ((name === 'shift' || name === 'splice') && obj.length === 0)
                    delete obj[0];
                return result.call(this, obj);
            };
        });
        _.each([
            'concat',
            'join',
            'slice'
        ], function (name) {
            var method = ArrayProto[name];
            _.prototype[name] = function () {
                return result.call(this, method.apply(this._wrapped, arguments));
            };
        });
        _.prototype.value = function () {
            return this._wrapped;
        };
    }.call(this));
});

define('underscore', ['underscore/underscore'], function ( main ) { return main; });