// namespace:
this.isogame = this.isogame || {};

/* ::: Dependencies :::

in this order !!

jquery-latest.js
ooputils.js
collections.js

*/

/** CORE **/
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
	return Constants;
}());
isogame.SpriteManager = (function(){
	function SpriteManager( isomap )
	{
		this.map = isomap;
		this.movables = new collections.ArrayList(); // list of movable sprites on map
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
			movable.Yindex = ny;
			movable.relY = 0;
		},
		switchCol:function( movable, nx )
		{
			movable.Xindex = nx;
			movable.relX = 0;
		},
		switchColRow:function( movable, Yi, Xi )
		{
			movable.Yindex = Yi;
			movable.Xindex = Xi;
			movable.relX = 0;
			movable.relY = 0;
		},
		getMovablesInCropArea:function( crop ) 
		{
			/** Returns an 2d Object with movable references that reside in the given cropped area // crop = isogam.Rectangle **/
			var o = {};
			var curr;

			this.movables.iterate( function( k, m ) {
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
			});

			return o;
		}
	};
	return SpriteManager;
}());
isogame.TilePainter = (function(){
	function TilePainter( isomap, drawInfoCanvas )
	{
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
        if( this.map._crop ){
            this.scroll( isogame.Constants.dirs.DOWN );

        }
        this.cropChanged = true;
	}
	TilePainter.prototype = {
        drawUnCroppedMap:function(){
            if( this.cropChanged ) // if crop changed redraw floor-tiles also
            {
               this.floor.clearRect( 0,0,this.map._floorCanvas.width, this.map._floorCanvas.height );
                if( this.drawInfoCanvas ){
                    this.info.clearRect( 0,0,this.map._infoCanvas.width, this.map._infoCanvas.height );
                }
            }
            //always redraw item-tiles & movable-sprites
            this.item.clearRect( 0,0,this.map._floorCanvas.width, this.map._floorCanvas.height );

            var movables = this.map._spriteManager.getMovablesInCropArea( new isogame.Rectangle( 0,0, this.bytes.data.cols, this.bytes.data.rows ) );
            //draw graphics residing in cropped area
            for( var iy = 0; iy<this.bytes.data.rows; iy++ )
            {
                for( var ix=0;ix<this.bytes.data.cols; ix++ )
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
		draw:function()
		{
            if( !this.map._crop ){ this.drawUnCroppedMap(); return; }
            if( this.cropChanged ) // if crop changed redraw floor-tiles also
			{
				this._updateCropTranslate();
				// console.log("cropChanged!");
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
			isogame.TilePainter.drawNumber( this.info, Yi, x+this.bytes.th-5, y+this.bytes.thh-3, true );
			this.info.fillRect( x+this.bytes.th, y+this.bytes.thh, 1, 1 );
			isogame.TilePainter.drawNumber( this.info, Xi, x+this.bytes.th+1, y+this.bytes.thh-3 );
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
				case isogame.Constants.dirs.DOWN:
					this.crop.y -= 2;
					redraw = true;
					this.setMapMoveTranslate( 0, -this.yCanvasTranslateAmount );
					break;
				case isogame.Constants.dirs.UP:
					this.crop.y += 2;
					redraw = true;
					this.setMapMoveTranslate( 0, -this.yCanvasTranslateAmount );
					break;
				case isogame.Constants.dirs.LEFT:
					this.crop.x += 1;
					this.setMapMoveTranslate( -this.xCanvasTranslateAmount + this.md, 0 );
					redraw = true;
					break;
				case isogame.Constants.dirs.RIGHT:
					this.crop.x -= 1;
					this.setMapMoveTranslate( -this.xCanvasTranslateAmount + this.md, 0 );
					redraw = true;
					break;
				case isogame.Constants.dirs.RIGHT_DOWN:
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
				case isogame.Constants.dirs.RIGHT_UP:
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
				case isogame.Constants.dirs.LEFT_DOWN:
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
				case isogame.Constants.dirs.LEFT_UP:
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
			// cropTranslate set in draw-method via : _updateCropTranslate-method if cropChanged == true

			if(redraw){
				this.cropChanged = true;
				this.draw();
			}
		},
		_updateCropTranslate:function(){
			this.xCropTranslate = this.crop.x * this.map._bytes.tw;
			this.yCropTranslate = this.crop.y * this.map._bytes.thh;
		}
	}
	return TilePainter;
}());
isogame.TilePainter.drawNumber = function( bd, nr, x, y, alignleft ){
	var i;
    if( nr > 9 ){
        var nrstr = "";
        nrstr += nr;
        var w = 5;
        var xadjust = 0;
        if( alignleft )
            xadjust = -(nrstr.length-1)*w;
        for( var i=0; i<nrstr.length; i++ ){
            isogame.TilePainter.drawNumber( bd, parseInt(nrstr.charAt(i)), x+xadjust+(i*w), y );
        }
        return;
    }
	switch( nr )
	{
		case 0:
			for( i=0; i<5; i++ )
			{
				bd.fillRect( x+1, y+i,1,1 );
				bd.fillRect( x+3, y+i,1,1 );
			}
			bd.fillRect( x+2, y , 1, 1 );
			bd.fillRect( x+2, y+4, 1,1 );
			break;
		case 1:
			for( i=0; i<5; i++ )
			{
				bd.fillRect( x+2, y+i,1,1 );
			}
			bd.fillRect( x+1, y , 1, 1 );
			bd.fillRect( x+3, y+4, 1,1 );
			bd.fillRect( x+1, y+4, 1,1 );
			break;
		case 2:
			for( i=1; i<4; i++ )
			{
				bd.fillRect( x+i, y,1,1 );
				bd.fillRect( x+i, y+2,1,1 );
				bd.fillRect( x+i, y+4,1,1 );
			}
			bd.fillRect( x+3, y+1 , 1, 1 );
			bd.fillRect( x+1, y+3, 1,1 );
			break;
		case 3:
			for( i=1; i<4; i++ )
			{
				bd.fillRect( x+i, y,1,1 );
				bd.fillRect( x+i, y+2,1,1 );
				bd.fillRect( x+i, y+4,1,1 );
			}
			for( i=0;i<5; i++ )
			{
				bd.fillRect( x+3, y+i,1,1 );
			}
			break;
		case 4:
			bd.fillRect( x+1, y,1,1 );
			bd.fillRect( x+1, y+1,1,1 );
			bd.fillRect( x+1, y+2,1,1 );
			bd.fillRect( x+2, y+2,1,1 );
			for( i=0;i<5; i++ )
			{
				bd.fillRect( x+3, y+i,1,1 );
			}
			break;
		case 5:
			for( i=1; i<4; i++ )
			{
				bd.fillRect( x+i, y,1,1 );
				bd.fillRect( x+i, y+2,1,1 );
				bd.fillRect( x+i, y+4,1,1 );
			}
			bd.fillRect( x+1,y+1,1,1);
			bd.fillRect( x+3,y+3,1,1);
			break;
		case 6:
			for( i=1; i<4; i++ )
			{
				bd.fillRect( x+i, y,1,1  );
				bd.fillRect( x+i, y+2,1,1 );
				bd.fillRect( x+i, y+4,1,1);
			}
			for( i=0;i<5; i++ )
			{
				bd.fillRect( x+1, y+i,1,1 );
			}
			bd.fillRect( x+3,y+3,1,1 );
			break;
		case 7:
			for( i=1; i<4; i++ )
			{
				bd.fillRect( x+i, y,1,1 );
			}
			for( i=0;i<5; i++ )
			{
				bd.fillRect( x+3, y+i,1,1 );
			}
			break;
		case 8:
			for( i=1; i<4; i++ )
			{
				bd.fillRect( x+i, y,1,1 );
				bd.fillRect( x+i, y+2,1,1 );
				bd.fillRect( x+i, y+4,1,1 );
			}
			for( i=0;i<5; i++ )
			{
				bd.fillRect( x+3, y+i,1,1 );
				bd.fillRect( x+1, y+i,1,1 );
			}
			break;
		case 9:
			for( i=1; i<4; i++ )
			{
				bd.fillRect( x+i, y,1,1 );
				bd.fillRect( x+i, y+2,1,1 );
				bd.fillRect( x+i, y+4,1,1 );
			}
			for( i=0;i<5; i++ )
			{
				bd.fillRect( x+3, y+i,1,1 );
			}
			bd.fillRect( x+1,y+1,1,1 );
			break;
	}
}

isogame.MapBytes = (function(){
	function MapBytes( data ){
		//constructor
		this.data = data;
		this.actions = [];
		this.passActions = [];
		this.obstructs = [];
        this.dirLocks = [];
		this.coords = [];
		this.floorIds = [];
		this.itemIds = [];
		this.mapIndexes = [];
		
		
		this.position = 0;
		this.tw = this.data.tileWidth;
		this.th = this.tw/2;
		this.thh = this.th/2;
		this._createBytes();
	}
	MapBytes.prototype = {
		_createBytes:function()
		{
			// create empty tile bytes 
			for(var yi=0; yi<this.data.rows; yi++)
			{
				if( yi!=0 )//dont create top tiles
				{
					for(var xi=0;xi<this.data.cols;xi++)
					{
						var addX=0;
						if(yi%2==0)
							addX = this.tw/2;
						if( xi==0 && addX==0  ) {
							//dont create left-side tiles
						} 
						else
						{
							//TODO create tile
							var rX = xi*this.tw + addX;
							var rY = yi*(this.tw/4);
							//this.writeBoolean(false); // default is set to not active
							this.actions.push(-1); // actionId
							this.passActions.push(-1); // passActionId
						
							this.obstructs.push( true ); // obstruct 
							//this.writeBoolean(false);// char busy
							//this.writeBoolean(false);// switchfast
							//dirs - locks
                            this.dirLocks.push( // same indexes as Constants.dirs
                                [
                                    false, //down
                                    false, // left-down
                                    false, // left
                                    false, // left_up
                                    false, // up
                                    false, // right-up
                                    false, // right
                                    false // right-down
                                ]
                            );
							//coords
							this.coords.push({x:rX,y:rY,z:-1}); // x, y, z
							//graphics
							this.floorIds.push(-1); // floor  layer
							//this.writeInt(-1); // floor2 layer
							this.itemIds.push(-1); // item   layer
							//draw style , placing
							//this.writeInt(-1);
							//this.writeInt(-1);
							//indexes
							this.mapIndexes.push({y:yi,x:xi});
						}
					}
				}
			}
			// fill created empty tiles with tile-data
			for( var i=0; i<this.data.tiles.length; i++ )
			{
				var tile = this.data.tiles[i];
				this.movePosTo( tile._yindex, tile._xindex );
				if( typeof tile._floorid != 'undefined' )
				    this.floorIds[this.position] = tile._floorid;
				if( typeof tile._itemid != 'undefined' )
				    this.itemIds[this.position]  = tile._itemid;
				if( typeof tile._action != 'undefined' )
					this.actions[this.position]  = tile._action;
				if( typeof tile._passaction != 'undefined' )
					this.passActions[this.position] = tile._passaction;

                this.obstructs[this.position]=false;
				if( typeof tile._obstruct != 'undefined' ){
                    //console.log( 'MapBytes.fillbytes obsctruct is '+tile._obstruct+' for:'+tile._yindex+'>'+tile._xindex );
					this.obstructs[this.position] = tile._obstruct;
                }
			}
		},
		tileExcists:function( Y, X )
		{
			if(Y>this.data.rows-1 || Y<1 || (Y%2==1 && X>this.data.cols-1) || X>this.data.cols-1 || (Y%2==1 && X==0) || X<1 )
				return false;
			else
				return true;
		},
		movePosTo:function( Y, X )
		{
			if( Y%2==1  )
			{
				X --;
			}
			Y--;
			//calc how many missing X'ses to substract from X
			var missingXses = Math.round(Y/2);
			X -= missingXses;
			var pos = this.data.cols*Y + X;
			this.position = this.data.cols*Y + X;
		},
        getTileVo:function(){
            var vo = {};
            vo.dirs = this.dirLocks[this.position];
            vo.floorId = this.floorIds[this.position];
            vo.itemId = this.itemIds[this.position];
            vo.action = this.actions[this.position];
            vo.passAction = this.passActions[this.position];
            vo.obstruct = this.obstructs[this.position];
            vo.x = this.coords[this.position].x;
            vo.y = this.coords[this.position].y;
            vo.z = this.coords[this.position].z;
            vo.xi = this.mapIndexes[this.position].x;
            vo.yi = this.mapIndexes[this.position].y;
            return vo;
        },
        getDirLocks:function(){
            return this.dirLocks[this.position];
        },
		getFloorId:function()
		{
			return this.floorIds[this.position];
		},
		getItemId:function()
		{
			return this.itemIds[this.position];
		},
		getAction:function()
		{
			return this.actions[this.position];
		},
		getPassAction:function()
		{
			return this.passActions[this.position];
		},
		getObstruct:function()
		{
			return this.obstructs[this.position];
		},
		getCoords:function()
		{
			return this.coords[this.position];
		},
		getIndexes:function()
		{
			return this.mapIndexes[this.position];
		},
		isWalkable:function( Y, X ){
			var te = this.tileExcists( Y,X );
			this.movePosTo(Y,X);
			var ob = this.obstructs[this.position];
		
			if( !this.tileExcists( Y,X ) ) return false;
			this.movePosTo(Y,X);
			return !this.obstructs[this.position];
		}
	}
	
	return MapBytes;
}());
isogame.Mouse2Tile = (function(){
	function Mouse2Tile( tw, rows, cols, canvas ) {
		this.TOPLEFT = "#ff0000";
		this.TOPRIGHT = "#00ff00";
		this.cols = cols;
		this.rows = rows;
		this.tw = tw;
		this.th = this.tw/2;
		this.thh = this.th/2;
        this.canvas = canvas;
		this.context = canvas.getContext('2d');
        // this.context.globalAlpha = 0;
		
		//TODO: draw topleft triangle
        this.context.fillStyle = "#000000";
        this.context.fillRect(0,0,this.tw, this.th );

        this.context.fillStyle = this.TOPLEFT;
        this.context.beginPath();
        this.context.moveTo(this.th,0);
        this.context.lineTo( 0,this.thh );
        this.context.lineTo( 0, 0 );
        this.context.closePath();
		//context.stroke();
        this.context.fill();
        this.context.fillStyle = this.TOPRIGHT;
        this.context.beginPath();
        this.context.moveTo(this.th,0);
        this.context.lineTo( this.tw,this.thh );
        this.context.lineTo( this.tw, 0 );
        this.context.closePath();
        this.context.fill();
        this.context.fillStyle = this.BOTLEFT;
        this.context.beginPath();
        this.context.moveTo(this.th,this.th);
        this.context.lineTo( 0,this.thh );
        this.context.lineTo( 0, this.th );
        this.context.closePath();
        this.context.fill();
        this.context.fillStyle = this.BOTRIGHT;
        this.context.beginPath();
        this.context.moveTo(this.th,this.th);
        this.context.lineTo( this.tw,this.thh );
        this.context.lineTo( this.tw, this.th );
        this.context.closePath();
        this.context.fill();
	}
	Mouse2Tile.prototype = {
		getIndexes:function( xm, ym, map ) { // returns isogame.Point containing tile map-indexes
			var fyIsOdd = false;
		
			var yr  = (ym)%this.thh;
			var fmy = (ym)-yr;
			var fy  = Math.round((fmy)/this.thh);

            var xr  = (xm)%this.tw;
            var fmx = (xm)-xr;
			var fx  = Math.round(fmx/this.tw);

            if( fy%2==1 ){
                fyIsOdd = true;
            }
            else {
                if( xr>this.th )
                    fmx += this.th;
                else {
                    fmx -= this.th;
                    fx -= 1;
                }
            }

            // console.log( 'Mouse2Tile.getIndexes first try:='+fy+"."+fx );
            // $('#m2t').attr( "style", "position:absolute; top:"+fmy+"px; left:"+fmx+"px");

            //to do check trhu bmp
            var py = ym - fmy;
            var px = xm - fmx;

            // TOT hier klopt alles!!!!


            // TODO: use Mathmatics in stead of pixel color to determin Topleft || Top Right


            var imgd = this.context.getImageData( px, py, 1, 1 );
			var c = imgd.data;
            // console.log( 'Mouse2Tile.color.length='+ c[0]+","+c[1]+","+c[2] );


            if( c[0]>130 ) {
                // console.log( "pixelClr is topleft");
                if(fyIsOdd){
                    fx -= 1;
                }
                fy -= 1;
			}
            else if( c[1]>130 ){
                // console.log( "pixelClr is topright");
                if( !fyIsOdd )
                    fx += 1;
                fy -= 1;
            }
			//to do check wether index exists
	//			if(fy%2==1 && fx==0)
	//				return null;
	//			if( fy==0 || fx > cols-1 || fy>rows-1)
	//				return null;
			// reverse : from indexes to pix coords
		
			return new isogame.Point(fx,fy);
		},
        converRGB2String:function RGB2HTML(red, green, blue)
        {
            var decColor = red + 256 * green + 65536 * blue;
            return "#"+decColor.toString(16);
        }
    };
	return Mouse2Tile;
}());
isogame.IsoMap = (function(){
	function IsoMap( mapData, cropRect, floorCanvas, itemCanvas, m2tCanvas, mouseLyr, infoCanvas ){
		this._data = mapData;
		this._bytes = new isogame.MapBytes( mapData );
		this._crop = cropRect;
		this._floorCanvas = floorCanvas;
		this._itemCanvas = itemCanvas;
		this._infoCanvas = infoCanvas;
		this._m2tCanvas = m2tCanvas;
        this._mouseLyr = mouseLyr;
        var cxt = mouseLyr.getContext( '2d' );
        cxt.fillRect( 0,0,cxt.width, cxt.height );
		this._m2t = new isogame.Mouse2Tile( mapData.tileWidth, mapData.rows, mapData.cols, m2tCanvas );
		this._image = new Image();
		this._spriteManager = new isogame.SpriteManager( this );
		this._tilePainter = new isogame.TilePainter( this, this._infoCanvas!=null );
		this._firstPerson = null; // to be set
	}
	IsoMap.prototype =  {
		setup:function(){
			// load map graphics
			this._imageLoaded = false;
	        var self = this;
	        this._image.onload = function()
	        {
	            self._imageLoaded = true;
				self.onReady();
	        }
	        this._image.src = this._data.image;
		},
		addMovable:function( m, xi, yi, moveSpeed )
		{
			m.initialYindex = m.Yindex = yi;
			m.initialXindex = m.Xindex = xi;
			this._spriteManager.add( m );
		},
		onReady:function(){ /** old-school event-listener **/ },
		//update data
		update:function(){
			this._spriteManager.update();
		},
		//draw data
		draw:function( drawInfoCanvas ){
			this._tilePainter.draw( drawInfoCanvas );
		}
	}
	return IsoMap;
}());

/** SPRITES **/
// isometric sprite sheets
isogame.AIsoSheet = (function(){
	function AIsoSheet( sheet, ox, oy )
	{
		this._visible = true;
		this._stopped = true;
		this._ox = ox;
		this._oy = oy;
		this._dir = 0;
		this._sheet = sheet;
		this._currFrame = 0;
		this._prevFrame = 0;
		this._currDir = 0;
	}
	AIsoSheet.prototype = {
		draw:function( context, ox, oy )
		{
			// override by sub-class
		},
		setVisible:function( v )
		{
			this._visible = v;
		},
		getVisible:function()
		{
			return this._visible;
		},
		gotoAndStop:function(fr)
		{
			if(fr<this._sheet.frames.length)
				this._currFrame = fr;
			this._stopped = true;
		},
		gotoAndPlay:function(fr)
		{
			if(fr<this._sheet.frames.length)
				this._currFrame = fr;
			this._stopped = false;
		},
		play:function()
		{
			this._stopped = false;
		},
		stop:function()
		{
			this._stopped = true;
		},
		setDirection:function(d)
		{
			this._currDir = d;
		}
	};
	return AIsoSheet;
}());
isogame.IsoAnimationSheet = (function(){  // extends isogame.AIsoSheet
	function IsoAnimationSheet( sheet, ox, oy, framesPerDir )
	{
		// call super constructor !!
        isogame.AIsoSheet.apply( this, arguments );
		this._framesPerDir = framesPerDir;
	}
	// inherit superclass stuff
    IsoAnimationSheet.prototype = ooputils.inherit( isogame.AIsoSheet.prototype );
    // use extend method to extend
    ooputils.extend( IsoAnimationSheet.prototype, {
        // overide constructor
        constructor:IsoAnimationSheet,
        // method overrides
        draw:function( context, ox, oy )
		{
			if ( !this._visible  )
				return;
			var rect = this._sheet.getFrameData( this._currDir* this._framesPerDir+ this._currFrame );
			ox += this._ox;
			oy += this._oy;
			context.drawImage( this._sheet._image, rect.x, rect.y, rect.width, rect.height, ox, oy, rect.width, rect.height );
		}
    } );
	// own methods
	IsoAnimationSheet.prototype.update = function()
	{
		if(!this._stopped)
		{
			this._prevFrame = this._currFrame;
			if( this._currFrame < this._framesPerDir-1 )
			{
				this._currFrame++;
			}
			else
			{
				this._currFrame=0;
			}
		}
	}
	return IsoAnimationSheet;
}());
isogame.IsoStillSheet = (function(){ // extends isogame.AIsoSheet
	function IsoStillSheet ( sheet, ox, oy ){
		// call super constructor !!
        isogame.AIsoSheet.apply( this, arguments );
	}
	// inherit superclass stuff
    IsoStillSheet.prototype = ooputils.inherit( isogame.AIsoSheet.prototype );
    // use extend method to extend
    ooputils.extend( IsoStillSheet.prototype, {
        // overide constructor
        constructor:IsoStillSheet,
        // method overrides
        draw:function( context, ox, oy )
		{
			if ( !this._visible )
				return;
			var rect = this._sheet.getFrameData( this._currDir );
			ox += this._ox;
			oy += this._oy;
			context.drawImage( this._sheet._image, rect.x, rect.y, rect.width, rect.height, ox, oy, rect.width, rect.height );
		}
    } );
	
	return IsoStillSheet;
}());
isogame.PngSheet = (function(){
    function PngSheet(src, sliceRect)
    {
        this._src = src;
        this._rect = sliceRect;
        //Load the image object in JS, then apply to canvas onload
        this._image = new Image();
        this._imageLoaded = false;
        var self = this;
        this._image.onload = function()
        {
            self._imageLoaded = true;
			self._sliceImage();
            self.onReady();
        }
        this._image.src = src;
        this.frames = new Array();
    }
	PngSheet.prototype = {
	    _sliceImage: function()
	    {
	        var nx = 0;
	        var ny = 0;
		
	        while ( ny < this._image.height)
	        {
	            while (nx < this._image.width)
	            {
	                this.frames.push( new isogame.Rectangle( nx, ny, this._rect.width, this._rect.height ) );
	                nx += this._rect.width;
	            }
	            ny += this._rect.height;
	            nx = 0;
	        }
	    },
		getFrameData:function( f )
		{
			if( f <= this.frames.length && f>0 )
			{
				return this.frames[ f ];
			}
			return this.frames[ 0 ];
		},
	    //one-per-object event functions
	    onReady: function() {}
	};
	return PngSheet;
}());
// isometric movable sprites
isogame.Movable = (function(){
	function Movable() {
		this.animatedSprites = new Array();
		this.stillSprites = new Array();
		this.displayList = new Array();
		this.relX = 0;
		this.relY = 0;
		this.initialXindex = 0;
		this.initialYindex = 0;
		this.Xindex = 0;
		this.Yindex = 0;
		this.mover = null;
		this.direction = 0;
        this.pathfinder = null;
	}
	Movable.prototype = {
		addAnimatedSpriteSheet:function( sheet )
		{
			this.animatedSprites.push( sheet );
			this.displayList.push( sheet );
		},
		addStillSpriteSheet:function( sheet )
		{
			this.stillSprites.push( sheet );
			this.displayList.push( sheet );
		},
		update:function()
		{
			this.mover.update();
			for( var i=0; i<this.animatedSprites.length; i++ )
			{
				this.animatedSprites[i].update();
			}
		},
		draw:function( context, x, y )
		{
			for( var i=0; i<this.displayList.length; i++ )
			{
				this.displayList[i].draw( context, x, y );
			}
		},
		gotoAndStop:function(fr)
		{
			for( var i=0; i<this.animatedSprites.length; i++ )
			{
				this.animatedSprites[i].gotoAndStop( fr );
			}
		},
		gotoAndPlay:function(fr)
		{
			for( var i=0; i<this.animatedSprites.length; i++ )
			{
				this.animatedSprites[i].gotoAndPlay( fr );
			}
		},
		play:function()
		{
			for( var i=0; i<this.animatedSprites.length; i++ )
			{
				this.animatedSprites[i].play();
			}
		},
		stop:function(){
			for( var i=0; i<this.animatedSprites.length; i++ )
			{
				this.animatedSprites[i].stop();
			}
		},
		setDirection:function( dir )
		{
			this.direction = dir;
			for( var i=0; i<this.displayList.length; i++ )
			{
				this.displayList[i].setDirection(dir);
			}
		},
		getDirection:function() { return this.direction; },
		asignMover:function( mover ){  this.mover = mover; },
		getMover:function(){  return this.mover; },
        // Walk path methods ( using AStar )
        walkPathTo:function( yi, xi ){
            this.pathfinder = new isogame.AStar( this._bytes, this.Yindex, this.Xindex, yi, xi, 265 );
        }
	};
	return Movable;
}());
isogame.FirstPerson = (function(){ // extends isogame.Movable
	function FirstPerson(){
		isogame.Movable.apply( this, arguments );
	}
	// inherit superclass stuff
    FirstPerson.prototype = ooputils.inherit( isogame.Movable.prototype );
    // use extend method to extend
    /*ooputils.extend( FirstPerson.prototype, {
        // overide constructor
        constructor:FirstPerson
        // method overrides
    } );*/
	
	return FirstPerson;
}());
isogame.Enemy = (function(){ // extends isogame.Movable
	function Enemy(){
		isogame.Movable.apply( this, arguments );
	}
	// inherit superclass stuff
    Enemy.prototype = ooputils.inherit( isogame.Movable.prototype );
    // use extend method to extend
    /*ooputils.extend( Enemy.prototype, {
        // overide constructor
        constructor:Enemy
        // method overrides
    } );*/
	return Enemy;
}());


/** MOVERS **/
isogame.AMover = (function(){
	function AMover( movable, isomap, speed ) {
		this._map = isomap;
		this._bytes = isomap._bytes;
		this._sm = isomap._spriteManager;
		this._movable = movable;
		this._stepX = 0;
		this._stepY = 0;
		//check if movespeed is acceptable
		var n = map.tw / speed;
		var ch = n.toString().split('.');
		if ( ch.length > 1 )
		{
			throw isogame.Constants.errors.SPITE_MOVE_SPEED_ODD;
		}
		this._speed = speed;
		this._moveInRequest=false;
		this._currDir = 8;
		this._dirFuncs = [ this.down, this.leftdown, this.left, this.leftup, 
								 this.up, this.rightup, this.right, this.rightdown  ];
        this._ascendingsFuncs = [ this.ascDown, this.ascLeftDown, this.ascLeft, this.ascLeftUp,
                                this.ascUp, this.ascRightUp, this.ascRight, this.ascRightDown ];
		this._mouseTarget; // isogame.Point
	}
	AMover.prototype = {
		update:function()
		{
			//to be overridden by subclasses
		},
        getFutureIndexes:function(){
            if( this._currDir==8 )
                return { y:this._movable.Yindex, x:this._movable.Xindex };
            return this._ascendingsFuncs[this._currDir]( this._movable.Yindex, this._movable.Xindex );
        },
		goInDir:function( d )
		{
			this._currDir = d;
			this._dirFuncs[d](this);
		},
		up:function(self)
		{
			self._stepY = 2*self._speed;
			self._stepX = 0;
		},
		down:function(self)
		{
			self._stepY = 2*self._speed;
			self._stepX = 0;
		},
		left:function(self)
		{
			self._stepY = 0;
			self._stepX = 2*self._speed;
		},
		right:function(self)
		{
			self._stepY = 0;
			self._stepX = 2*self._speed;
		},
		leftup:function(self)
		{
			self._stepY   = 1*self._speed;
			self._stepX   = 2*self._speed;
		},
		rightup:function(self)
		{
			self._stepY   = 1*self._speed;
			self._stepX   = 2*self._speed;
		},
		leftdown:function(self)
		{
			self._stepY   = 1*self._speed;
			self._stepX   = 2*self._speed;
		},
		rightdown:function(self)
		{
			self._stepY   = 1*self._speed;
			self._stepX   = 2*self._speed;
		},
        ascUp:function(yi, xi)
        {
            return { y:yi-2, x:xi };
        },
        ascDown:function(yi, xi)
        {
            return { y:yi+2, x:xi };
        },
        ascLeft:function(yi, xi)
        {
            return { y:yi, x:xi-1 };
        },
        ascRight:function(yi, xi)
        {
            return { y:yi, x:xi+1 };
        },
        ascLeftUp:function( yi, xi )
        {
            if( yi%2==0 ) {// if even
                return { y:yi-1, x:xi };
            }
            return { y:yi-1, x:xi-1 };
        },
        ascRightUp:function(yi, xi)
        {
            if( yi%2==0 ) {// if even
                return { y:yi-1, x:xi+1 };
            }
            return { y:yi-1, x:xi };
        },
        ascLeftDown:function(yi, xi)
        {
            if( yi%2==0 ) {// if even
                return { y:yi+1, x:xi };
            }
            return { y:yi+1, x:xi-1 };
        },
        ascRightDown:function(yi, xi)
        {
            if( yi%2==0 ) {// if even
                return { y:yi+1, x:xi+1 };
            }
            return { y:yi+1, x:xi };
        },
        stop:function()
		{
			this._currDir = 8;
			this._stepY   = 0;
			this._stepX   = 0;
			this._moveInRequest = false;
		},
		isRequested:function() {
			return this._moveInRequest;
		},
		setRequested:function( b ) {
			this._moveInRequest = b;
		},
		isSnapped:function(){
			return ( this._movable.relX==0 && this._movable.relY==0 );
		},
		setSnapped:function( b ){
			//
		},
		getDirection:function() {
			return this._currDir;
		},
		setDirection:function( d ) {
			this._currDir = d;
		},
		getSpeed:function(){
			return this._speed;
		},
		setSpeed:function( s ){
			this._speed = s;
		},
		getMap:function() {
			return this._map;
		},
		setMap:function( isomap ) {
			this._map = isomap;
		},
		getXstep:function() {
			return this._stepX;
		},
		getYstep:function()	{
			return this._stepY;
		},
		getMovable:function() {
			return this._movable;
		},
		//setter func
		setXstep:function(xs) {
			this._stepX = xs;
		},
		setYstep:function(ys) {
			this._stepY = ys;
		},
		getMouseTarget:function() {
			return this._mouseTarget;
		},
		setMouseTarget:function(p) {
			this._mouseTarget = p;
		}
	};
	
	return AMover;
}());
isogame.MapMover = (function(){ // extends AMover
	function MapMover( movable, isomap, speed ){
		isogame.AMover.apply( this, arguments );
		this.sm = this._map._spriteManager;
		this.tp = this._map._tilePainter;
		this.resolvers = [ 
			this.resolveDown,
			this.resolveLeftDown,
			this.resolveLeft,
			this.resolveLeftUp,
			this.resolveUp,
			this.resolveRightUp,
			this.resolveRight,
			this.resolveRightDown
		];
		this._m2t = this._map._m2t;
	};
	// inherit superclass stuff
    MapMover.prototype = ooputils.inherit( isogame.AMover.prototype );
    // use extend method to extend
    ooputils.extend( MapMover.prototype, {
        // overide constructor
        constructor:MapMover,
        // method overrides
		update:function() {
			if( !this.isSnapped() || this._currDir<8 )
			{
				this.resolvers[this._currDir](this);
			}
			else
				this.stop();
		},
		resolveUp:function(self) {
			var m = self._movable;
			if( self.isSnapped() )
			{
				//if move is no longer requested || next tile is not walkable
				if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex-2,m.Xindex) )
				{
					self._currDir = 8;
					return;
				}
			}
			// update movable
			m.relY =  m.relY - self._stepY;
			//update map
			self.tp.setMapMoveTranslate( 0, self._stepY );
			//swap row
			if( m.relY == -self._bytes.th )
			{
				self._sm.switchRow(m, m.Yindex - 2);
				self.tp.scroll( isogame.Constants.dirs.DOWN,m )
			}
		},
		resolveDown:function(self){
			var m = self._movable;
			if( self.isSnapped() )
			{
				//if move is no longer requested || next tile is not walkable
				if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex+2,m.Xindex) )
				{
					self._currDir = 8;
					return;
				}
			}
			// update movable
			m.relY =  m.relY + self._stepY;
			//update map
			self.tp.setMapMoveTranslate( 0, -self._stepY );
			//swap row
			if( m.relY == self._bytes.th )
			{
				self._sm.switchRow(m, m.Yindex + 2);
				self.tp.scroll( isogame.Constants.dirs.UP,m );
			}
		},
		resolveLeft:function(self){
			var m = self._movable;
			if( self.isSnapped() )
			{
				//if move is no longer requested || next tile is not walkable
				if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex,m.Xindex-1) )
				{
					self._currDir = 8;
					return;
				}
			}
			// update movable
			m.relX =  m.relX - self._stepX;
			//update map
			self.tp.setMapMoveTranslate( self._stepX, 0 );
			//swap col
			if( m.relX == -self._bytes.tw )
			{
				self._sm.switchCol( m, m.Xindex-1 );
				self.tp.scroll( isogame.Constants.dirs.RIGHT,m );
			}
		},
		resolveRight:function(self){
			var m = self._movable;
			if( self.isSnapped() )
			{
				//if move is no longer requested || next tile is not walkable
				if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex,m.Xindex+1) )
				{
					self._currDir = 8;
					return;
				}
			}
			// update movable
			m.relX =  m.relX + self._stepX;
			//update map
			self.tp.setMapMoveTranslate( -self._stepX, 0 );
			//swap col
			if( m.relX == self._bytes.tw )
			{
				self._sm.switchCol( m, m.Xindex+1 );
				self.tp.scroll( isogame.Constants.dirs.LEFT,m );
			}
		},
		resolveLeftUp:function(self){
			var Xi;
			var m = self._movable;
			if( self.isSnapped() )
			{
				Xi = m.Xindex;
				if(m.Yindex%2==1)
					Xi --;
				//if move is no longer requested || next tile is not walkable
				if( !self._moveInRequest || !self._bytes.isWalkable( m.Yindex-1,Xi ) )
				{
					self._currDir = 8;
					return;
				}
			}
			//update movable
			m.relX = m.relX- self._stepX;
			m.relY = m.relY - self._stepY;

			//update map
			self.tp.setMapMoveTranslate( self._stepX, self._stepY );

			if( m.relX == -self._bytes.th )
			{
				Xi  = m.Xindex;
				if( m.Yindex%2==1)
				{
					Xi --;
				}
				self._sm.switchColRow( m, m.Yindex-1, Xi );
				self.tp.scroll( isogame.Constants.dirs.RIGHT_DOWN, m );
			}
		},
		resolveLeftDown:function(self) {
			var m = self._movable;
			var Xi;
			if( self.isSnapped() )
			{
				Xi = m.Xindex;
				if(m.Yindex%2==1)
					Xi --;
				//if move is no longer requested || next tile is not walkable
				if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex+1,Xi) )
				{
					self._currDir = 8;
					return;
				}
			}
			//update movable
			m.relX = m.relX- self._stepX;
			m.relY = m.relY+ self._stepY;
			//update map
			self.tp.setMapMoveTranslate( self._stepX, -self._stepY );
			//swap tile?
			if( m.relX==-self._bytes.th )
			{
				Xi = m.Xindex;
				if(m.Yindex%2==1)
				{
					Xi --;
				}	
				self._sm.switchColRow( m, m.Yindex+1, Xi );
				self.tp.scroll( isogame.Constants.dirs.RIGHT_UP, m );
			}
		},
		resolveRightUp:function(self){
			var Xi;
			var m = self._movable;
			if( self.isSnapped() )
			{
				Xi = m.Xindex;
				if(m.Yindex%2==0)
					Xi ++;
				//if move is no longer requested || next tile is not walkable
				if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex-1,Xi) )
				{
					self._currDir = 8;
					return;
				}
			}
			//update movable
			m.relX = m.relX+ self._stepX;
			m.relY = m.relY- self._stepY;
			//update map
			self.tp.setMapMoveTranslate( -self._stepX, self._stepY );
			//swap tile?
			if( m.relX==self._bytes.th )
			{
				Xi = m.Xindex;
				if(m.Yindex%2==0)
				{
					Xi ++;
				}	
				self._sm.switchColRow( m, m.Yindex-1, Xi );
				self.tp.scroll( isogame.Constants.dirs.LEFT_DOWN, m );
			}
		},
		resolveRightDown:function(self){
			var Xi;
			var m = self._movable;
			if( self.isSnapped() )
			{
				Xi = m.Xindex;
				if(m.Yindex%2==0)
					Xi ++;
				//if move is no longer requested || next tile is not walkable
				if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex+1,Xi) )
				{
					self._currDir = 8;
					return;
				}
			}
			//update movable
			m.relX = m.relX+ self._stepX;
			m.relY = m.relY+ self._stepY;
			//update map
			self.tp.setMapMoveTranslate( -self._stepX, -self._stepY );
			//swap tile?
			if( m.relX == self._bytes.th )
			{
				Xi = m.Xindex;
				if(m.Yindex%2==0)
				{
					Xi ++;
				}
				self._sm.switchColRow( m, m.Yindex+1, Xi );
				self.tp.scroll( isogame.Constants.dirs.LEFT_UP, m );
			}
		},
		stop:function(){
			this._moveInRequest = false;
		}

    } );
	
	return MapMover;
}());
isogame.SpriteMover = (function(){ // extends AMover
	function SpriteMover( movable, isomap, speed )
	{
		isogame.AMover.apply( this, arguments );
		this.sm = this._map._spriteManager;
		this.resolvers = [ 
			this.resolveDown,
			this.resolveLeftDown,
			this.resolveLeft,
			this.resolveLeftUp,
			this.resolveUp,
			this.resolveRightUp,
			this.resolveRight,
			this.resolveRightDown
		];
		this._m2t = this._map._m2t;
	}
	// inherit superclass stuff
    SpriteMover.prototype = ooputils.inherit( isogame.AMover.prototype );
	// use extend method to extend
    ooputils.extend( SpriteMover.prototype, {
        // overide constructor
        constructor:SpriteMover,
        // method overrides
		update:function()
		{
			if( !this.isSnapped() || this._currDir<8 )
			{
				this.resolvers[this._currDir](this);
			}
			else
				this.stop();
		},
		resolveUp:function(self) {
			var m = self._movable;

			if( self.isSnapped() )
			{
				//if move is no longer requested || next tile is not walkable
				if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex-2,m.Xindex) )
				{
					self._currDir = 8;
					return;
				}
			}
			// update movable
			m.relY =  m.relY - self._stepY;
			//swap row
			if( m.relY == -self._bytes.th )
			{
				self._sm.switchRow(m, m.Yindex - 2);
			}
		},
		resolveDown:function(self)  {
			var m = self._movable;

			if(self.isSnapped())
			{
				//if move is no longer requested || next tile is not walkable
				if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex+2,m.Xindex) )
				{
					self._currDir = 8;
					return;
				}
			}
			// update movable
			m.relY = m.relY + self._stepY;
			//swap tile?
			if( m.relY == self._bytes.th )
			{
				self._sm.switchRow( m, m.Yindex+2 );
			}
		},
		resolveLeft:function(self) {
			var m = self._movable;

			if(self.isSnapped())
			{
				//if move is no longer requested || next tile is not walkable
				if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex,m.Xindex-1) )
				{
					self._currDir = 8;
					return;
				}
			}
			// update movable
			m.relX =  m.relX-self._stepX;
			//swap tile ?
			if(m.relX==-self._bytes.tw)
			{
				self._sm.switchCol(m,m.Xindex-1);
			}
		},
		resolveRight:function(self) {
			var m = self._movable;
			if(self.isSnapped())
			{
				//if move is no longer requested || next tile is not walkable
				if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex,m.Xindex+1) )
				{
					self._currDir = 8;
					return;
				}
			}
			//update movable
			m.relX = m.relX+ self._stepX;
			//swap tile?
			if(m.relX==self._bytes.tw)
			{
				self._sm.switchCol(m,m.Xindex+1);
			}
		},
		resolveLeftUp:function(self) {
			var Xi;
			var m = self._movable;
			if( self.isSnapped() )
			{
				Xi = m.Xindex;
				if(m.Yindex%2==1)
					Xi --;
				//if move is no longer requested || next tile is not walkable
				if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex-1,Xi) )
				{
					self._currDir = 8;
					return;
				}
			}
			//update movable
			m.relX = m.relX- self._stepX;
			m.relY = m.relY - self._stepY;
			//swap tile?
			if( m.relX==-self._bytes.th )
			{
				Xi  = m.Xindex;
				if( m.Yindex%2==1)
				{
					Xi --;
				}
				self._sm.switchColRow( m, m.Yindex-1, Xi );
			}
		},
		resolveLeftDown:function(self) {
			var m = self._movable;
			var Xi;
			if( self.isSnapped() )
			{
				Xi = m.Xindex;
				if(m.Yindex%2==1)
					Xi --;
				//if move is no longer requested || next tile is not walkable
				if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex+1,Xi) )
				{
					self._currDir = 8;
					return;
				}
			}
			//update movable
			m.relX = m.relX- self._stepX;
			m.relY = m.relY+ self._stepY;
			//swap tile?
			if( m.relX==-self._bytes.th )
			{
				Xi = m.Xindex;
				if(m.Yindex%2==1)
				{
					Xi --;
				}	
				self._sm.switchColRow( m, m.Yindex+1, Xi );
			}
		},
		resolveRightUp:function(self) {
			var Xi;
			var m = self._movable;
			if( self.isSnapped() )
			{
				Xi = m.Xindex;
				if(m.Yindex%2==0)
					Xi ++;
				//if move is no longer requested || next tile is not walkable
				if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex-1,Xi) )
				{
					self._currDir = 8;
					return;
				}
			}
			//update movable
			m.relX = m.relX+ self._stepX;
			m.relY = m.relY- self._stepY;
			//swap tile?
			if( m.relX==self._bytes.th )
			{
				Xi = m.Xindex;
				if(m.Yindex%2==0)
				{
					Xi ++;
				}	
				self._sm.switchColRow( m, m.Yindex-1, Xi );
			}
		},
		resolveRightDown:function(self) {
			var Xi;
			var m = self._movable;
			if( self.isSnapped() )
			{
				Xi = m.Xindex;
				if(m.Yindex%2==0)
					Xi ++;
				//if move is no longer requested || next tile is not walkable
				if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex+1,Xi) )
				{
					self._currDir = 8;
					return;
				}
			}
			//update movable
			m.relX = m.relX+ self._stepX;
			m.relY = m.relY+ self._stepY;
			//swap tile?
			if( m.relX == self._bytes.th )
			{
				Xi = m.Xindex;
				if(m.Yindex%2==0)
				{
					Xi ++;
				}
				self._sm.switchColRow( m, m.Yindex+1, Xi );
			}
		},
		stop:function(){
			this._moveInRequest = false;
		}
	} );
	
	return SpriteMover;
}());
// combination/switch of the two movers above
isogame.SpriteMapMover = (function(){ 
	function SpriteMapMover( movable, isomap, speed ){
		this._mapMover = new isogame.MapMover( movable, isomap, speed );
		this._spriteMover = new isogame.SpriteMover( movable, isomap, speed );
		this.currMover = this._spriteMover;
		//TODO rest
	}
	
	return SpriteMapMover;
}());

