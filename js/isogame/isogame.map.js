if (! ('isogame' in this)) {
    this.isogame = {};
}

dojo.declare( 'isogame.IsoMap', null, {
	constructor:function( mapData, cropRect, floorCanvas, itemCanvas, m2tCanvas, infoCanvas )
	{
		this._data = mapData;
		this._bytes = new isogame.MapBytes( mapData );
		this._crop = cropRect;
		this._floorCanvas = floorCanvas;
		this._itemCanvas = itemCanvas;
		this._infoCanvas = infoCanvas;
		this._m2tCanvas = m2tCanvas;
		this._m2t = new isogame.Mouse2Tile( mapData.tileWidth, mapData.rows, mapData.cols, m2tCanvas.getContext('2d') );
		this._image = new Image();
		this._spriteManager = new isogame.SpriteManager( this );
		this._tilePainter = new isogame.TilePainter( this, this._infoCanvas!=null );
		this._firstPerson = null; // to be set
	},
	setup:function(){
		//load map graphics
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
	},
	
});

dojo.declare( 'isogame.MapBytes', null,{
	constructor:function( data )
	{
		this.data = data;
		this.actions = new Array();
		this.passActions = new Array();
		this.obstructs = new Array();
		this.coords = new Array();
		this.floorIds = new Array();
		this.itemIds = new Array();
		this.mapIndexes = new Array();
		
		
		this.position = 0;
		this.tw = this.data.tileWidth;
		this.th = this.tw/2;
		this.thh = this.th/2;
		this._createBytes();
	},
	_createBytes:function()
	{
		// create empty tile bytes 
		for(var yi=0;yi<this.data.rows;yi++)
		{
			if( yi!=0 )//dont create top tiles
			{
				for(var xi=0;xi<this.data.cols;xi++)
				{
					var addX=0;
					if(yi%2==0)
						addX = this.tw/2;
					if( xi==0 && addX==0  )
					{
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
						/*this.writeBoolean(false);//up
						this.writeBoolean(false);//right-up
						this.writeBoolean(false);//right
						this.writeBoolean(false);//right-down
						this.writeBoolean(false);//down
						this.writeBoolean(false);//left-down
						this.writeBoolean(false);//left
						this.writeBoolean(false);//left-up
						*/
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
			{
				this.floorIds[this.position] = tile._floorid;
				this.obstructs[this.position] = false;
			}
			if( typeof tile._itemid != 'undefined' )
			{
				this.itemIds[this.position]  = tile._itemid;
				this.obstructs[this.position] = true;
			}
			if( typeof tile._action != 'undefined' )
				this.actions[this.position]  = tile._action;
			if( typeof tile._passaction != 'undefined' )
				this.passActions[this.position] = tile._passaction;
			if( typeof tile._obstruct != 'undefined' )
				this.obstructs[this.position] = tile._obstruct;
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
});

dojo.declare('isogame.Mouse2Tile', null, {
	constructor:function( tw, rows, cols, context ) {
		this.TOPLEFT = "#ff0000";
		this.TOPRIGHT = "#00ff00";
		this.BOTLEFT = "#0000ff";
		this.BOTRIGHT = "#ff00ff";
		this.cols = cols;
		this.rows = rows;
		this.tw = tw;
		this.th = this.tw/2;
		this.thh = this.th/2;
		this.context = context;
		
		//TODO: draw topleft triangle
		context.fillStyle = "#000000";
		context.fillRect(0,0,this.tw, this.th );
		
		context.strokeStyle = this.TOPLEFT;
		context.fillStyle = this.TOPLEFT;
		context.beginPath();
		context.moveTo(this.th,0);
		context.lineTo( 0,this.thh );
		context.lineTo( 0, 0 );
		context.closePath();
		//context.stroke();
		context.fill();
		context.fillStyle = this.TOPRIGHT;
		context.beginPath();
		context.moveTo(this.th,0);
		context.lineTo( this.tw,this.thh );
		context.lineTo( this.tw, 0 );
		context.closePath();
		context.fill();
		context.fillStyle = this.BOTLEFT;
		context.beginPath();
		context.moveTo(this.th,this.th);
		context.lineTo( 0,this.thh );
		context.lineTo( 0, this.th );
		context.closePath();
		context.fill();
		context.fillStyle = this.BOTRIGHT;
		context.beginPath();
		context.moveTo(this.th,this.th);
		context.lineTo( this.tw,this.thh );
		context.lineTo( this.tw, this.th );
		context.closePath();
		context.fill();
	},
	getIndexes:function( xm, ym ) { // returns geom.Point containing tile map-indexes
		var fyIsOdd = false;
		
		var yr  = (ym)%this.thh;
		var fmy = (ym)-yr;
		var fy  = Math.round((fmy)/this.thh);
		
		var xr  = (xm)%this.tw;
		var fmx = (xm)-xr;
		var fx  = Math.round(fmx/this.tw);
		
		if( fy%2==1 ) {
			fyIsOdd = true;
			if( xr>=th )
				fx += 1;
		}
		//to do check trhu bmp
		if(fyIsOdd) {
			if( xr<this.th )
				imgd = this.context.getImageData(Math.round(xr)-th+this.tw,Math.round(yr)+this.thh, 1, 1);
			else
				imgd = this.context.getImageData(Math.round(xr)-this.th,Math.round(yr)+this.thh, 1, 1);
		}
		else
			imgd = this.context.getImageData(Math.round(xr),Math.round(yr)+this.thh, 1, 1);
		
		var pixelClr = imgd.data;
			
		if(pixelClr==this.TOPLEFT) {
			fy -= 1;
		}
		else if(pixelClr==this.BOTRIGHT) {
			if(!fyIsOdd)
				fx += 1;
			fy += 1;
		}
		else if(pixelClr==this.BOTLEFT) {
			if(fyIsOdd)
				fx -= 1;
			fy += 1;
		}
		//to do check wether index exists
//			if(fy%2==1 && fx==0)
//				return null;
//			if( fy==0 || fx > cols-1 || fy>rows-1)
//				return null;
		// reverse : from indexes to pix coords
		
		return new geom.Point(fx,fy);
	}
});
