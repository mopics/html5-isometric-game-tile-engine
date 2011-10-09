/*jslint forin: true */

if (! ('js' in this)) {
    this.js = {};
}

js.util = (js.util || {});

js.util.arrayContainsAll = function(a, b) {
    /** Checks if a is a list of the same objects as b. **/
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
    /** Merges all properties of each object in sources (srcs) to destination (dest). **/
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



// global logger
js.log = function(msg) {
    /** Append given message to list of log-items.  **/
    js.log.appendLog(msg);

    if (js.settings.debug) {
        js.log._logger(msg);
    }
};

js.log._logItems = [];

js.log.appendLog = function(msg) {
    /** Append an object representing a log-item to the log. **/
    var logItem = {
            timestamp : Number(new Date()),
            message :   String(msg)
        };

    js.log._logItems.push(logItem);
};

js.log._logger = (function(console, print) {
    /** Simple logger to wrap console functionality when swapping between
        ss-js and dom. **/
    if (Boolean(console) && ('log' in console)) {
        return (function(msg) {
            console.log(msg);
        });
    }
    else if (Boolean(print) && (print.constructor === Function)) {
        return (print);
    }
    return (function() {});
})(this.console, this.print);

js.lang = (js.lang || {});

js.lang.GlobalContext = (function() {
    /** Return a reference to global context. (in a browser: window) **/
    return (this);
})();

js.settings = {
    /** Client settings/preferences. **/
    debug:           (js.lang.GlobalContext.JS_DEBUG            || false),
    globalClass:     (js.lang.GlobalContext.JS_GLOBAL_CLASS     || false),
    globalInterface: (js.lang.GlobalContext.JS_GLOBAL_INTERFACE || false),
    globalNamespace: (js.lang.GlobalContext.JS_GLOBAL_NAMESPACE || false)
};

try {
    /** Delete global clobbers (try-catch for IE: doesn't allow munging global-context.) **/
    delete(js.lang.GlobalContext.JS_DEBUG);
    delete(js.lang.GlobalContext.JS_GLOBAL_CLASS);
    delete(js.lang.GlobalContext.JS_GLOBAL_INTERFACE);
    delete(js.lang.GlobalContext.JS_GLOBAL_NAMESPACE);
} catch(e) {/* do nothing. */}

Function.prototype.Static = function(methods) {
    /** Merge given dictionary into prototype of function (constructor) method was called on. **/
    // TODO: inheritance with static members?
    js.util.objectMergeAll(this, [methods]);
    return (this);
};

Function.prototype.Implements = function(/* Interface, Interface, ... */) {
    /** Append given interfaces to this function (constructor). **/
    this.__implements__ =
        ((this.prototype && this.prototype.constructor && this.prototype.constructor.__implements__) || []).slice();

    // TODO: __implements__ needs to be unique. (set(this.__implements__, arguments))
    Array.prototype.push.apply(this.__implements__, arguments);

    return (this);
};

Function.prototype.enforces = function(/* Interface, Interface, ... */) {
    /** Check that all given interfaces are within this function (constructor)'s 
        list of interfaces. **/
    return (js.util.arrayContainsAll(this.__implements__, arguments));
};


js.lang.Class = function(/* Parent, Parent, ... */) {
    /** Constructor. Used to initiate creation of a constructor. **/
    var c = js.lang.Class.generateClass(js.lang.Class.classInvokedWithGlobal);
    js.lang.Class.extend(c, Array.apply([], arguments));

    return (c);
};

js.lang.Class.STATIC_INIT_INVOKED_WITH_GLOBAL = 'Static method __init__ requires a context. nie: Parent.__init__.call( this );';
js.lang.Class.CLASS_INSTANTIATED_WITHOUT_BODY = 'Class requires a class body. ie:\nA = new Class()  ({\n\t__init__ : function()  {}\n});';
js.lang.Class._extending = false;

js.lang.Class.generateClass = function(globalContextCallback) {
    /** Builds a constructor with an initializer. These functions only relay arguments to helpers. **/
    var c = function() {
        return (js.lang.Class.__constructor__.call(this, c, globalContextCallback, arguments));
    };

    c.__init__ = function() {
        return (js.lang.Class.__init__.call(this, c, arguments));
    };

    return (c);
};

js.lang.Class.__constructor__ = function(c, globalContextCallback, args) {
    /** Function that gets invoked when a constructor is instantiated. **/
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
    /** Shared function that should be called from child initializers. **/
    if (this instanceof Function) {
        throw new TypeError(js.lang.Class.STATIC_INIT_INVOKED_WITH_GLOBAL);
    }

    return (js.lang.Class.invokeIfExists(this, c.prototype.__init__, args));
};

// TODO: extendClasses
js.lang.Class.extend = function(c, parents) {
    /** Invoked after constructor has been created. Cleans up prototypal 
        inheritance inconsistences, and maintains prototype-chain. **/
    var parent = (parents[0] || Object);

    js.lang.Class._extending = true;
    try {
        c.prototype = new parent();
    }
    finally {
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
    /** Merge all 'parents' into c.prototype. **/
    // TODO: this is repeated three times.. extract into generic extend!
    c.prototype = (parents[0] || {});

    if (parents.length > 1) {
        js.util.objectMergeAll(c.prototype, parents);
    }
};

js.lang.Class.invokeIfExists = function(context, func, args) {
    /** Attempt to call function if it's not a falsey value. **/
    if (Boolean(func) && (func.constructor === Function)) {
        return (func.apply(context, (args || [])));
    }
    return (undefined);
};

js.lang.Class.mergePrototypes = function(c, parents) {
    /** Merge all methods in prototypes of 'parents' into c.prototype **/
    for (var i = 0; i < parents.length; i++) {
        parents[i] = parents[i].prototype;
    }

    js.util.objectMergeAll(c.prototype, parents);
};

js.lang.Class.classInvokedWithGlobal = function(c, methods) {
    /** Handles dictionary of methods passed as class body. **/
    js.util.objectMergeAll(c.prototype, methods);

    if ('__implements__' in c) {
        js.lang.Interface.bindStubs(c, c.__implements__);
    }

    c.__initialized__ = true;

    return (c);
};


// Interface
js.lang.Interface = function(/* Parent, Parent, ... */) {
    /** Represents an interface to develop to. **/
    var c = js.lang.Class.generateClass(js.lang.Interface.interfaceInvokedWithGlobal);
    js.lang.Class.extendObjects(c, Array.apply([], arguments));
    return (c);
};

js.lang.Interface.METHOD_NOT_IMPLEMENTED = "Method '{name}' not implemented; desired signature: {name}({parameters}).";

// TODO: bindStub?
js.lang.Interface.bindStubs = function(c, interfaces) {
    /** Check whether c (class) has all committed methods. Log message if absent.
        Throw helpful error is still absent upon invocation. **/
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
    /** Generate a stub out of given dictionary. **/
    for (var s in stubs) {
        if (!stubs.hasOwnProperty(s)) {
            continue;
        }
        stubs[s] = js.lang.Interface.generateStub(s, stubs[s]);
    }

    return (stubs);
};

js.lang.Interface.generateStub = function(name, parameters) {
    /** Generate a stub out of given values. **/
    var stub = function() {
        throw new ReferenceError(stub.__message);
    };

    stub.__message = js.lang.Interface.generateStubMessage(name, parameters);
    stub.__parameters = parameters;

    return (stub);
};

js.lang.Interface.generateStubMessage = function(name, parameters) {
    /** Generate a stub message out of given values. **/
    return (js.lang.Interface.METHOD_NOT_IMPLEMENTED
        .replace(/\{name\}/g, name)
        .replace(/\{parameters\}/g, (parameters || []).join(', ')));
};

js.lang.Interface.interfaceInvokedWithGlobal = function(c, args) {
    /** Handles dictionary of stubs passed as class body. **/
    c.__initialized__ = true;

    var iface = new c();

    var stubs = {};
    js.util.objectMergeAll(stubs, [js.lang.Interface.generateStubs(args[0]), iface._stubs]);
    iface._stubs = stubs;

    return (iface);
};

// initialize settings/preferences
if (js.settings.globalClass) {
    Class = js.lang.Class;
}

if (js.settings.globalInterface) {
    Interface = js.lang.Interface;
}