/** PLAYER CONTROL **/
isogame.KeyControl = (function(){
	function KeyControl()
	{
		// TODO use jquery to detect keypresses
		$(document).keydown( this._keypress );
		//dojo.connect( dojo.doc, "keydown", this._keypress );
		$(document).keyup( this._keyup );
		//dojo.connect( dojo.doc, 'keyup', this._keyup );
	}
	KeyControl.prototype = {
		_keyup:function(e)
		{
			// console.log( "_keyup: e.which="+e.which );
			if( isogame.KeyControl._keydirs[e.keyCode] )
			{
				isogame.KeyControl._keydirs[e.keyCode][0] = false;
			}
		},
		_keypress:function(e)
		{
			// console.log( "_keypress: e.which="+e.which );
			if( isogame.KeyControl._keydirs[e.keyCode] )
			{
				isogame.KeyControl._keydirs[e.keyCode][0] = true;
			}
		},
		getDirection:function() {
	        //left
			if( isogame.KeyControl._keydirs[37][0] ) {
	            //up
	            if(isogame.KeyControl._keydirs[38][0]) return isogame.Constants.dirs.LEFT_UP;
	            //down
	            if(isogame.KeyControl._keydirs[40][0]) return isogame.Constants.dirs.LEFT_DOWN;
	            //left
	            return isogame.KeyControl._keydirs[37][1];
	        }
        
        
	        //up
			if( isogame.KeyControl._keydirs[38][0] ) {
	            //left
	             if(isogame.KeyControl._keydirs[37][0]) return isogame.Constants.dirs.LEFT_UP;
	            //right
	             if(isogame.KeyControl._keydirs[39][0]) return isogame.Constants.dirs.RIGHT_UP;
	            //up
	            return isogame.KeyControl._keydirs[38][1];
	         }
        
        
        
			//right
	        if( isogame.KeyControl._keydirs[39][0] ) {   
	            //up
	             if(isogame.KeyControl._keydirs[38][0]) return isogame.Constants.dirs.RIGHT_UP;
	            //down
	             if(isogame.KeyControl._keydirs[40][0]) return isogame.Constants.dirs.RIGHT_DOWN;
	            //right
	            return isogame.KeyControl._keydirs[39][1];
            
	         }
        
        
        
			//down
	        if( isogame.KeyControl._keydirs[40][0] ) {
	            //left
	              if(isogame.KeyControl._keydirs[37][0]) return isogame.Constants.dirs.LEFT_DOWN;
	            //right
	              if(isogame.KeyControl._keydirs[39][0]) return isogame.Constants.dirs.RIGHT_DOWN;
	            //down
	             return isogame.KeyControl._keydirs[40][1];
	        }
			return 8;
		}
	};
	KeyControl._keydirs =[];
	KeyControl._keydirs[37] = [ false, isogame.Constants.dirs.LEFT ];
	KeyControl._keydirs[38] = [ false, isogame.Constants.dirs.UP ];
	KeyControl._keydirs[39] = [ false, isogame.Constants.dirs.RIGHT ];
	KeyControl._keydirs[40] = [ false, isogame.Constants.dirs.DOWN ];
	
	return KeyControl;
}());
isogame.MouseControl = (function(){
    function MouseControl( map /*IsoMap*/, movable /* Movable */ ){
        this.tileClicked = null; /* Point */
        this.map = map;
        this.movable = movable;
        this.pathEvt = null; /* AStar pathfound event ( structure below )*/
        this.pathEvtBuff = null;
        /*
         evt.pathArray;
         evt.dirArray;
         evt.targetTile;
         evt.mapVO;
         evt.action;
         evt.actionMsg;
         */
        this.curr = -1;
        this.pathBuffering = false;

        var self = this;
        this.map._mouseLyr.onclick = function( evt ){
            // TODO calculate relative mouseX, mouseY on map
            var x = evt.layerX /* self.map._tilePainter.xCanvasTranslateAmount */+ self.map._tilePainter.xCropTranslate +
            self.map._tilePainter.md;
            var y = evt.layerY /* self.map._tilePainter.yCanvasTranslateAmount */+ self.map._tilePainter.yCropTranslate;
            i = self.map._m2t.getIndexes( x, y, self.map );
            // console.log(i.y+"."+ i.x );
            if( self.pathEvt ) { // do a buffer pathfind
                self.pathBuffering = true;
                //TODO: calculate next tile movable is gonna be snapped on
                var futureIndexes = self.movable.mover.getFutureIndexes();
                var astar = new isogame.AStar( self.map._tilePainter.bytes, futureIndexes.y, futureIndexes.x, i.y, i.x, 1000 );//, self.map._mouseLyr.getContext('2d') );
                astar.onPathFound = function( evt ){
                    // console.log( 'MouseControl.astar.onPathFound:'+evt.dirArray );
                    self.pathEvtBuff = evt;
                }
                astar.onPathNotFound = function( evt ){
                    console.log( 'MouseControl.astar.onPathNotFound' );
                    self.pathEvtBuff = null;
                }
                astar.start();
            } else {
                var oldY = self.movable.Yindex;
                var oldX = self.movable.Xindex;
                var astar = new isogame.AStar( self.map._tilePainter.bytes, oldY, oldX, i.y, i.x, 1000 );//, self.map._mouseLyr.getContext('2d') );
                astar.onPathFound = function( evt ){
                    // console.log( 'MouseControl.astar.onPathFound:'+evt.dirArray );
                    self.pathEvt = evt;
                    self.curr = -1;
                }
                astar.onPathNotFound = function( evt ){
                    console.log( 'MouseControl.astar.onPathNotFound' );
                    self.pathEvt = null;
                }
                astar.start();
            }
        };
    };
    MouseControl.prototype = {
        getDirection:function(){
            if( this.pathEvt ){
                if( this.movable.mover.isSnapped() ){
                    if( this.pathEvtBuff ){
                       this.pathEvt = this.pathEvtBuff;
                       this.pathEvtBuff = null;
                       this.pathBuffering = false;
                       this.curr = -1;
                    }
                    this.curr  ++;
                    if( this.pathEvt.dirArray.length==this.curr ){ // path is walked
                        console.log('path is walked');
                        this.pathEvt = null;
                        this.curr = -1;
                        return 8;
                    }
                    else
                        return this.pathEvt.dirArray[this.curr];
                }
            }
            else if( this.pathEvtBuff ){
                this.pathEvt = this.pathEvtBuff;
                this.pathEvtBuff = null;
                this.pathBuffering = false;
                this.curr = -1;
            }
            return 8; // no path to walk;
        }
    }
    return MouseControl;
}());

