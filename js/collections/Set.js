dojo.require('collections.ArrayList');
dojo.provide('collections.Set');
dojo.declare('collections.Set', [collections.ArrayList] ,{
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