/**
 * Created with JetBrains WebStorm.
 * User: peter
 * Date: 4/18/13
 * Time: 4:34 PM
 * To change this template use File | Settings | File Templates.
 */

// 2 : isogame package


isogame.SpriteManager = (function(){
    function SpriteManager( isomap )
    {
        this.map = isomap;
        this.movables = new isogame.ArrayList(); // list of movable sprites on map
    }
    SpriteManager.prototype = {
        add:function( m )
        {
            this.movables.add( m );
        },
        remove:function( m )
        {
            this.movables.remove( m, this._movableComparator );
        },
        _movableComparator: function(a, b) {
            return (a === b);
        },
        update:function()
        {
            this.movables.iterate( function( k, m ) {
                m.update();
            });
        },
        switchRow:function( movable, ny)
        {
			movable.setYindex( ny );
			movable.setRelY( 0 );
            movable.setRelX( 0 );
        },
        switchCol:function( movable, nx )
        {
            movable.setXindex( nx );
            movable.setRelX( 0 );
        },
        switchColRow:function( movable, Yi, Xi )
        {
            movable.setYindex( Yi );
            movable.setXindex( Xi );
            movable.setRelX( 0 );
            movable.setRelY( 0 );
        },
        getMovablesInCropArea:function( crop )
        {
            /** Returns an 2d Object with movable references that reside in the given cropped area // crop = isogam.Rectangle **/
            var o = {};
            var curr;

			for( var i=0; i<this.movables._array.length; i++ ) {

				var m = this.movables._array[i];

				//if in crop
				if( m.Xindex>crop.x-2 && m.Xindex < crop.x+crop.width+2 && m.Yindex > crop.y-2 && m.Yindex<crop.y+crop.height+2 )
				{
					var yi = m.Yindex;
					var xi = m.Xindex;
					if( !o[yi] )
						o[yi] = {};
					if( !o[yi][xi] )
						o[yi][xi] = new Array();
					/** store movables in array at [yi][xi] in case more then one movable resides on the same tile	**/
					o[yi][xi].push(m);
				}

			}

            return o;
        }
    };
    return SpriteManager;
}());