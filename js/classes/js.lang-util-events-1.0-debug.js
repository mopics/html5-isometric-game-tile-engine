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

js.util = (js.util || {});

//  TODO: <generics>
//  http://java.sun.com/j2se/1.4.2/docs/api/java/util/ArrayList.html
js.util.ArrayList = new js.lang.Class()  ({
    /** Utility class providing common java-like array-list functionality to help keep code D-R-Y. **/
    __init__ : function( array )  {
        /** Initializer for ArrayList **/
        this._array = (array ? array.slice() : []);
    },

    add : function( element )  {
        /** Add given element to this list. **/
        this._array.push( element );
    },

    addAll : function( collection )  {
        /** Add given collection of items to this list.
            (Collection being either another ArrayList or Dictionary, or a subclass of either.) **/
        var that = this;
        collection.iterate(function( k, v )  {
            that.add( v );
        });
    },

    clear : function()  {
        /** Clear contents of this list. **/
        this._array = [];
    },

    contains : function( element, comparator )  {
        /** Check if this list contains given element, 
            optionally using a callback to compare items. **/
        return( this.indexOf( element, comparator ) !== -1 );
    },

    containsAll : function( collection, comparator )  {
        /** Check if this list contains every item in given collection, 
            optionally using a callback to compare items. **/
        var that = this, containsAll = true;
        collection.iterate( function( k, v )  {
            if( ! that.contains( v, comparator ) )  {
                containsAll = false;
                return( true );
            }
        });
        return( containsAll );
    },
    
    get : function( index )  {
        /** Retrieve an item at given index. **/
        return( this._array[ index ] );
    },
    
    indexOf : function( element, comparator )  {
        /** Get the index the given element exists in this list,
            optionally using a callback to compare items. **/
        var index = -1, compare = this.getComparator( comparator );
        this.iterate( function( k, v )  {
            if( compare( element, v ) )  {
                index = k;
                return( true );
            }
        });
        return( index );
    },

    isEmpty : function()  {
        /** Check if this list contains zero elements. **/
        return( this._array.length === 0 );
    },
    
    removeAt : function( index )  {
        /** Remove element existing at given index in this list. **/
        this._array.splice( index, 1 );
    },

    remove : function( element, comparator )  {
        /** Remove given element from this list,
            optionally using a callback to compare items. **/
        var key, compare = this.getComparator( comparator );
        this.iterate( function( k, v )  {
            if( compare( element, v ) )  {
                key = k;
                return( true );
            }
        });
        this.removeAt( key );
    },

    removeAll : function( collection, comparator )  {
        /** Remove every item in given collection from this list,
            optionally using a callback to compare items. **/
        var that = this;
        collection.iterate( function( k, v )  {
            that.remove( v, comparator );
        });
    },

    retainAll : function( collection, comparator )  {
        /** Remove every item not in given collection from this list,
            optionally using a callback to compare items. **/
        var that = this;
        this.iterate( function( k, v )  {
            if( ! collection.contains( v, comparator ) )  {
                that.remove( v, comparator );
            }
        });
    },

    set : function( index, element )  {
        /** Assign given element at given index in this list. **/
        this._array[ index ] = element;
    },

    size : function()  {
        /** Retrieve the size of this list. **/
        return( this._array.length );
    },
    
    subList : function( fromIndex, toIndex )  {
        /** Retrieve an ArrayList containing references to elements 
            from given fromIndex to given toIndex. **/
        return( new js.util.ArrayList( this._array.slice( fromIndex, toIndex ) ) );
    },

    toArray : function()  {
        /** Retrieve an instance of Array containing the same list of references. **/
        return( this._array.slice() );
    },
    
    getComparator : function( comparator )  {
        /** Retrieve this instance's default comparator as fallback if given comparator is not defined. **/
        return( (comparator !== undefined) ? comparator : this._defaultComparator );
    },
    
    _defaultComparator : function( a, b )  {
        /** Default method of comparing two values within this list. **/
        return( a === b );
    },
    
    iterate : function( callback )  {
        /** Convenient, unified method of iterating elements in this list.
            This pattern is common to all collection classes. **/
        var array = this._array;
        for( var i = (array.length - 1); i >= 0; i-- )  {
            if( callback( i, array[ i ] ) )  {
                break;
            }
        }
    },
    
    reduce : function( callback )  {
        /** Reduce this list to a smaller list. Given callback is invoked for each element.
            The element is removed if given callback returns false value (false, null, undefined). **/
        var that = this;
        this.iterate( function( k, v )  {
            if( ! callback( k, v ) )  {
                that.removeAt( k );
            }
        });
    }
})
.Static({
    Iterate : function( list, callback )  {
        /** Iterate given list, invoking given callback for each element.
            Helper method to avoid the requirement to instantiate this class for one-off use-cases. **/
        js.util.ArrayList.prototype.iterate.call( { _array : list }, callback );
    }
});

