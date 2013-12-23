/**
 * isogame dependencies
 *
 ======== jQuery =============================
 <script type="text/javascript" charset="utf-8" src="js/utils/jquery-1.9.1.min.js"></script>
 <script type="text/javascript" charset="utf-8" src="js/utils/jquery-migrate-1.1.1.min.js"></script>

 ======== Create js ( createjs.com ) =========
 <script type="text/javascript" charset="utf-8" src="js/utils/easeljs-0.6.0.min.js"></script>
 <script type="text/javascript" charset="utf-8" src="js/utils/preloadjs-0.3.0.min.js"></script>

 ======= my own ooputils + puremvc ===========
 <script type="text/javascript" charset="utf-8" src="js/utils/ooputils.min.js"></script>
 <script type="text/javascript" charset="utf-8" src="js/utils/puremvc_multi_instance_purejs.min.js"></script>

 * @type {*|Object}
 */

// 1 : isogame package


var isogame = isogame || {};

isogame.compareArrays = function(a, b) {
    for (var i = 0; i < a.length; i++)
        if (a[i] != b[i]) return false;
    return true;
}
//  TODO: <generics>
//  http://java.sun.com/j2se/1.4.2/docs/api/java/util/ArrayList.html
isogame.ArrayList = (function(){
    function ArrayList( array )  {
        /** Initializer for ArrayList **/
        this._array = (array ? array.slice() : []);
    }
    ArrayList.prototype = {
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
    }

    return ArrayList;
}());

isogame.Set = (function(){ // extends ArrayList
    function Set( array )  {
        /** Initializer for Set. **/
        isogame.ArrayList.constructor.call( this );
        // call super constructor ??
        // collections.ArrayList.apply( this, arguments );

        if( array )  {
            this.addAll( new collections.ArrayList(array) );
        }
    }
    // inherit superclass stuff
    Set.prototype = ooputils.inherit( isogame.ArrayList.prototype );
    // use extend method to extend
    ooputils.extend( Set.prototype, {
        // overide constructor
        constructor:Set,
        // method overrides
        add : function( element, comparator )  {
            /** Add given element to this list if not already exists,
             optionally using a callback to compare items. **/
            if( ! this.contains( element, comparator ) )  {
                isogame.ArrayList.prototype.add.call( this, element );
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
    } );
    // own methods
    Set.prototype = {

    }

    return Set;
}());


isogame.Point = (function(){
    function Point( x, y )
    {
        if( typeof x!='undefined' )
            this.x = parseInt( x );
        if( typeof y!='undefined' )
            this.y = parseInt( y );
    }
    return Point;
    Point.prototype = {
        clone:function(){
            return new Point( this.x, this.y );
        }
    }
}());
isogame.Rectangle = (function(){
    function Rectangle( x, y, w, h ){
        if( typeof x!='undefined' )
            this.x = parseInt( x );
        if( typeof y!='undefined' )
            this.y = parseInt( y );
        if( typeof w!='undefined' )
            this.width = parseInt( w );
        if( typeof h!='undefined' )
            this.height = parseInt( h );
    }
    return Rectangle;
}());

isogame.Constants = (function(){
    function Constants(){};
    Constants.errors = {
        INVALID_SPRITE_XML:'not a valid XML-sprite file',
        SPITE_MOVE_SPEED_ODD:"Movespeed is unacceptable",
        SCROPPED_SPRITE_NO_MAP_CROP:'Use of the CroppedSpriteMover will cause problems whenn cropRect of IsoMap is not defined'
    };
    Constants.dirs = {
        DOWN:0,
        LEFT_DOWN:1,
        LEFT:2,
        LEFT_UP:3,
        UP:4,
        RIGHT_UP:5,
        RIGHT:6,
        RIGHT_DOWN:7
    };
	Constants.getAdjescentTiles = function( Y, X ){
		var tiles = [
			[ Y - 2, X ], // up
            [ Y + 2, X ],// down
            [ Y, X - 1 ], // left
            [ Y, X + 1 ], // right
			[ Y - 1, X ], // rightup
			[ Y - 1, X ], // leftup
			[ Y + 1, X ], // rightdown
			[ Y + 1, X ], // leftdown
		];
		if( Y%2==0 ){ // Y == even
			tiles[4][1] ++ ;// update rightup X
			tiles[6][1] ++; // update rightdown X
		}
		else { //  Y == odd
			tiles[5][1] --; // update leftup X
			tiles[7][1] --; // update leftdown X	
		}
		return tiles;
	};
	Constants.getAdjescentTile = function( Y, X, dir ){
		var d = Constants.dirs;
		var t = [ Y, X ];
		switch( dir ){
			case d.UP:
				t[0] -= 2;break;
			case d.DOWN:
				t[0] += 2;break;
			case d.LEFT:
				t[1] --; break;
			case d.RIGHT:
				t[1] ++; break;
			case d.RIGHT_UP:
				t[0] --;
				if( Y%2==0 ){ t[1]++; }
				break;
			case d.LEFT_UP:
				t[0] --;
				if( Y%2 ){ t[1]--; }
				break;
			case d.RIGHT_DOWN:
				t[0] ++;
				if( Y%2==0 ){ t[1]++; }
				break;
			case d.LEFT_DOWN:
				t[0] ++;
				if( Y%2 ){ t[1] --; }
				break;
		}
		return t;
	};
    return Constants;
}());