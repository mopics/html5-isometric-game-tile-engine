/**
 * Created with JetBrains WebStorm.
 * User: peter
 * Date: 4/18/13
 * Time: 4:35 PM
 * To change this template use File | Settings | File Templates.
 */

// 3 : isogame package


isogame.TilePainter = (function(){
    function TilePainter( isomap, drawInfoCanvas )
    {
        this.drawInfoCanvas = drawInfoCanvas;
        this.map = isomap;
        this.th = this.map._bytes.th;
        this.thh = this.map._bytes.thh;
        this.image = isomap._image;
        this.floor = isomap._floorCanvas.getContext('2d');
        this.floor2 = isomap._floor2Canvas.getContext('2d');
        this.item  = isomap._itemCanvas.getContext('2d');
        if( isomap._infoCanvas )
            this.info  = isomap._infoCanvas.getContext('2d');
        this.bytes = isomap._bytes;
        // sort order on slice._id - for easy access
        this.slices = [];
        for( var i=0; i<isomap._data.slices.length; i++ ){
            var slice = isomap._data.slices[i];
            this.slices[ slice._id ] = slice;
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
    }
    TilePainter.prototype = {
        restoreGraphicLayers:function(){
            this.floor.restore();
            this.floor2.restore();
            this.item.restore();
        },
        drawUnCroppedMap:function(){
            if( this.cropChanged ) // if crop changed redraw floor-tiles also
            {
                this.floor.clearRect( 0,0,this.map._floorCanvas.width, this.map._floorCanvas.height );
                this.floor2.clearRect( 0,0,this.map._floor2Canvas.width, this.map._floor2Canvas.height );
                if( this.drawInfoCanvas ){
                    this.info.clearRect( 0,0,this.map._infoCanvas.width, this.map._infoCanvas.height );
                }
            }
            //always redraw item-tiles & movable-sprites
            this.item.clearRect( 0,0,this.map._floorCanvas.width, this.map._floorCanvas.height );
            this.floor.restore();
            this.floor2.restore();

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
                                this._drawFloor2Tile(f2, x, y );
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
                this.floor.clearRect(-this.xCanvasTranslateAmount,-this.yCanvasTranslateAmount,this.map._floorCanvas.width, this.map._floorCanvas.height );
                this.floor2.clearRect( -this.xCanvasTranslateAmount,-this.yCanvasTranslateAmount,this.map._floor2Canvas.width, this.map._floor2Canvas.height );
                if( this.drawInfoCanvas ){
                    this.info.clearRect( -this.xCanvasTranslateAmount,-this.yCanvasTranslateAmount,this.map._infoCanvas.width, this.map._infoCanvas.height );
                }
            }
            //always redraw item-tiles & movable-sprites
            this.item.clearRect( -this.xCanvasTranslateAmount,-this.yCanvasTranslateAmount,this.map._floorCanvas.width, this.map._floorCanvas.height );
			this.item.restore();
			this.floor.restore();
            this.floor2.restore();
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
                        var f2 = this.bytes.getFloor2Id();
                        var it= this.bytes.getItemId();

                        if( this.cropChanged )
                        {
                            if( f>-1 )
                                this._drawFloorTile(f,x,y);
                            if( f2>-1 )
                                this._drawFloor2Tile(f2, x, y );
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
            this.floor.drawImage( this.image, slice._x, slice._y, slice._w, slice._h, x-slice._ox+this.th, y-slice._oy+this.thh, slice._w, slice._h );
        },
        _drawFloor2Tile:function( id, x, y ){
            if(!this.slices[id]) return;
            var slice = this.slices[id];
            this.floor2.drawImage( this.image, slice._x, slice._y, slice._w, slice._h, x-slice._ox+this.th, y-slice._oy+this.thh, slice._w, slice._h );
        },
        _drawItemTile:function( id, x, y )
        {
            if(!this.slices[id]) return;
            var slice = this.slices[id];
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

            if( this.map._crop ){
                m.mapX -= this.xCropTranslate;// + this.xMoveMapTranslate;
                m.mapY -= this.yCropTranslate;// + this.yMoveMapTranslate;
            }
            else if( this.offset ) {
                m.mapX  += this.offset.x;
                m.mapY  += this.offset.y;
            }
            m.draw( this.item, m.mapX, m.mapY );
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