js.util.Set = new js.lang.Class( js.util.ArrayList )  ({
    /** Utility class providing common java-like array-list functionality. 
        Elements are only added if they do not already exist within this list. **/
    __init__ : function( array )  {
        /** Initializer for Set. **/
        js.util.ArrayList.__init__.call( this );

        if( array )  {
            this.addAll( new js.util.ArrayList(array) );
        }
    },

    add : function( element, comparator )  {
        /** Add given element to this list if not already exists,
            optionally using a callback to compare items. **/
        if( ! this.contains( element, comparator ) )  {
            js.util.ArrayList.prototype.add.call( this, element );
        }
    },
    
    addAll : function( collection, comparator )  {
        /** Add given collection of items to this list if each not already exists.
            (Collection being either another ArrayList or Dictionary, or a subclass of either.) **/
        var that = this;
        collection.iterate(function( k, v )  {
            that.add( v, comparator );
        });
    }
});

js.util.Dictionary = new js.lang.Class()  ({
    /** Utility class providing common java-like dictionary functionality to help keep code D-R-Y. **/
    __init__ : function( map )  {
        /** Initializer for Dictionary **/
        this.clear();
        
        // NOTE: be very careful when using the constructor as a wrapper for an existing dictionary; 
        //   this action iterates the entire dictionary.
        if( map )  {
            this.putAll( map );
        }
    },
    
    clear : function()  {
        /** Clear contents of this dict. **/
        this._size = 0;
        this._dictionary = {};
    },

    containsKey : function( key )  {
        /** Check if given key exists in this dict. **/
        return( this._dictionary.hasOwnProperty( key ) );
    },
    
    containsValue : function( value )  {
        /** Check if given value exists in this dict. **/
        var key;
        this.iterate(function( k, v )  {
            if( value === v )  {
                key = k;
                return( true );
            }
        });
        return( key !== undefined );
    },
    
    entrySet : function()  {
        /** Retrieve a unique list of values from this dict. **/
        var items = [];
        //  acquire entries
        this.iterate(function( k, v )  {
            items.push( v );
        });
        return( new js.util.Set( items ) );
    },
    
    get : function( key )  {
        /** Retrieve value associated with given key. **/
        return( this._dictionary[ key ] );
    },
    
    isEmpty : function()  {
        /** Check if this dict contains zero elements. **/
        return( this.size() === 0 );
    },
    
    keySet  : function()  {
        /** Retrieve a unique list of keys from this dict. **/
        var keys = [];
        //  acquire entries
        this.iterate( function( k, v )  {
            keys.push( k );
        });
        return( new js.util.Set( keys ) );
    },
    
    put : function( key, value )  {
        /** Assign given value to given key within this dict. **/
        if( ! this._dictionary.hasOwnProperty( key ) )  {
            this._size++;
        }
        
        this._dictionary[ key ] = value;
        
        return( this );
    },
    
    putAll : function( map )  {
        /** Assign every value within given map to their associated keys, within this dict. **/
        var that = this;
        map.iterate( function( k, v )  {
            that.put( k, v );
        });
    },
    
    iterate : function( callback )  {
        /** Convenient, unified method of iterating elements in this dict.
            This pattern is common to all collection classes. **/
        var dictionary = this._dictionary;
        for( var property in dictionary )  {
            if( ! dictionary.hasOwnProperty( property ) )  { continue; }
            
            if( callback( property, dictionary[ property ] ) )  {
                break;
            }
        }
    },

    remove : function( key )  {
        /** Remove key from this dict. **/
        var success = false;
        if( this._dictionary.hasOwnProperty( key ) )  {
            success = delete( this._dictionary[ key ] );
            this._size--;
        }
        return( success );
    },
    
    size : function()  {
        /** Retrieve the size of this dict. **/
        return( this._size );
    },
    
    values : function()  {
        /** Retrieve a list of all values within this dict. **/
        var values = [];
        for( var key in this._dictionary )  {
            if( ! this._dictionary.hasOwnProperty( key ) )  { continue; }
            
            values.push( key );
        }
        return( new js.util.ArrayList( values ) );
    },
    
    clone : function()  {
        /** Retrieve a deep-clone (if values implement a clone method), of this dict. **/
        var dictionary = new js.util.Dictionary();
        this.iterate( function( k, v )  {
            dictionary.put( k, (v && (v.clone instanceof Function) ? v.clone() : v) );
        });
        return( dictionary );
    },
    
    toDict : function()  {
        /** Retrieve a deep-clone (if values implement a clone method), of 
            this dict as an Object rather than a Dictionary. **/
        return( this.clone()._dictionary );
    }
})
.Static({
    Iterate : function( dictionary, callback )  {
        /** Iterate given dict, invoking given callback for each element.
            Helper method to avoid the requirement to instantiate this class for one-off use-cases. **/
        js.util.Dictionary.prototype.iterate.call( { _dictionary : dictionary }, callback );
    },
    
    Iterator : function( dictionary )  {
        /** Retrieve an object which contains an 'iterate' method to be invoked at a later date. **/
        // TODO: implement full iterator capabilities.
        return({
            iterate : function( callback )  {
                js.util.Dictionary.prototype.iterate.call( { _dictionary : dictionary }, callback );
            }
        });
    }
});

