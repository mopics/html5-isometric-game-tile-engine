if (! ('isogame' in this)) {
    this.isogame = {};
}

dojo.declare( 'isogame.TilePainter', null, {
	constructor:function( isomap, drawInfoCanvas )
	{
		this.cropChanged = true;
		this.drawInfoCanvas = drawInfoCanvas;
		this.map = isomap;
		this.image = isomap._image;
		this.floor = isomap._floorCanvas.getContext('2d');
		this.item  = isomap._itemCanvas.getContext('2d');
		if( isomap._infoCanvas )
			this.info  = isomap._infoCanvas.getContext('2d');
		this.bytes = isomap._bytes;
		this.slices = isomap._data.slices;
		this.crop   = isomap._crop;
		this.yCropTranslate = 0;
		this.xCropTranslate = 0;
		this.xCanvasTranslateAmount = 0;
		this.yCanvasTranslateAmount = 0;
		this.md = 0;//isomap._bytes.th;
		this.scrollShift = 0;
		this.prevDir = 0;
	},
	draw:function()
	{
		
	    if( this.cropChanged ) // if crop changed redraw floor-tiles also
		{
			//console.log("cropChanged!");
			this.floor.clearRect( 0,0,this.map._floorCanvas.width, this.map._floorCanvas.height );
			if( this.drawInfoCanvas ){
				this.info.clearRect( 0,0,this.map._infoCanvas.width, this.map._infoCanvas.height );
			}
		}
		//always redraw item-tiles & movable-sprites
		this.item.clearRect( 0,0,this.map._floorCanvas.width, this.map._floorCanvas.height );
		this.floor.restore();
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
					var x = coords.x- this.xCropTranslate;// + this.xMoveMapTranslate;
					var y = coords.y- this.yCropTranslate;// + this.yMoveMapTranslate;
					var f = this.bytes.getFloorId();
					var it= this.bytes.getItemId();
					
					if( this.cropChanged )
					{
						if( f>-1 )
							this._drawFloorTile(f,x,y);
						if( this.drawInfoCanvas )
							this._drawTileIdx( iy, ix, x, y );
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
		var xc = mx - this.xCropTranslate;// + this.xMoveMapTranslate;
		var yc = my - this.yCropTranslate;// + this.yMoveMapTranslate;
		m.draw( this.item, xc, yc );
	},
	
	/* All canvas.context translations must be done be this function! */
	setMapMoveTranslate:function( x, y )
	{
		/*
		this.floor.translate( x, y );
		this.item.translate( x, y );
		if( this.info )
			this.info.translate( x, y );
		*/
		this.xCanvasTranslateAmount += x;
		this.yCanvasTranslateAmount += y;
		//TODO pass canvas-id's to this class
		$("#floor").attr( "style", "position:absolute; top:"+this.yCanvasTranslateAmount+"px; left:"+this.xCanvasTranslateAmount+"px");
		$("#item").attr( "style", "position:absolute; top:"+this.yCanvasTranslateAmount+"px; left:"+this.xCanvasTranslateAmount+"px");
		if( this.drawInfoCanvas )
			$("#info").attr( "style", "position:absolute; top:"+this.yCanvasTranslateAmount+"px; left:"+this.xCanvasTranslateAmount+"px");
	},
	
	scroll:function( dir, m )
	{
		var d;
		var redraw = false;
		switch(dir)
		{
			case isogame.dirs.DOWN:
				this.crop.y -= 2;
				redraw = true;
				this.setMapMoveTranslate( 0, -this.yCanvasTranslateAmount );
				break;
			case isogame.dirs.UP:
				this.crop.y += 2;
				redraw = true;
				this.setMapMoveTranslate( 0, -this.yCanvasTranslateAmount );
				break;
			case isogame.dirs.LEFT:
				this.crop.x += 1;
				this.setMapMoveTranslate( -this.xCanvasTranslateAmount + this.md, 0 );
				redraw = true;
				break;
			case isogame.dirs.RIGHT:
				this.crop.x -= 1;
				this.setMapMoveTranslate( -this.xCanvasTranslateAmount + this.md, 0 );
				redraw = true;
				break;
			case isogame.dirs.RIGHT_DOWN:
				redraw = true;
				if(this.crop.y%2==0)
				{
					this.scrollShift = this.prevDir;
					d=1-this.prevDir;
					this.md = 0;
				}
				else
				{
					this.scrollShift = 0;
					d = 0;
					this.md = this.map._bytes.th;
				}
				this.setMapMoveTranslate( -this.xCanvasTranslateAmount + this.md, -this.yCanvasTranslateAmount );
				this.crop.x -= d;
				this.crop.y -= 1;
				this.prevDir = 0;
				break;
			case isogame.dirs.RIGHT_UP:
				redraw = true;
				if( this.crop.y%2==0 )
				{
					this.scrollShift = this.prevDir;
					d=1-this.prevDir;
					this.md = 0;
				}
				else
				{
					this.scrollShift = 0;
					d=0;
					this.md = this.map._bytes.th;
				}
				this.setMapMoveTranslate(  -this.xCanvasTranslateAmount + this.md, -this.yCanvasTranslateAmount );
				this.crop.x -= d;
				this.crop.y += 1;
				this.prevDir = 0;
				break;
			case isogame.dirs.LEFT_DOWN:
				redraw = true;
				if(this.crop.y%2==0)
				{
					this.scrollShift = this.prevDir;
					d = this.prevDir;
					this.md = 0;
				}
				else
				{
					this.scrollShift = 0;
					d = 0;
					this.md = -this.map._bytes.th;
				}
				this.setMapMoveTranslate( -this.xCanvasTranslateAmount + this.md, -this.yCanvasTranslateAmount );
				this.crop.x += d;
				this.crop.y -= 1;
				this.prevDir = 1;
				break;
			case isogame.dirs.LEFT_UP:
				redraw = true;
				if( this.crop.y%2==0 )
				{
					this.scrollShift = this.prevDir;
					d = this.prevDir;
					this.md = 0;
				}
				else
				{
					this.scrollShift = 0;
					d = 0;
					this.md = -this.map._bytes.th;
				}
				this.setMapMoveTranslate( -this.xCanvasTranslateAmount + this.md, -this.yCanvasTranslateAmount );
				this.crop.x += d;
				this.crop.y +=1;
				this.prevDir = 1;
				break;
		}
		this.xCropTranslate = this.crop.x * this.map._bytes.tw;
		this.yCropTranslate = this.crop.y * this.map._bytes.thh;
		
		if(redraw){
			this.cropChanged = true;
			this.draw();
		}
	}
});
