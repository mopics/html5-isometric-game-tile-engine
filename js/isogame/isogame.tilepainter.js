Class = js.lang.Class;

if (! ('isogame' in this)) {
    this.isogame = {};
}

isogame.TilePainter = new Class()({
	__init__:function( isomap )
	{
		this.cropChanged = true;
		this.map = isomap;
		this.image = isomap._image;
		this.floor = isomap._floorCanvas.getContext('2d');
		this.item  = isomap._itemCanvas.getContext('2d');
		this.info  = isomap._infoCanvas.getContext('2d');
		this.bytes = isomap._bytes;
		this.slices = isomap._data.slices;
		this.ycropadjust = 0;
		this.xcropadjust = 0;
		this.ymovemapadjust = 0;
		this.xmovemapadjust = 0;
	},
	draw:function()
	{
		if( this.cropChanged ) // if crop changed redraw floor-tiles also
		{
			this.floor.clearRect( 0,0,this.map._floorCanvas.width, this.map._floorCanvas.height );
		}
		//always redraw item-tiles & movable-sprites
		this.item.clearRect( 0,0,this.map._floorCanvas.width, this.map._floorCanvas.height );
		var s;
		var crop = this.map._crop;
		//get movables residing in cropped area in a multidimensional array 
		var movables = this.map._spriteManager.getMovablesInCropArea( crop );
		//draw graphics residing in cropped area
		for( var iy = crop.y-2; iy<crop.height+crop.y+2; iy++ )
		{
			for( var ix=crop.x-2;ix<crop.width+crop.x+2; ix++ )
			{
				if( this.bytes.tileExcists(iy,ix)==true )
				{
					this.bytes.movePosTo(iy,ix);
					var coords = this.bytes.getCoords();
					//var z = coords.z;
					var x = coords.x- this.xcropadjust + this.xmovemapadjust;
					var y = coords.y- this.ycropadjust + this.ymovemapadjust;
					var f = this.bytes.getFloorId();
					var it= this.bytes.getItemId();
					
					if( this.cropChanged )
					{
						if(f>-1)
							this._drawFloorTile(f,x,y);
							
							//this._drawTileIdx( iy, ix, x, y );
					}
					if(it>-1)
						this._drawItemTile(it,x,y);
					
					
				} else {
					//trace("unable to draw tile : ix = "+ix+", y = "+iy);
				}
				
			}
			//Draw movables per row
			if( typeof movables[iy] != 'undefined' )
			{
				var a = movables[iy];
				for( var xi in a )
				{
					var ms = a[xi];
					for( var i=0; i< ms.length; i++ )
						this._drawMovable( ms[i] );
				}
			}
		}
		this.cropChanged = false;
	},
	_drawFloorTile:function( id, x, y )
	{
		if(!this.slices[id]) return;
		var slice = this.slices[id];
		this.floor.drawImage( this.image, slice._x, slice._y, slice._w, slice._h, x, y, slice._w, slice._h );
	},
	_drawItemTile:function( id, x, y )
	{
		if(!this.slices[id]) return;
		var slice = this.slices[id];
		this.item.drawImage( this.image, slice._x, slice._y, slice._w, slice._h, x+slice._ox, y+slice._oy, slice._w, slice._h );
	},
	_drawTileIdx:function( Yi, Xi, x, y )
	{
		this.info.fillStyle = '#ffffff';
		pixfonts.drawNumber( this.info, Yi, x+this.bytes.th-5, y+this.bytes.thh-3);
		this.info.fillRect( x+this.bytes.th, y+this.bytes.thh, 1, 1 );
		pixfonts.drawNumber( this.info, Xi, x+this.bytes.th+1, y+this.bytes.thh-3 );
	},
	_drawMovable:function( m )
	{
		if( typeof m == 'undefined' ) return;
		var mxi = m.Xindex;
		var myi = m.Yindex;
		this.bytes.movePosTo( m.Yindex, m.Xindex );
		var tilecoords = this.bytes.getCoords();
		var mx = tilecoords.x  + m.relX + this.bytes.th;
		var my = tilecoords.y  + m.relY + this.bytes.thh;
		var xc = mx - this.xcropadjust + this.xmovemapadjust;
		var yc = my - this.ycropadjust + this.ymovemapadjust;
		m.draw( this.item, xc, yc );
	},
	mapUp:function( y )
	{
		this.yMoveAdjust += y;
	},
	mapDown:function( y )
	{
		this.yMoveAdjust -= y;
		
	},
	mapLeft:function( x )
	{
		this.xMoveAdjust += x;
	},
	mapRight:function( x )
	{
		this.xMoveAdjust -= x;
	},
	mapLeftUp:function( x, y )
	{
		this.yMoveAdjust += y;
		this.xMoveAdjust += x;
	},
	mapLeftDown:function( x, y )
	{
		this.yMoveAdjust -= y;
		this.xMoveAdjust += x;
	},
	mapRightUp:function( x, y )
	{
		this.yMoveAdjust += y;
		this.xMoveAdjust -= x;
	},
	mapRightDown:function( x, y )
	{
		this.yMoveAdjust -= y;
		this.xMoveAdjust -= x;
	}
});
