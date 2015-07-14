/**
 * Created with JetBrains WebStorm.
 * User: peter
 * Date: 4/18/13
 * Time: 4:35 PM
 * To change this template use File | Settings | File Templates.
 */

// 3 : isogame package


isogame.TilePainter = (function(){

	function TilePainter( isomap, drawInfoCanvas, backgroundClr ) {
		this.drawInfoCanvas = drawInfoCanvas;
		this.backgroundClr = backgroundClr;
		this.map = isomap;
		this.th = this.map._bytes.th;
		this.thh = this.map._bytes.thh;
		this.image = isomap._image;
		this.webgl = false;
		if( 0 ) { // this._webglDetect( isomap._floorCanvas ) ){
			this.webgl = true;
			this._restoreGraphicLayers = this._restoreGraphicLayersWGL;
			this._clearFloorRect = this._clearFloorRectWGL;
			this._clearLayer = this._clearLayerWGL;
			this._drawFloorTile = this._drawFloorTileWGL;
			this._drawFloor2Tile = this._drawFloor2TileWGL;
			this._drawItemTile = this._drawItemTileWGL;
			this._drawTileIdx = this._drawTileIdxWGL;
			this._drawMovable = this._drawMovableWGL;
			this.floor = this._webglDetect( isomap._floorCanvas, true ).gl;
			this.floor2 = this._webglDetect( isomap._floor2Canvas, true ).gl;
			this.item = this._webglDetect( isomap._infoCanvas, true).gl;
		}
		else {
			this.floor = isomap._floorCanvas.getContext('2d');
			this.floor2 = isomap._floor2Canvas.getContext('2d');
			this.item  = isomap._itemCanvas.getContext('2d');
			if( isomap._infoCanvas )
				this.info  = isomap._infoCanvas.getContext('2d');
		}
		this.bytes = isomap._bytes;
		// sort order on slice._id - for easy access
		this.slices = [];
		for( var i=0; i<isomap._data.slices.length; i++ ) {
			var slice = isomap._data.slices[i];
			this.slices[ slice._id ] = slice;
		}

		this.uniqueSliceId = this.slices.length;
		this.subSlices = this._subSliceSlices();
		if( this.subSlices ) {
			this._replaceSubSlicesInMapData();
		}

		this.crop   = isomap._crop;
		this.yCropTranslate = 0;
		this.xCropTranslate = 0;
		this.xCanvasTranslateAmount = 0;
		this.yCanvasTranslateAmount = 0;
		
		this.offset = {x:0, y:0};
		if( isomap._offset )
			this.offset = isomap._offset;

		this.md = 0;//isomap._bytes.th;
		this.scrollShift = 0;
		this.prevDir = 0;
		if( this.map._crop ) {
			 // init canvas translation for cropped maps
			if(this.crop.y%2 ){
				this.md = 0;
			}
			else {
				this.md = this.map._bytes.th;
			}
			this.xCanvasTranslateAmount = this.md;
			this.yCanvasTranslateAmount = 0;
		}
		this.cropChanged = true;
		this.alternativeDrawingMethods = {};
	}
	TilePainter.prototype = {
		_webglDetect:function( return_context )
		{
			if ( !!window.WebGLRenderingContext ) {
				var names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
					context = false;

				for(var i=0;i<names.length;i++) {
					try {
						context = canvas.getContext(names[i]);
						if (context && typeof context.getParameter == "function") {
							// WebGL is enabled
							if (return_context) {
								// return WebGL object if the function's argument is present
								return {name:names[i], gl:context};
							}
							// else, return just true
							return true;
						}
					} catch(e) {}
				}

				// WebGL is supported, but disabled
				return false;
			}

			// WebGL not supported
			return false;
		},

		drawUnCroppedMap:function(){
			if( this.cropChanged ) // if crop changed redraw floor-tiles also
			{
				this._clearFloorRect();
				this._clearLayer( this.floor2 );
				if( this.drawInfoCanvas ){
					this._clearLayer( this.info );
				}
			}
			//always redraw item-tiles & movable-sprites
			this._clearLayer( this.item );
			this._restoreGraphicLayers( [ this.floor, this.floor2 ] );

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
						var x = coords.x- this.xCropTranslate + this.offset.x;
						var y = coords.y- this.yCropTranslate + this.offset.y;
						var f = this.bytes.getFloorId();
						var f2 = this.bytes.getFloor2Id();
						var it= this.bytes.getItemId();

						if( this.cropChanged )
						{
							if( f>-1 )
								this._drawFloorTile(f,x,y);
							if( f2>-1 )
								this._drawFloor2Tile(f2, x, y, ix, iy );
							if( this.drawInfoCanvas )
								this._drawTileIdx( iy, ix, x, y );
						}
						if(it>-1)
							this._drawItemTile(it,x,y,ix,iy);


					} else {
						//trace("unable to draw tile : ix = "+ix+", y = "+iy);
					}

				}
				//CJSDraw movables per row
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
				this._clearFloorRect();//0,0,this.map._floorCanvas.width, this.map._floorCanvas.height);//-this.xCanvasTranslateAmount,-this.yCanvasTranslateAmount,this.map._floorCanvas.width, this.map._floorCanvas.height );
				this._clearLayer( this.floor2);
				if( this.drawInfoCanvas ){
					this._clearLayer( this.info );
				}
			}
			//always redraw item-tiles & movable-sprites
			this._clearLayer( this.item );
			this._restoreGraphicLayers( [ this.floor, this.floor2, this.item ] );

			var s;
			var crop = this.map._crop;
			//get movables residing in cropped area in a multidimensional array
			var movables = this.map._spriteManager.getMovablesInCropArea( crop );
			//draw graphics residing in cropped area
			for( var iy = crop.y-6; iy<crop.height+crop.y+6; iy++ )
			{
				for( var ix=crop.x-6;ix<crop.width+crop.x+6; ix++ )
				{
					if( this.bytes.tileExcists(iy,ix)==true )
					{
						this.bytes.movePosTo(iy,ix);
						var coords = this.bytes.getCoords();
						//var z = coords.z;
						var x = coords.x- this.xCropTranslate;// + this.xMoveMapTranslate;
						var y = coords.y- this.yCropTranslate;// + this.yMoveMapTranslate;
						var f = this.bytes.getFloorId();
						var f2 = this.bytes.getFloor2Id();
						var it= this.bytes.getItemId();

						if( this.cropChanged )
						{
							if( f>-1 )
								this._drawFloorTile(f,x,y);
							if( f2>-1 )
								this._drawFloor2Tile(f2, x, y, ix, iy );
							if( this.drawInfoCanvas )
								this._drawTileIdx( iy, ix, x, y );
						}
						if(it>-1)
							this._drawItemTile(it,x,y,ix,iy);


					} else {
						//trace("unable to draw tile : ix = "+ix+", y = "+iy);
					}

				}
				//CJSDraw movables per row
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
		/**
		 * ##########################  Canvas 2d drawing methods
		 */
		_restoreGraphicLayers:function( layers ){
			for( var l in layers ){
				layers[l].restore();
			}
		},
		_clearFloorRect:function(){
			if( this.backgroundClr ){
				this.floor.fillStyle =  this.backgroundClr;
				this.floor.fillRect(-100,-100,this.map._floorCanvas.width + 200, this.map._floorCanvas.height + 200 );
			}
			else {
				this.floor.clearRect(-100,-100,this.map._floorCanvas.width + 200, this.map._floorCanvas.height + 200 );
			}
		},
		_clearLayer:function( layer ){
			layer.clearRect(-100,-100,this.map._floorCanvas.width + 200, this.map._floorCanvas.height + 200 );
		},
		_drawFloorTile:function( id, x, y )
		{
			if(!this.slices[id]) return;
			var slice = this.slices[id];
			this.floor.drawImage( this.image, slice._x, slice._y, slice._w, slice._h, x-slice._ox+this.th, y-slice._oy+this.thh, slice._w, slice._h );
		},
		_drawFloor2Tile:function( id, x, y, ix, iy ){
			if(!this.slices[id]) return;
			var slice = this.slices[id];
			var admethod = this.alternativeDrawingMethods[iy+">"+ix];
			if( admethod ){
				return admethod( this.floor2, this.image, slice._x, slice._y, slice._w, slice._h, x-slice._ox+this.th, y-slice._oy+this.thh, slice._w, slice._h );
			}
			this.floor2.drawImage( this.image, slice._x, slice._y, slice._w, slice._h, x-slice._ox+this.th, y-slice._oy+this.thh, slice._w, slice._h );
		},
		_drawItemTile:function( id, x, y, ix, iy )
		{
			if(!this.slices[id]){
				return;
			}
			var slice = this.slices[id];

			var admethod = this.alternativeDrawingMethods[iy+">"+ix];
			if( admethod ){
				return admethod( this.item, this.image, slice._x, slice._y, slice._w, slice._h, x-slice._ox+this.th, y-slice._oy+this.thh, slice._w, slice._h );
			}

			this.item.drawImage( this.image, slice._x, slice._y, slice._w, slice._h, x-slice._ox+this.th, y-slice._oy+this.thh, slice._w, slice._h );
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
			m.mapX = tilecoords.x  + m.relX + this.bytes.th;
			m.mapY = tilecoords.y  + m.relY + this.bytes.thh;

			var admethod = this.alternativeDrawingMethods[ myi+">"+mxi ];
			if( admethod ){
				var b = m.getBounds();
				var w = b.maxX - b.minX;
				var h = b.maxY - b.minY;
				admethod( this.item, null, 0,0, w, h, m.mapX+b.minX, m.mapY+b.minY, w, h );
			}

			if( this.map._crop ) {
				m.mapX -= this.xCropTranslate;// + this.xMoveMapTranslate;
				m.mapY -= this.yCropTranslate;// + this.yMoveMapTranslate;
			}
			else if( this.offset ) {
				m.mapX  += this.offset.x;
				m.mapY  += this.offset.y;
			}

			m.draw( this.item, m.mapX, m.mapY );
		},
		/**
		 * ##########################  WebGL drawing methods
		 */
		_restoreGraphicLayersWGL:function( layers ){
			for( var l in layers ){
				layers[l].restore();
			}
		},
		_clearFloorRectWGL:function(){
			if( this.backgroundClr ){
				this.floor.fillStyle =  this.backgroundClr;
				this.floor.fillRect(-100,-100,this.map._floorCanvas.width + 200, this.map._floorCanvas.height + 200 );
			}
			else {
				this.floor.clearRect(-100,-100,this.map._floorCanvas.width + 200, this.map._floorCanvas.height + 200 );
			}
		},
		_clearLayerWGL:function( layer ){
			layer.clearRect(-100,-100,this.map._floorCanvas.width + 200, this.map._floorCanvas.height + 200 );
		},
		_drawFloorTileWGL:function( id, x, y ){

		},
		_drawFloor2TileWGL:function( id, x, y, ix, iy ){

		},
		_drawItemTileWGL:function( id, x, y, ix, iy ){

		},
		_drawTileIdxWGL:function( YI, Xi, x, y ){

		},
		_drawMovableWGL:function( m ){

		},
		_drawImageWGL:function( image, gl ) {

		},
		/* All canvas.context translations must be done be this function! */
		setMapMoveTranslate:function( x, y )
		{
			this.xCanvasTranslateAmount += x;
			this.yCanvasTranslateAmount += y;

			 this.floor.translate( x, y );
			 this.floor2.translate( x, y );
			 this.item.translate( x, y );
			 if( this.info )
			 	this.info.translate( x, y );
			this.cropChanged = true;
			
			//TODO pass canvas-id's to this class
			/*$("#iso_item").attr( "style", "position:absolute; top:"+this.yCanvasTranslateAmount+"px; left:"+this.xCanvasTranslateAmount+"px");
			$("#iso_floor").attr( "style", "position:absolute; top:"+this.yCanvasTranslateAmount+"px; left:"+this.xCanvasTranslateAmount+"px");
			$("#iso_floor2").attr( "style", "position:absolute; top:"+this.yCanvasTranslateAmount+"px; left:"+this.xCanvasTranslateAmount+"px");*/
			
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
				//this.draw();
			}
		},
		_updateCropTranslate:function() {
			this.xCropTranslate = this.crop.x * this.map._bytes.tw;
			this.yCropTranslate = this.crop.y * this.map._bytes.thh;
		},
		_getUniqueSliceId:function(){
			this.uniqueSliceId ++;
			return this.uniqueSliceId;
		},

		// === sub-slice functionality ==== //
		// === creates sub-slices from slices that are wider then tilewidth === //
		_subSliceSlices:function() {
			var subSlices  = { };
			for( var i in this.slices ) {
				if( this.slices[i]._subslice ){
					var ss = this._subSliceH( this.slices[i] );
					if( ss ) {
						subSlices[ ""+this.slices[i]._id ] = ss;
					}
				}
			}
			return subSlices;
		},
		_subSliceH:function( s ) {
			var tw = this.bytes.tw;
			var th = this.bytes.th;
			var thh = this.bytes.thh;
			/*
			 _h: 240
			 _id: 98
			 _ox: 142
			 _oy: 226
			 _type: 2
			 _w: 219
			 _x: 0
			 _y: 296
			 */

			var subslices = { right:[], middle:null,  left:[] };
			// check right side
			if( s._w - s._ox > th ) {
				subslices.middle = this._makeMiddleSubSlice( s );
				var overR = s._w - s._ox - th;
				var y = s._oy - thh;
				for( var x = th; x<overR; x += th ){
					//make subslice
					var sr = {
						_h: s._h,
						_w:th,
						_id:this._getUniqueSliceId(),
						_ox:0,
						_oy:y,
						_x: s._x + s._ox + x,
						_y: s._y
					}
					y -= thh;
					subslices.right.push( sr );
				}
				//right rest slice:
				var rrest = Math.abs( overR-x+th );
				if( rrest>0 ) {
					var sr = {
						_h: s._h,
						_w:rrest,
						_id:this._getUniqueSliceId(),
						_ox:0,
						_oy:y,
						_x: s._x + s._ox + x, // - rrest,
						_y: s._y
					}
					subslices.right.push( sr );
				}
			}
			// check left side
			if( s._ox > th  ) {
				if( !subslices.middle ) {
					 subslices.middle = this._makeMiddleSubSlice( s );
				}
				var overL = -( s._ox - th );
				var y = s._oy - thh;
				for( var x=-th; x > overL; x-=th ) {
					//make subslice
					var sr = {
						_h: s._h,
						_w:th,
						_id:this._getUniqueSliceId(),
						_ox:th,
						_oy:y,
						_x: s._x + s._ox + x -th,
						_y: s._y
					}
					y -= thh;
					subslices.left.push( sr );
				}
				//left rest slice:
				x += th; // set last x back one step
				var lrest = Math.abs( overL - x );
				if( lrest>0 ) {
					var sr = {
						_h: s._h,
						_w:lrest,
						_id:this._getUniqueSliceId(),
						_ox:lrest,
						_oy:y,
						_x: s._x,
						_y: s._y
					}
					subslices.left.push( sr );
				}

			}
			if( s._id == 91 ) {
				console.log( 'foo' );
			}

			if( subslices.right.length > 0 || subslices.left.length > 0 ){
				return subslices;
			}
			return null;
		},
		_makeMiddleSubSlice:function( s ) {
			var tw = this.bytes.tw;
			var th = this.bytes.th;
			var sr = {
				_h: s._h,
				_w:tw,
				_id: s._id,
				_ox:th,
				_oy: s._oy,
				_x: s._x + s._ox - th,
				_y: s._y
			}
			return sr;
		},
		_replaceSubSlicesInMapData:function(){
			for( var i in this.subSlices ){
				var ss = this.subSlices[i];
				// replace middle subslice with old slice
				this.slices[ i ] = ss.middle;
				// scan thru mapbytes

				for( var iy = 0; iy<this.bytes.data.rows; iy++ )
				{
					for( var ix=0;ix<this.bytes.data.cols; ix++ )
					{
						var iyodd = 0;
						if( this.bytes.tileExcists(iy,ix)==true )
						{
							this.bytes.movePosTo(iy,ix);
							var iid = this.bytes.getItemId();
							if( iid==i ){
								// draw left subslices
								var ciy = iy; var cix = ix;
								for( var li=0; li<ss.left.length; li++ ){
									// get left-up indexes
									iyodd = ciy%2;
									ciy--;
									if( iyodd ){ cix--; }
									this.bytes.movePosTo( ciy, cix );
									this.bytes.setItemId( ss.left[li]._id );
									this.slices[ ss.left[li]._id ] = ss.left[li];
								}
								// draw right sublices
								var ciy = iy; var cix = ix;
								for( var ri=0; ri<ss.right.length; ri++ ){
									// get right-up indexes
									iyodd = ciy%2;
									ciy--;
									if( !iyodd ){ cix++; }
									this.bytes.movePosTo( ciy, cix );
									this.bytes.setItemId( ss.right[ri]._id );
									this.slices[ ss.right[ri]._id ] = ss.right[ri];
								}
							}
						}
					}
				}
			}
		}
	}
	return TilePainter;
}());


isogame.TilePainter.drawNumber = function( bd, nr, x, y, alignleft ) {
	var i;
	if( nr > 9 ){
		var nrstr = "";
		nrstr += nr;
		var w = 5;
		var xadjust = 0;
		if( alignleft )
			xadjust = -(nrstr.length-1)*w;
		for( var i=0; i<nrstr.length; i++ ) {
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
