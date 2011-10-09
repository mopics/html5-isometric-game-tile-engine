js.util = (js.util || {});

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