js.events = (js.events || {});

js.events.EventDispatcher = new js.lang.Class()  ({
    /** Class which encapsulates logic for storing and notifying implicitl declared event-listeners. **/
    __init__ : function()  {
        /** Initializer for EventDispatcher **/
        this._eventListeners = new js.util.ArrayList();
    },
    
    addEventListener : function( listener )  {
        /** Add given listener to listeners. **/
        this._eventListeners.add( listener );
    },
    
    hasEventListener : function( listener )  {
        /** Check if this dispatcher already contains given listener. **/
        return( this._eventListeners.contains( listener ) );
    },
    
    removeEventListener : function( listener )  {
        /** Remove given listener from listeners, using a comparator. **/
        this._eventListeners.remove( listener, this._eventListenerComparator );
    },
    
    _eventListenerComparator : function( a, b )  {
        /** Default method of comparing two listeners; explicit, for the case where 
            this logic needs to be overriden in child classes. **/
        return( a === b );
    },
    
    dispatchEvent : function( evt, eventArgs )  {
        /** Notify all listeners that given event has occurred, relaying given arguments.
            Listener method-name must correspond to ('handle:' + event). **/
        //  TODO: event-args is extended and optional params are added on a per-type basis
        //  TODO: add CancelBubble (return false?  or throw new js.events.EventDispatcher.Events.CancelEvent())
        var dispatcher = this;
        var eventHandle = js.events.EventDispatcher.EVENT_HANDLE_PREFIX + 
                js.events.EventDispatcher.EVENT_HANDLE_SEPARATOR + evt;
        
        this._eventListeners.iterate( function( k, listener )  {
            if( (listener instanceof Object) && (eventHandle in listener) )  {
                listener[ eventHandle ]( dispatcher, eventArgs );
            }
        });
    }
})
.Static({
    EVENT_HANDLE_PREFIX : 'handle',
    EVENT_HANDLE_SEPARATOR : ':'
});
