if (! ('collections' in this)) {
    this.collections = {};
}

//  TODO: <generics>
//  http://java.sun.com/j2se/1.4.2/docs/api/java/util/ArrayList.html
dojo.declare( 'collections.ArrayList', null, {
    /** Utility class providing common java-like array-list functionality to help keep code D-R-Y. **/
	_array:null,
    constructor : function( array )  {
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
collections.ArrayList.Iterate = function( list, callback )  {
    /** Iterate given list, invoking given callback for each element.
        Helper method to avoid the requirement to instantiate this class for one-off use-cases. **/
    js.util.ArrayList.prototype.iterate.call( { _array : list }, callback );
};

dojo.declare('collections.Set', collections.ArrayList ,{
    /** Utility class providing common java-like array-list functionality. 
        Elements are only added if they do not already exist within this list. **/
    constructor : function( array )  {
        /** Initializer for Set. **/
        collections.ArrayList.constructor.call( this );

        if( array )  {
            this.addAll( new collections.ArrayList(array) );
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
