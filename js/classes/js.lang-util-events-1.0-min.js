if (! ('js' in this)) {
    this.js = {};
}
js.util = (js.util || {});
js.util.arrayContainsAll = function(a, b) {
    for (var contains = 0, i = 0; i < b.length; i++) {
        for (var j = 0; j < a.length; j++) {
            if (a[j] === b[i]) {
                contains++;
                break;
            }
        }
        if (contains < i) {
            return (false);
        }
    }
    return (contains === b.length);
};
js.util.objectMergeAll = function(dest, srcs) {
    for (var src, p, i = (srcs.length - 1); i >= 0; i--) {
        src = srcs[i];
        for (p in src) {
            if (!src.hasOwnProperty(p)) {
                continue;
            }
            dest[p] = src[p];
        }
    }
};
js.log = function(msg) {
    js.log.appendLog(msg);
    if (js.settings.debug) {
        js.log._logger(msg);
    }
};
js.log._logItems = [];
js.log.appendLog = function(msg) {
    var logItem = {
        timestamp: Number(new Date()),
        message: String(msg)
    };
    js.log._logItems.push(logItem);
};
js.log._logger = (function(console, print) {
    if (Boolean(console) && ('log' in console)) {
        return (function(msg) {
            console.log(msg);
        });
    } else if (Boolean(print) && (print.constructor === Function)) {
        return (print);
    }
    return (function() {});
})(this.console, this.print);
js.lang = (js.lang || {});
js.lang.GlobalContext = (function() {
    return (this);
})();
js.settings = {
    debug: (js.lang.GlobalContext.JS_DEBUG || false),
    globalClass: (js.lang.GlobalContext.JS_GLOBAL_CLASS || false),
    globalInterface: (js.lang.GlobalContext.JS_GLOBAL_INTERFACE || false),
    globalNamespace: (js.lang.GlobalContext.JS_GLOBAL_NAMESPACE || false)
};
try {
    delete(js.lang.GlobalContext.JS_DEBUG);
    delete(js.lang.GlobalContext.JS_GLOBAL_CLASS);
    delete(js.lang.GlobalContext.JS_GLOBAL_INTERFACE);
    delete(js.lang.GlobalContext.JS_GLOBAL_NAMESPACE);
} catch(e) {}
Function.prototype.Static = function(methods) {
    js.util.objectMergeAll(this, [methods]);
    return (this);
};
Function.prototype.Implements = function() {
    this.__implements__ = ((this.prototype && this.prototype.constructor && this.prototype.constructor.__implements__) || []).slice();
    Array.prototype.push.apply(this.__implements__, arguments);
    return (this);
};
Function.prototype.enforces = function() {
    return (js.util.arrayContainsAll(this.__implements__, arguments));
};
js.lang.Class = function() {
    var c = js.lang.Class.generateClass(js.lang.Class.classInvokedWithGlobal);
    js.lang.Class.extend(c, Array.apply([], arguments));
    return (c);
};
js.lang.Class.STATIC_INIT_INVOKED_WITH_GLOBAL = 'Static method __init__ requires a context. nie: Parent.__init__.call( this );';
js.lang.Class.CLASS_INSTANTIATED_WITHOUT_BODY = 'Class requires a class body. ie:\nA = new Class()  ({\n\t__init__ : function()  {}\n});';
js.lang.Class._extending = false;
js.lang.Class.generateClass = function(globalContextCallback) {
    var c = function() {
        return (js.lang.Class.__constructor__.call(this, c, globalContextCallback, arguments));
    };
    c.__init__ = function() {
        return (js.lang.Class.__init__.call(this, c, arguments));
    };
    return (c);
};
js.lang.Class.__constructor__ = function(c, globalContextCallback, args) {
    if (this === js.lang.GlobalContext) {
        return (globalContextCallback.call(this, c, args));
    }
    if (!c.__initialized__) {
        throw new ReferenceError(js.lang.Class.CLASS_INSTANTIATED_WITHOUT_BODY);
    }
    this.constructor = c;
    if (js.lang.Class._extending || !c.prototype.hasOwnProperty('__init__')) {
        return (undefined);
    }
    return (js.lang.Class.invokeIfExists(this, this.__init__, args));
};
js.lang.Class.__init__ = function(c, args) {
    if (this instanceof Function) {
        throw new TypeError(js.lang.Class.STATIC_INIT_INVOKED_WITH_GLOBAL);
    }
    return (js.lang.Class.invokeIfExists(this, c.prototype.__init__, args));
};
js.lang.Class.extend = function(c, parents) {
    var parent = (parents[0] || Object);
    js.lang.Class._extending = true;
    try {
        c.prototype = new parent();
    } finally {
        js.lang.Class._extending = false;
    }
    if (parents.length > 1) {
        js.lang.Class.mergePrototypes(c, parents);
    }
    c.prototype.constructor = parent;
    if (parent === Object) {
        delete(c.prototype.constructor.prototype);
    }
};
js.lang.Class.extendObjects = function(c, parents) {
    c.prototype = (parents[0] || {});
    if (parents.length > 1) {
        js.util.objectMergeAll(c.prototype, parents);
    }
};
js.lang.Class.invokeIfExists = function(context, func, args) {
    if (Boolean(func) && (func.constructor === Function)) {
        return (func.apply(context, (args || [])));
    }
    return (undefined);
};
js.lang.Class.mergePrototypes = function(c, parents) {
    for (var i = 0; i < parents.length; i++) {
        parents[i] = parents[i].prototype;
    }
    js.util.objectMergeAll(c.prototype, parents);
};
js.lang.Class.classInvokedWithGlobal = function(c, methods) {
    js.util.objectMergeAll(c.prototype, methods);
    if ('__implements__' in c) {
        js.lang.Interface.bindStubs(c, c.__implements__);
    }
    c.__initialized__ = true;
    return (c);
};
js.lang.Interface = function() {
    var c = js.lang.Class.generateClass(js.lang.Interface.interfaceInvokedWithGlobal);
    js.lang.Class.extendObjects(c, Array.apply([], arguments));
    return (c);
};
js.lang.Interface.METHOD_NOT_IMPLEMENTED = "Method '{name}' not implemented; desired signature: {name}({parameters}).";
js.lang.Interface.bindStubs = function(c, interfaces) {
    var proto = c.prototype;
    for (var i = 0, s, stubs; i < interfaces.length; i++) {
        stubs = interfaces[i]._stubs;
        for (s in stubs) {
            if (! (stubs.hasOwnProperty(s) && !(s in proto))) {
                continue;
            }
            js.log(stubs[s].__message);
            proto[s] = stubs[s];
        }
    }
};
js.lang.Interface.generateStubs = function(stubs) {
    for (var s in stubs) {
        if (!stubs.hasOwnProperty(s)) {
            continue;
        }
        stubs[s] = js.lang.Interface.generateStub(s, stubs[s]);
    }
    return (stubs);
};
js.lang.Interface.generateStub = function(name, parameters) {
    var stub = function() {
        throw new ReferenceError(stub.__message);
    };
    stub.__message = js.lang.Interface.generateStubMessage(name, parameters);
    stub.__parameters = parameters;
    return (stub);
};
js.lang.Interface.generateStubMessage = function(name, parameters) {
    return (js.lang.Interface.METHOD_NOT_IMPLEMENTED.replace(/\{name\}/g, name).replace(/\{parameters\}/g, (parameters || []).join(', ')));
};
js.lang.Interface.interfaceInvokedWithGlobal = function(c, args) {
    c.__initialized__ = true;
    var iface = new c();
    var stubs = {};
    js.util.objectMergeAll(stubs, [js.lang.Interface.generateStubs(args[0]), iface._stubs]);
    iface._stubs = stubs;
    return (iface);
};
if (js.settings.globalClass) {
    Class = js.lang.Class;
}
if (js.settings.globalInterface) {
    Interface = js.lang.Interface;
}
js.util = (js.util || {});
js.util.ArrayList = new js.lang.Class()({
    __init__: function(array) {
        this._array = (array ? array.slice() : []);
    },
    add: function(element) {
        this._array.push(element);
    },
    addAll: function(collection) {
        var that = this;
        collection.iterate(function(k, v) {
            that.add(v);
        });
    },
    clear: function() {
        this._array = [];
    },
    contains: function(element, comparator) {
        return (this.indexOf(element, comparator) !== -1);
    },
    containsAll: function(collection, comparator) {
        var that = this,
        containsAll = true;
        collection.iterate(function(k, v) {
            if (!that.contains(v, comparator)) {
                containsAll = false;
                return (true);
            }
        });
        return (containsAll);
    },
    get: function(index) {
        return (this._array[index]);
    },
    indexOf: function(element, comparator) {
        var index = -1,
        compare = this.getComparator(comparator);
        this.iterate(function(k, v) {
            if (compare(element, v)) {
                index = k;
                return (true);
            }
        });
        return (index);
    },
    isEmpty: function() {
        return (this._array.length === 0);
    },
    removeAt: function(index) {
        this._array.splice(index, 1);
    },
    remove: function(element, comparator) {
        var key,
        compare = this.getComparator(comparator);
        this.iterate(function(k, v) {
            if (compare(element, v)) {
                key = k;
                return (true);
            }
        });
        this.removeAt(key);
    },
    removeAll: function(collection, comparator) {
        var that = this;
        collection.iterate(function(k, v) {
            that.remove(v, comparator);
        });
    },
    retainAll: function(collection, comparator) {
        var that = this;
        this.iterate(function(k, v) {
            if (!collection.contains(v, comparator)) {
                that.remove(v, comparator);
            }
        });
    },
    set: function(index, element) {
        this._array[index] = element;
    },
    size: function() {
        return (this._array.length);
    },
    subList: function(fromIndex, toIndex) {
        return (new js.util.ArrayList(this._array.slice(fromIndex, toIndex)));
    },
    toArray: function() {
        return (this._array.slice());
    },
    getComparator: function(comparator) {
        return ((comparator !== undefined) ? comparator: this._defaultComparator);
    },
    _defaultComparator: function(a, b) {
        return (a === b);
    },
    iterate: function(callback) {
        var array = this._array;
        for (var i = (array.length - 1); i >= 0; i--) {
            if (callback(i, array[i])) {
                break;
            }
        }
    },
    reduce: function(callback) {
        var that = this;
        this.iterate(function(k, v) {
            if (!callback(k, v)) {
                that.removeAt(k);
            }
        });
    }
}).Static({
    Iterate: function(list, callback) {
        js.util.ArrayList.prototype.iterate.call({
            _array: list
        },
        callback);
    }
});
js.util.Set = new js.lang.Class(js.util.ArrayList)({
    __init__: function(array) {
        js.util.ArrayList.__init__.call(this);
        if (array) {
            this.addAll(new js.util.ArrayList(array));
        }
    },
    add: function(element, comparator) {
        if (!this.contains(element, comparator)) {
            js.util.ArrayList.prototype.add.call(this, element);
        }
    },
    addAll: function(collection, comparator) {
        var that = this;
        collection.iterate(function(k, v) {
            that.add(v, comparator);
        });
    }
});
js.util.Dictionary = new js.lang.Class()({
    __init__: function(map) {
        this.clear();
        if (map) {
            this.putAll(map);
        }
    },
    clear: function() {
        this._size = 0;
        this._dictionary = {};
    },
    containsKey: function(key) {
        return (this._dictionary.hasOwnProperty(key));
    },
    containsValue: function(value) {
        var key;
        this.iterate(function(k, v) {
            if (value === v) {
                key = k;
                return (true);
            }
        });
        return (key !== undefined);
    },
    entrySet: function() {
        var items = [];
        this.iterate(function(k, v) {
            items.push(v);
        });
        return (new js.util.Set(items));
    },
    get: function(key) {
        return (this._dictionary[key]);
    },
    isEmpty: function() {
        return (this.size() === 0);
    },
    keySet: function() {
        var keys = [];
        this.iterate(function(k, v) {
            keys.push(k);
        });
        return (new js.util.Set(keys));
    },
    put: function(key, value) {
        if (!this._dictionary.hasOwnProperty(key)) {
            this._size++;
        }
        this._dictionary[key] = value;
        return (this);
    },
    putAll: function(map) {
        var that = this;
        map.iterate(function(k, v) {
            that.put(k, v);
        });
    },
    iterate: function(callback) {
        var dictionary = this._dictionary;
        for (var property in dictionary) {
            if (!dictionary.hasOwnProperty(property)) {
                continue;
            }
            if (callback(property, dictionary[property])) {
                break;
            }
        }
    },
    remove: function(key) {
        var success = false;
        if (this._dictionary.hasOwnProperty(key)) {
            success = delete(this._dictionary[key]);
            this._size--;
        }
        return (success);
    },
    size: function() {
        return (this._size);
    },
    values: function() {
        var values = [];
        for (var key in this._dictionary) {
            if (!this._dictionary.hasOwnProperty(key)) {
                continue;
            }
            values.push(key);
        }
        return (new js.util.ArrayList(values));
    },
    clone: function() {
        var dictionary = new js.util.Dictionary();
        this.iterate(function(k, v) {
            dictionary.put(k, (v && (v.clone instanceof Function) ? v.clone() : v));
        });
        return (dictionary);
    },
    toDict: function() {
        return (this.clone()._dictionary);
    }
}).Static({
    Iterate: function(dictionary, callback) {
        js.util.Dictionary.prototype.iterate.call({
            _dictionary: dictionary
        },
        callback);
    },
    Iterator: function(dictionary) {
        return ({
            iterate: function(callback) {
                js.util.Dictionary.prototype.iterate.call({
                    _dictionary: dictionary
                },
                callback);
            }
        });
    }
});
js.events = (js.events || {});
js.events.EventDispatcher = new js.lang.Class()({
    __init__: function() {
        this._eventListeners = new js.util.ArrayList();
    },
    addEventListener: function(listener) {
        this._eventListeners.add(listener);
    },
    hasEventListener: function(listener) {
        return (this._eventListeners.contains(listener));
    },
    removeEventListener: function(listener) {
        this._eventListeners.remove(listener, this._eventListenerComparator);
    },
    _eventListenerComparator: function(a, b) {
        return (a === b);
    },
    dispatchEvent: function(evt, eventArgs) {
        var dispatcher = this;
        var eventHandle = js.events.EventDispatcher.EVENT_HANDLE_PREFIX + js.events.EventDispatcher.EVENT_HANDLE_SEPARATOR + evt;
        this._eventListeners.iterate(function(k, listener) {
            if ((listener instanceof Object) && (eventHandle in listener)) {
                listener[eventHandle](dispatcher, eventArgs);
            }
        });
    }
}).Static({
    EVENT_HANDLE_PREFIX: 'handle',
    EVENT_HANDLE_SEPARATOR: ':'
});
