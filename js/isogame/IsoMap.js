/**
 * Created with JetBrains WebStorm.
 * User: peter
 * Date: 4/18/13
 * Time: 4:37 PM
 * To change this template use File | Settings | File Templates.
 */

// 6:

isogame.IsoMap = (function(){
    /* io:
        mapData : json map data
        div : div to append canvas-elements in
        cwidth : canvas width
        cheight : canvas height
        mapCrop : { x, y, width, height } map crop, may be null
        mapOffset : { x, y } ( only used in unCropped maps )
        debug : boolean ( currently only shows tile-indexes )

        ## if you want to create canvases outside for some reason : ##
        floorCanvas : 
        floor2Canvas :
        itemCanvas :
        mouseCanvas :
        m2tCanvas :
        ## or if not, don't define them ##
    */
    function IsoMap( io ) { 
        var me = 'IsoMap.setNewData::';
        if( !io.mapData ){ throw new Error( me+'please specify io.mapData ( json map data )'); }
        if( !io.div ) { throw new Error( me+'please specify a root div to append iso canvases in'); }
		if( !io.cwidth ) { throw new Error( me+'please specify a canvas width'); }
		if( !io.cheight ) { throw new Error( me+'please specify a canvas height'); }
        this._data = io.mapData;
        this._bytes = new isogame.MapBytes( io.mapData );
        this._div = io.div;
        this._cwidth = io.cwidth;
        this._cheight = io.cheight;
        this._crop = io.mapCrop;
        this._offset = io.mapOffset; // only use in uncropped map!
		this._backgroundClr = io.backgroundClr;

        // assign | create needed canvasses
        var w = 100; var h = 100;
        if( io.m2tCanvas ){
            this._m2tCanvas = io.m2tCanvas;
            this._m2tCanvas.style.width = io.mapData.tileWidth+'px'; 
            this._m2tCanvas.style.height = (io.mapData.tileWidth/2)+'px';
        } else {
            this._m2tCanvas = this._createCanvasLayer(      "iso_m2t",      
                io.mapData.tileWidth, io.mapData.tileWidth/2 ); this._m2tCanvas.style.visibility = "hidden";
        }
        if( io.floorCanvas ){
            this._floorCanvas = io.floorCanvas;
        } else {
            this._floorCanvas = this._createCanvasLayer(    "iso_floor",    this._cwidth, this._cheight );
        }
        if( io.floor2Canvas ){
            this._floor2Canvas = io.floor2Canvas;
        } else {
            this._floor2Canvas = this._createCanvasLayer(   "iso_floor2",   this._cwidth, this._cheight );
        }
        if( io.itemCanvas ){
            this._itemCanvas = io.itemCanvas;
        } else {
            this._itemCanvas = this._createCanvasLayer(     "iso_item",     this._cwidth, this._cheight );
        }
        if( io.mouseCanvas ){
            this._mouseLyr = io.mouseCanvas;
        } else {
            this._mouseLyr = this._createCanvasLayer(       "iso_mouse",    this._cwidth, this._cheight );
        }
        if( io.infoCanvas ){
            this._infoCanvas = io.infoCanvas;
        }
        else if( io.debug ){
            this._infoCanvas = this._createCanvasLayer(     "iso_info",     this._cwidth, this._cheight );
        }
        var ca = [ this._floorCanvas, this._floor2Canvas, this._itemCanvas, this._mouseLyr, this._infoCanvas, this.infoCanvas ];
        for( var i = 0 ; i<ca.length; i++ ){
            var c = ca[i];
            if( c ){
                c.width = this._cwidth; c.height = this._cheight;
                c.style.width = this._cwidth+'px'; c.style.height = this._cheight+'px';
            }
        }

        // fill mouse body with transparent fill
        var cxt = this._mouseLyr.getContext( '2d' );
        cxt.fillRect( 0,0,cxt.width, cxt.height );
        var m2tio = {
            tw:io.mapData.tileWidth, 
            rows:io.mapData.rows, 
            cols:io.mapData.cols,
            canvas:this._m2tCanvas
        }
        if( !this._crop && this._offset )
            m2tio.offset = this._offset;
        this._m2t = new isogame.Mouse2Tile( m2tio );

        this._image = new Image();
        this._spriteManager = new isogame.SpriteManager( this );
        this._tilePainter = new isogame.TilePainter( this, this._infoCanvas!=null, this._backgroundClr );
        this._firstPerson = null; // to be set
    }
    IsoMap.prototype =  {
        _createCanvasLayer:function( id , w, h ) /* > Canvas-element */ {
            var c = document.createElement('canvas');
            this._div.appendChild(c);
            c.style.position = "absolute";
            c.id = id; c.width = w; c.height = h;
            return c;
        },
        setup:function() {
            // load map graphics
            this._imageLoaded = false;
            var self = this;
            this._image.onload = function()
            {
                // wait till img is really there
                var id = setInterval( function(){
                    if( self._image.width>0 ){
                        clearInterval( id );
                        self._imageLoaded = true;
                        self._tilePainter.drawUnCroppedMap();
                        self.onReady();
                    }
                }, 40 );
            }
            if( this._data.grpxPrefix )
                this._image.src = this._data.grpxPrefix+this._data.graphics;
            else
                this._image.src = this._data.graphics;
        },
		setupSync:function( img ){
			// no need to preload img ourselves now
			if( !img ){
				throw( new Error( "isogame.IsoMap.setupSync: no img specified!! "));
			}
			if( !img.width>0 ){
				throw( new Error( "isogame.IsoMap.setupSync: img is not fully loaded!! "));
			}
			this._imageLoaded = true;
			this._image = img;
			this._tilePainter.image = this._image;
			if( this._crop ){
				this._tilePainter.draw();
			}
			else {
				this._tilePainter.drawUnCroppedMap();
			}
		},
        destroy:function(){
            // remove canvases
            this._div.removeChild( this._floorCanvas );
            this._div.removeChild( this._floor2Canvas );
            this._div.removeChild( this._itemCanvas );
            this._div.removeChild( this._mouseLyr );
            this._div.removeChild( this._m2tCanvas );
            if( this._infoCanvas )
                this._div.removeChild( this._infoCanvas );
        },
        restoreGraphicLayers:function(){
            this._tilePainter.restoreGraphicLayers();
        },
        getCanvasses:function(){
            var o = {};
            o.floor = this._floorCanvas;
            o.floor2 = this._floor2Canvas;
            o.item = this._itemCanvas;
            o.mouse = this._mouseLyr;
            o.m2t = this._m2tCanvas;
            if( this._infoCanvas )
                o._infoCanvas;
            return o;
        },
        addMovable:function( m, xi, yi, moveSpeed ) {
            m.initialYindex = m.Yindex = yi;
            m.initialXindex = m.Xindex = xi;
            this._spriteManager.add( m );
        },
        removeMovable:function( m ){
            this._spriteManager.remove( m );
        },
        onReady:function(){ /** called whenn map is fully initiated **/ },
        //update data
        update:function(){
            this._spriteManager.update();
        },
        //draw data
        draw:function( drawInfoCanvas ){
            this._tilePainter.draw( drawInfoCanvas );
		},
		getMapOffset:function(){

			// if not scrollable
			if( this._offset )
				return this._offset;

			// return cropped offset
			return {
				x:-this._tilePainter.xCropTranslate - this._tilePainter.xCanvasTranslateAmount + this._tilePainter.md*2,
				y:-this._tilePainter.yCropTranslate - this._tilePainter.yCanvasTranslateAmount
			};

		}
    }

    return IsoMap;
}());