// TODO: make an pathmover that's interferible
/** ASTAR PATHFINDER **/
isogame.AStar = function () {
    function AStar( bytes /* isogame.MapBytes*/, oldY /*Number*/, oldX /*Number*/, newY /*Number*/, newX /*Number*/, maxScans/*Number*/, infocanvas/*Canvas2D*/) {
        if ( !bytes.tileExcists(newY, newX ) ) throw new Error("isogame.AStar ERROR: " + newY + ">" + newX + " does not excist! ");
        if ( !bytes.tileExcists(oldY, oldX ) ) throw new Error("isogame.AStar ERROR: " + oldY + ">" + oldX + " does not excist! ");
        this.infocanvas = infocanvas;
        this._maxScans = maxScans || 255;
        this._bytes = bytes;
        this.tw = this._bytes.tw; this.th = this._bytes.th; this.thh = this._bytes.thh;
        this._oldX = oldX;
        this._oldY = oldY;
        this._newX = newX;
        this._newYOdd = newY%2;
        this._newY = newY;
        this._targetTile = newY+">"+newX;
        this._bytes.movePosTo( newY, newX );
        this._actionMsg = this._bytes.getAction();
        this._startTile = oldY+">"+oldX;
        this._pathArray = [];
        this._dirArray = [];
        this._reRun = false;
        this._closedList = {};
        this._openList = {};
        this._Fscores = [];
        this._Fscores[0] = 0;
        this._totalScans = 0;

        this._straightDis = 8;
        this._vertDis = 16;
        this._horiDis = 16;
        this._HstraightDis = 8;
        this._HvertDis = 10;
        this._HhoriDis = 10;
        this._retry = 0;
    }

    ;
    AStar.prototype = {
        start:function()
        {
            var StartTile = [];
            StartTile.parent = null;
            StartTile.H = this.calcH( this._oldX, this._oldY );
            // console.log( 'AStart.start StartTile.H='+StartTile.H );
            StartTile.G = 0;
            StartTile.F = parseInt(StartTile.H + StartTile.G);

            this._openList[ this._startTile ] = StartTile;
            if(this._reRun==false)
            {
                this._Fscores [1] = [];
                this._Fscores [1].F = StartTile.F;
                this._Fscores [1].N = this._startTile;
            }

            //if target has action asigned to it
            if((this._actionMsg=="walkto")||(this._actionMsg=="undefined"))
            {
                this._action = false;
            }
            else
            {
                this._action = true;
            }
            // getTimer(); TODO : use javascript equavalant of as2 getTimer

            this.scanAdjacent ( this._oldX, this._oldY );
        },
        scanAdjacent:function (X /*int*/, Y /*int*/) //scan neighbouring tiles from currTile
        {
            this._totalScans += 1 ;
            var currTile = Y + ">" + X;
            var targetFound = false;
            //add current tile parent to closedList and remove from openlist + _Fscores array
            this._closedList [currTile] = new Array;
            //if( this._openList[currTile] ){
                this._closedList [currTile].parent = this._openList [currTile].parent;
                this._closedList [currTile].dir = this._openList [currTile].dir;
                this._closedList [currTile].G = this._openList [currTile].G;
                this._closedList [currTile].H = this._openList [currTile].H;
                this._closedList [currTile].F = this._openList [currTile].F;
            //}

            delete this._openList[currTile];
            //remove from Fscores
            this.removeFromHeap(this._Fscores);


            for (var i = 0; i < 8; i ++)
            {
                if (currTile == this._targetTile)
                {
                    targetFound = true;
                    break;
                }
                var distance = 0;
                var dir = 9;
                switch (i) // 8 adjacent tiles
                {
                    // TODO: rectify directions
                    case 0 :
                        dir = isogame.Constants.dirs.UP;
                        var checkY = Y - 2;
                        var checkX = X;
                        distance = this._vertDis;
                        break;
                    case 1 :
                        dir = isogame.Constants.dirs.DOWN;
                        var checkY = Y + 2;
                        var checkX = X;
                        distance = this._vertDis;
                        break;
                    case 2 :
                        dir = isogame.Constants.dirs.LEFT;
                        var checkY = Y;
                        var checkX = X - 1;
                        distance = this._horiDis;
                        break;
                    case 3 :
                        dir = isogame.Constants.dirs.RIGHT;
                        var checkY = Y;
                        var checkX = X + 1;
                        distance = this._horiDis;
                        break;
                    case 4 :
                        dir = isogame.Constants.dirs.RIGHT_UP;
                        var checkY = Y - 1;
                        var checkX = X;
                        if( Y%2==0 )// if even
                            checkX = X + 1;
                        distance = this._straightDis;
                        break;
                    case 5 :
                        dir = isogame.Constants.dirs.LEFT_UP;
                        var checkY = Y - 1;
                        var checkX = X;
                        if( Y%2 ) // if odd
                            checkX = X - 1;
                        distance =this._straightDis;
                        break;
                    case 6 :
                        dir = isogame.Constants.dirs.RIGHT_DOWN;
                        var checkY = Y + 1;
                        var checkX = X;
                        if( Y%2==0 )// if even
                            checkX = X + 1;
                        distance = this._straightDis;
                        break;
                    case 7 :
                        dir = isogame.Constants.dirs.LEFT_DOWN;
                        var checkY = Y + 1;
                        var checkX = X;
                        if( Y%2 ) // if odd
                            checkX = X - 1;
                        distance = this._straightDis;
                        break;
                }
                //console.log( 'AStar.scanAdjacent isogame.Constants.UP=  '+isogame.Constants.UP );
                var checkTile = checkY+">"+checkX;

                //if walkable or grapich attached to it or not on the closedList
                if ( this._bytes.isWalkable( checkY, checkX ) && this._closedList[checkTile] == undefined ) {
                    //if not on the openList add to openList record parent-tile H,G + F and add new F to _Fscores
                    if ( this._openList[checkTile] == undefined ) {

                        var tile = this._openList[checkTile] = [];
                        tile.parent = currTile;
                        tile.dir = dir;
                        tile.H = this.calcH( checkX, checkY );
                        tile.G = this._closedList [currTile].G + distance;
                        //vertical movement cost
                        tile.F = tile.G + tile.H;
                        //store F cost in seperate Array
                        var l = this._Fscores.length;
                        this.add2heap( l, checkTile, tile.F, this._Fscores );

                        // TODO: set visuals on infoCanvas
                        this.drawCheckTile( checkY, checkX, false );
                    }
                    //if it is already on the openList
                    else
                    {
                        // if G cost is higher then currTiles
                        var currG = this._closedList[currTile].G + distance;
                        //vertical movement cost
                        if(currG <= this._openList [checkTile].G) // this total G is smaller then the older one
                        {
                            //change parent 2 current tile + G, F costs
                            var tile = this._openList [checkTile];
                            tile.parent = currTile;
                            tile.dir = dir;
                            tile.G = currG;
                            tile.F = currG + tile.H;
                            //replace F cost in seperate _Fscores
                            this.replaceInHeap( checkTile, this._Fscores, tile.F );

                            // TODO: set visuals on infoCanvas
                            this.drawCheckTile( checkY, checkX, true );
                        }
                    }

                }

            }

            if( targetFound == true || this._Fscores.length < 2 )
            {
                if (targetFound == true)
                {
                    //trace ("-------------------------------------")
                    //trace(_totalScans+":"+_Fscores[0].N+":"+_Fscores[0].F);
                    //trace (_targetTile + " found in: " + _totalScans + " scans, in " + getTimer () + " miliseconds ");

                    this.tracePathBack( this._targetTile );
                }
                else
                {
                    this.onPathNotFound();
                }
            }
            else if( this._totalScans < this._maxScans )
            {
                var Next = this._Fscores [1].N.split (">", 2);
                this.scanAdjacent( parseInt(Next [1]) , parseInt(Next [0]) );
            }
            else {
                this.onPathNotFound();
            }
        },
        drawCheckTile:function( checkY, checkX, onOpenList /*boolean*/ ){
            if( !this.infocanvas ) return;
            this._bytes.movePosTo( checkY, checkX );
            var c/*Point*/ = this._bytes.getCoords();
            var coords = new isogame.Point ( c.x, c.y );
            coords.x += this.th;
            coords.y += this.thh;
            if(  checkY + ">" + checkX == this._targetTile )
                console.log('AStar.drawCheckTile: TARGET FOUND!!!' );
            this.infocanvas.beginPath();
            this.infocanvas.fillStyle = "#f00";

            this.infocanvas.rect( coords.x, coords.y, 2, 2 );

            //this.infocanvas.fillStyle = "#f00";
            this.infocanvas.fill();
            this.infocanvas.closePath();

            /*_mapMc[checkTile].open._visible = onOpenList
             _mapMc[checkTile].close._visible = !onOpenList
             _mapMc[checkTile].F.text = tile.F
             _mapMc[checkTile].G.text = tile.G
             _mapMc[checkTile].H.text = tile.H*/

            /* var p =_mapMc.path.attachMovie("H",i*11,i*11);
             p._x = _mapMc[checkTile]._x;
             p._y = _mapMc[checkTile]._y;*/
        },
        /* test method for checking pathfind process step by step */
        nextStep:function()
        {
            var Next = this._Fscores [1].N.split (">", 2);
            this.scanAdjacent( parseInt (Next [1]) , parseInt (Next [0] ) );
        },
        calcH:function( X, Y ) //heuristic calculation
        {
            var oldX = this._oldX; var oldY = this._oldY;
            var newX = this._newX; var newY = this._newY;

            var shiftX = new Number;
            var currX = X;
            var currY = Y;
            var currYOdd = Y%2;
            var shiftY = new Number;
            var shiftH = new Number;
            var currH = new Number;
            var dir = new String;
            var t = 0;
            this._pathArray [0] = Y + ">" + X;
            this._pathFound = false;
            while ( !this._pathFound )
            {
                if ((currX == this._newX) && (currY == this._newY))
                {
                    this._pathFound = true;
                    break;
                }
                if( currY == this._newY ) {
                    // if old/new yi is the same = scan horizontal

                    if (currX < this._newX) { //right rigid scan
                        shiftX = 1;
                        shiftY = 0;
                        shiftH = this._HhoriDis;
                        dir = "right";
                    }
                    else { //left rigid scan
                        shiftX = - 1;
                        shiftY = 0;
                        shiftH = this._HhoriDis;
                        dir = "left";
                    }
                }
                else if( currX == this._newX && currYOdd == this._newYOdd ) {
                    // if old/new xi is the same and old/new yi has same oddness or non-oddness = vertical

                    if (currY > this._newY) { //up rigid scan
                        shiftX = 0;
                        shiftY = - 2;
                        shiftH = this._HvertDis;
                        dir = "up";

                    }
                    else { //down rigid scan
                        shiftX = 0;
                        shiftY = 2;
                        shiftH = this._HvertDis;
                        dir = "down";
                    }
                }
                else //wide scans
                {

                    if ( currY > this._newY) //boven
                    {
                        if ( (currX < this._newX) || ( currX==this._newX && currYOdd )) {//rechtsboven wide scan
                            shiftX = 0;
                            if( !currYOdd )
                                shiftX = 1;
                            shiftY = - 1;
                            shiftH = this._HstraightDis;
                            dir = "leftup";
                        }
                        else {// if ( (currX > this._newY) || ( currX==this._newX && !currYOdd ) ) {//linksboven wide scan
                            shiftX = 0;
                            if( currYOdd )
                                shiftX = -1;
                            shiftY = - 1;
                            shiftH = this._HstraightDis;
                            dir = "rightup";
                        }
                    }

                    else if (currY < this._newY) //onder
                    {
                        if ( ( currX > this._newX ) || ( currX==this._newX && !currYOdd) ) //linksonder wide scan
                        {
                            shiftX = 0;
                            if( currYOdd )
                                shiftX = -1;
                            shiftY = 1;
                            shiftH = this._HstraightDis;
                            dir = "leftdown";
                        }
                        else {//if ( ( currX < this._newX ) || ( currX==this._newX && currYOdd )) //rechtsonder wide scan
                            shiftX = 0;
                            if( !currYOdd )
                                shiftX = 1;
                            shiftY = 1;
                            shiftH = this._HstraightDis;
                            dir = "rightdown";

                        }
                    }
                }
                currX += shiftX;
                currY += shiftY;
                currH += shiftH;
                currYOdd = currY%2;
            }
            return currH*3;
        },
        tracePathBack:function( tile /*string*/ )
        {
            if ( this._closedList [tile].parent != undefined)
            {
                var parentTile = this._closedList[tile].parent;
                this._pathArray.push( parentTile );
                this._dirArray.push( this._closedList[tile].dir );
                // console.log('AStar.tracePathBack : dir='+this._closedList[tile].dir );
                /*var p = _root.pathMc.attachMovie ("pathTile", l, l);
                 p._x = _mapVO.tiles [parentTile].X;
                 p._y = _mapVO.tiles [parentTile].Y;*/
                this.tracePathBack (parentTile);
            }
            else
            {
                this._pathArray.reverse ();
                this._dirArray.reverse ();
                var l/*int*/ = this._pathArray.length - 1
                this._pathArray [l] = this._targetTile;

                var evt = {};
                evt.pathArray = this._pathArray;
                evt.dirArray = this._dirArray;
                evt.targetTile = this._targetTile;
                evt.mapVO = this._mapVO;
                evt.action = this._action;
                evt.actionMsg = this._actionMsg;

                this.onPathFound( evt );
            }
        },

        /** Binary Heap methods */
        swapItem:function( index1 /*int*/,index2/*int*/,array/*Array*/ )
        {
            var i1 = array[index1];
            var i2 = array[index2];
            array[index1] = i2;
            array[index2] = i1;
        },
        add2heap:function(index/*int*/,Name/*string*/,Fscore/*int*/,array/*array*/)
        {
            array[index] = {};
            array[index].N = Name;
            array[index].F = Fscore;
            this.sortHeapAfterAdd(index,array);
        },
        replaceInHeap:function( Name/*string*/,array/*array*/,Fscore/*int*/)
        {
            for(var i=1;i<array.length;i++)
            {
                if(array[i].N==Name)
                {
                    array[i].N = Name;
                    array[i].F = Fscore;
                    this.sortHeapAfterAdd(i,array);
                    return;

                }
            }
        },
        sortHeapAfterAdd:function(index/*int*/,array/*array*/)
        {
            var parentIndex = Math.floor(index/2);
            if(array[parentIndex].F>array[index].F)
            {
                this.swapItem(parentIndex,index,array);
                this.sortHeapAfterAdd(parentIndex,array);
            }
        },
        removeFromHeap:function( array/*array*/ )
        {
            if(array.length>0)
            {
                //replacing slot#1 item with last slot item
                var lastIndex = array.length-1;
                array[1].F = array[lastIndex].F;
                array[1].N = array[lastIndex].N;
                array.pop();
                //resort rest of array after remove
                this.sortHeapAfterRemove(1,array);
            }
        },
        sortHeapAfterRemove:function( Index/*int*/,array/*array*/ )
        {
            var child1 = Index*2;
            var child2 = Index*2+1;
            if( array.length>3 )
            {
                if( array[child1]==undefined || array[child2]==undefined )// children not undefined--end of array
                {
                    return; // break;
                }
                else
                {
                    if((array[Index].F<array[child1].F)&&(array[Index].F<array[child2].F))//if parent is smaller then its 2 children
                    {
                        return; // break;
                    }
                    else // bigger then 1 or 2 of its children
                    {
                        //swap parent with lowst F cost child
                        if(array[child1].F<array[child2].F)//1 < 2
                        {
                            this.swapItem(child1,Index,array);
                            this.sortHeapAfterRemove(child1,array);
                        }else // 2 < 1
                        {
                            this.swapItem(child2,Index,array);
                            this.sortHeapAfterRemove(child2,array);
                        }

                    }
                }
            }
            else if( array.length==3 ){
                if( array[1].F > array[2].F ){
                    this.swapItem(1,2,array);
                    console.log( "swapped the last 2.");
                }
            }
        },
        /** end Binary Heap methods */

        /* events */
        onPathNotFound:function(){},
        onPathFound:function(evt){}
    }

    return AStar;
}();
